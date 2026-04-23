// Email Marketing Campaign Management
// Integration with Resend, SendGrid, or custom SMTP

import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { addJob } from './queue';

interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  from: string;
  fromName: string;
  template: string;
  content: {
    html?: string;
    text?: string;
  };
  recipients: {
    type: 'all' | 'segment' | 'manual';
    segmentId?: string;
    emails?: string[];
  };
  scheduling: {
    sendImmediately: boolean;
    scheduledAt?: Date;
    timezone: string;
  };
  tracking: {
    trackOpens: boolean;
    trackClicks: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  abTest?: {
    enabled: boolean;
    subjectVariants?: string[];
    contentVariants?: string[];
    splitPercentage: number; // 10-50%
    winnerAfter: number; // hours
    winnerMetric: 'opens' | 'clicks';
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

interface EmailSegment {
  id: string;
  tenantId: string;
  name: string;
  criteria: {
    totalSpent?: { min?: number; max?: number };
    orderCount?: { min?: number; max?: number };
    lastOrder?: { after?: Date; before?: Date };
    platforms?: string[];
    tags?: string[];
  };
  count: number;
}

// Initialize email provider
const resend = new Resend(process.env.RESEND_API_KEY);

// Create campaign
export async function createCampaign(
  data: Omit<Campaign, 'id' | 'status' | 'stats'>
): Promise<Campaign> {
  const campaign = await prisma.campaign.create({
    data: {
      ...data,
      recipients: JSON.stringify(data.recipients),
      scheduling: JSON.stringify(data.scheduling),
      tracking: JSON.stringify(data.tracking),
      abTest: data.abTest ? JSON.stringify(data.abTest) : null,
      status: data.scheduling.sendImmediately ? 'scheduled' : 'draft',
      stats: JSON.stringify({
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      }),
    },
  });

  return formatCampaign(campaign);
}

// Schedule campaign
export async function scheduleCampaign(
  campaignId: string,
  tenantId: string,
  scheduledAt: Date
): Promise<void> {
  await prisma.campaign.update({
    where: { id: campaignId, tenantId },
    data: {
      status: 'scheduled',
      scheduling: JSON.stringify({
        sendImmediately: false,
        scheduledAt,
        timezone: 'Europe/Istanbul',
      }),
    },
  });

  // Schedule job
  const delay = scheduledAt.getTime() - Date.now();
  if (delay > 0) {
    await addJob(
      'email.send',
      {
        tenantId,
        payload: { campaignId },
      },
      { delay }
    );
  }
}

// Send campaign immediately
export async function sendCampaign(
  campaignId: string,
  tenantId: string
): Promise<void> {
  const campaign = await getCampaign(campaignId, tenantId);
  if (!campaign) throw new Error('Campaign not found');

  // Update status
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'sending' },
  });

  // Get recipients
  const recipients = await getRecipients(campaign, tenantId);

  // Handle A/B test
  if (campaign.abTest?.enabled && recipients.length > 100) {
    await sendABTestCampaign(campaign, recipients, tenantId);
  } else {
    await sendBulkEmails(campaign, recipients, tenantId);
  }

  // Update status
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'sent' },
  });
}

// Send A/B test campaign
async function sendABTestCampaign(
  campaign: Campaign,
  recipients: string[],
  tenantId: string
): Promise<void> {
  const abTest = campaign.abTest!;
  const testSize = Math.floor(recipients.length * (abTest.splitPercentage / 100));
  
  // Split recipients
  const shuffled = [...recipients].sort(() => Math.random() - 0.5);
  const testGroup = shuffled.slice(0, testSize);
  const controlGroup = shuffled.slice(testSize);

  // Send test variants
  if (abTest.subjectVariants && abTest.subjectVariants.length > 1) {
    const variantSize = Math.floor(testSize / abTest.subjectVariants.length);
    
    for (let i = 0; i < abTest.subjectVariants.length; i++) {
      const variantRecipients = testGroup.slice(i * variantSize, (i + 1) * variantSize);
      await sendBulkEmails(
        { ...campaign, subject: abTest.subjectVariants[i] },
        variantRecipients,
        tenantId,
        `variant_${i}`
      );
    }
  }

  // Wait for winner, then send to control group
  await scheduleWinnerSend(campaign, controlGroup, tenantId);
}

// Schedule winner send
async function scheduleWinnerSend(
  campaign: Campaign,
  recipients: string[],
  tenantId: string
): Promise<void> {
  const delay = (campaign.abTest?.winnerAfter || 4) * 3600 * 1000; // hours to ms
  
  await addJob(
    'email.send',
    {
      tenantId,
      payload: {
        campaignId: campaign.id,
        recipients,
        determineWinner: true,
      },
    },
    { delay }
  );
}

// Send bulk emails
async function sendBulkEmails(
  campaign: Campaign,
  recipients: string[],
  tenantId: string,
  variant?: string
): Promise<void> {
  const batchSize = 100;
  const batches = chunkArray(recipients, batchSize);

  for (const batch of batches) {
    await addJob(
      'email.send',
      {
        tenantId,
        payload: {
          campaignId: campaign.id,
          recipients: batch,
          variant,
        },
      }
    );
  }
}

// Create email segment
export async function createSegment(
  data: Omit<EmailSegment, 'id' | 'count'>
): Promise<EmailSegment> {
  // Calculate count based on criteria
  const count = await calculateSegmentCount(data.tenantId, data.criteria);

  const segment = await prisma.emailSegment.create({
    data: {
      ...data,
      criteria: JSON.stringify(data.criteria),
      count,
    },
  });

  return {
    ...segment,
    criteria: JSON.parse(segment.criteria as string),
  };
}

// Calculate segment size
async function calculateSegmentCount(
  tenantId: string,
  criteria: EmailSegment['criteria']
): Promise<number> {
  const where: Record<string, unknown> = { tenantId };

  if (criteria.totalSpent) {
    if (criteria.totalSpent.min !== undefined) {
      // Would need orders aggregation
    }
  }

  // Simplified: return unique customer email count
  const orders = await prisma.order.findMany({
    where: { tenantId },
    distinct: ['customerEmail'],
    select: { customerEmail: true },
  });

  return orders.filter(o => o.customerEmail).length;
}

// Get segment recipients
async function getSegmentRecipients(
  segmentId: string,
  tenantId: string
): Promise<string[]> {
  const segment = await prisma.emailSegment.findFirst({
    where: { id: segmentId, tenantId },
  });

  if (!segment) return [];

  const criteria = JSON.parse(segment.criteria as string) as EmailSegment['criteria'];

  // Build query based on criteria
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      ...(criteria.lastOrder?.after && {
        orderDate: { gte: criteria.lastOrder.after },
      }),
      ...(criteria.platforms?.length && {
        platform: { in: criteria.platforms },
      }),
    },
    distinct: ['customerEmail'],
    select: { customerEmail: true },
  });

  return orders
    .map(o => o.customerEmail)
    .filter((email): email is string => !!email);
}

// Get recipients for campaign
async function getRecipients(
  campaign: Campaign,
  tenantId: string
): Promise<string[]> {
  if (campaign.recipients.type === 'manual' && campaign.recipients.emails) {
    return campaign.recipients.emails;
  }

  if (campaign.recipients.type === 'segment' && campaign.recipients.segmentId) {
    return getSegmentRecipients(campaign.recipients.segmentId, tenantId);
  }

  if (campaign.recipients.type === 'all') {
    const orders = await prisma.order.findMany({
      where: { tenantId },
      distinct: ['customerEmail'],
      select: { customerEmail: true },
    });
    return orders.map(o => o.customerEmail).filter(Boolean) as string[];
  }

  return [];
}

// Track email open
export async function trackEmailOpen(
  campaignId: string,
  recipientEmail: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await prisma.emailEvent.create({
    data: {
      campaignId,
      recipientEmail,
      type: 'open',
      metadata: JSON.stringify(metadata),
    },
  });

  // Update stats
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (campaign) {
    const stats = JSON.parse(campaign.stats as string);
    stats.opened += 1;
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { stats: JSON.stringify(stats) },
    });
  }
}

// Track email click
export async function trackEmailClick(
  campaignId: string,
  recipientEmail: string,
  url: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await prisma.emailEvent.create({
    data: {
      campaignId,
      recipientEmail,
      type: 'click',
      url,
      metadata: JSON.stringify(metadata),
    },
  });

  // Update stats
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (campaign) {
    const stats = JSON.parse(campaign.stats as string);
    stats.clicked += 1;
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { stats: JSON.stringify(stats) },
    });
  }
}

// Get campaign stats
export async function getCampaignStats(
  campaignId: string,
  tenantId: string
): Promise<Campaign['stats'] & {
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
}> {
  const campaign = await getCampaign(campaignId, tenantId);
  if (!campaign) throw new Error('Campaign not found');

  const stats = campaign.stats;
  const openRate = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
  const clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0;
  const clickToOpenRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;

  return {
    ...stats,
    openRate: Math.round(openRate * 100) / 100,
    clickRate: Math.round(clickRate * 100) / 100,
    clickToOpenRate: Math.round(clickToOpenRate * 100) / 100,
  };
}

// Helper functions
async function getCampaign(id: string, tenantId: string): Promise<Campaign | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { id, tenantId },
  });

  if (!campaign) return null;

  return formatCampaign(campaign);
}

function formatCampaign(campaign: any): Campaign {
  return {
    ...campaign,
    recipients: JSON.parse(campaign.recipients),
    scheduling: JSON.parse(campaign.scheduling),
    tracking: JSON.parse(campaign.tracking),
    abTest: campaign.abTest ? JSON.parse(campaign.abTest) : undefined,
    stats: JSON.parse(campaign.stats),
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Email templates
export const emailTemplates = {
  welcome: (data: { name: string; loginUrl: string }) => ({
    subject: 'Hoşgeldiniz! 🎉',
    html: `
      <h1>Merhaba ${data.name}!</h1>
      <p>PazarYönetimi'ne hoşgeldiniz. Siparişlerinizi yönetmeye başlamak için tıklayın:</p>
      <a href="${data.loginUrl}" style="padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Panele Git</a>
    `,
  }),
  
  abandonedCart: (data: { items: string[]; cartUrl: string; discountCode?: string }) => ({
    subject: 'Sepetinizi unuttunuz 🛒',
    html: `
      <h1>Sepetinizi tamamlayın</h1>
      <ul>${data.items.map(item => `<li>${item}</li>`).join('')}</ul>
      ${data.discountCode ? `<p>İndirim kodu: <strong>${data.discountCode}</strong></p>` : ''}
      <a href="${data.cartUrl}">Siparişi Tamamla</a>
    `,
  }),
  
  orderConfirmation: (data: { orderId: string; items: string[]; total: number }) => ({
    subject: `Siparişiniz Alındı #${data.orderId}`,
    html: `
      <h1>Siparişiniz için teşekkürler!</h1>
      <p>Sipariş No: ${data.orderId}</p>
      <ul>${data.items.map(item => `<li>${item}</li>`).join('')}</ul>
      <p>Toplam: ₺${data.total}</p>
    `,
  }),
  
  lowStockAlert: (data: { productName: string; currentStock: number }) => ({
    subject: `⚠️ Düşük Stok Uyarısı: ${data.productName}`,
    html: `
      <h1>Stok Uyarısı</h1>
      <p><strong>${data.productName}</strong> ürününün stoku azaldı.</p>
      <p>Kalan Stok: ${data.currentStock}</p>
    `,
  }),
  
  weeklyReport: (data: { 
    weekRange: string; 
    totalSales: number; 
    orderCount: number;
    topProducts: string[];
  }) => ({
    subject: `Haftalık Rapor: ${data.weekRange}`,
    html: `
      <h1>Haftalık Satış Raporunuz</h1>
      <p>${data.weekRange}</p>
      <table>
        <tr><td>Toplam Satış:</td><td>₺${data.totalSales}</td></tr>
        <tr><td>Sipariş Sayısı:</td><td>${data.orderCount}</td></tr>
      </table>
      <h2>Çok Satanlar</h2>
      <ul>${data.topProducts.map(p => `<li>${p}</li>`).join('')}</ul>
    `,
  }),
};

export type { Campaign, EmailSegment };
