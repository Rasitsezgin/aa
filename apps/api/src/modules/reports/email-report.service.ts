import { Injectable } from '@nestjs/common';
import { ReportsService, ReportData, ReportPeriod, PlanType } from './reports.service';

@Injectable()
export class EmailReportService {
  constructor(private reportsService: ReportsService) {}

  /**
   * Rapor e-postası gönder
   */
  async sendReportEmail(
    email: string,
    storeId: string,
    period: ReportPeriod,
    planType: PlanType
  ): Promise<{ success: boolean; messageId?: string }> {
    const report = await this.reportsService.generateReport(storeId, period, planType);
    const htmlContent = this.generateEmailTemplate(report);
    
    // Gerçek uygulamada e-posta servisi kullanılacak (SendGrid, AWS SES, vb.)
    console.log(`📧 Rapor e-postası gönderiliyor: ${email}`);
    console.log(`📊 Periyot: ${this.reportsService.getPeriodName(period)}`);
    
    // Simüle edilmiş gönderim
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * HTML e-posta şablonu oluştur
   */
  generateEmailTemplate(report: ReportData): string {
    const periodName = this.reportsService.getPeriodName(report.period);
    const formatDate = (date: Date) => date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    const formatCurrency = (value: number) => `₺${value.toLocaleString('tr-TR')}`;
    const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    const getChangeColor = (value: number) => value >= 0 ? '#10B981' : '#EF4444';
    const getChangeIcon = (value: number) => value >= 0 ? '↑' : '↓';

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.storeName} - ${periodName} Rapor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f3f4f6; color: #1f2937; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center; color: white; }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 16px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 20px; font-size: 14px; margin-top: 16px; }
    .content { background: white; padding: 30px; border-radius: 0 0 16px 16px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #E5E7EB; display: flex; align-items: center; gap: 8px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .stat-card { background: #F9FAFB; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E5E7EB; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1f2937; }
    .stat-label { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .stat-change { font-size: 13px; font-weight: 600; margin-top: 8px; }
    .marketplace-card { background: #F9FAFB; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #E5E7EB; }
    .marketplace-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .marketplace-name { font-weight: 700; font-size: 16px; }
    .marketplace-stats { display: flex; gap: 20px; font-size: 13px; color: #6B7280; }
    .product-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #E5E7EB; }
    .product-row:last-child { border-bottom: none; }
    .product-rank { width: 30px; height: 30px; background: #6366F1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; margin-right: 12px; }
    .product-info { flex: 1; }
    .product-name { font-weight: 600; font-size: 14px; }
    .product-sku { font-size: 12px; color: #6B7280; }
    .product-stats { text-align: right; }
    .product-revenue { font-weight: 700; color: #1f2937; }
    .product-sales { font-size: 12px; color: #6B7280; }
    .recommendation-card { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px; }
    .recommendation-card.high { background: #FEE2E2; border-left-color: #EF4444; }
    .recommendation-card.medium { background: #FEF3C7; border-left-color: #F59E0B; }
    .recommendation-card.low { background: #DBEAFE; border-left-color: #3B82F6; }
    .rec-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .rec-description { font-size: 13px; color: #4B5563; margin-bottom: 8px; }
    .rec-impact { font-size: 12px; color: #059669; font-weight: 600; }
    .alert-card { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .alert-title { color: #DC2626; font-weight: 600; font-size: 13px; }
    .alert-desc { color: #7F1D1D; font-size: 12px; }
    .category-bar { background: #E5E7EB; height: 8px; border-radius: 4px; margin: 8px 0; overflow: hidden; }
    .category-fill { height: 100%; border-radius: 4px; }
    .goal-card { display: flex; align-items: center; padding: 12px; background: #F9FAFB; border-radius: 8px; margin-bottom: 8px; }
    .goal-info { flex: 1; }
    .goal-name { font-weight: 600; font-size: 14px; }
    .goal-progress { font-size: 12px; color: #6B7280; }
    .goal-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .goal-badge.on_track { background: #D1FAE5; color: #059669; }
    .goal-badge.at_risk { background: #FEF3C7; color: #D97706; }
    .goal-badge.behind { background: #FEE2E2; color: #DC2626; }
    .footer { text-align: center; padding: 30px; color: #6B7280; font-size: 13px; }
    .footer-logo { font-weight: 700; color: #6366F1; font-size: 18px; margin-bottom: 8px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .divider { height: 1px; background: #E5E7EB; margin: 24px 0; }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr; }
      .marketplace-stats { flex-wrap: wrap; gap: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📊 ${report.storeName}</h1>
      <p>${periodName} Mağaza Analiz Raporu</p>
      <div class="badge">
        ${formatDate(report.startDate)} - ${formatDate(report.endDate)}
      </div>
    </div>

    <div class="content">
      <!-- Özet Metrikleri -->
      <div class="section">
        <h2 class="section-title">📈 Performans Özeti</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(report.summary.totalRevenue)}</div>
            <div class="stat-label">Toplam Gelir</div>
            <div class="stat-change" style="color: ${getChangeColor(report.summary.revenueChange)}">
              ${getChangeIcon(report.summary.revenueChange)} ${formatPercent(report.summary.revenueChange)} önceki döneme göre
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.summary.totalOrders.toLocaleString('tr-TR')}</div>
            <div class="stat-label">Toplam Sipariş</div>
            <div class="stat-change" style="color: ${getChangeColor(report.summary.ordersChange)}">
              ${getChangeIcon(report.summary.ordersChange)} ${formatPercent(report.summary.ordersChange)} önceki döneme göre
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(report.summary.avgOrderValue)}</div>
            <div class="stat-label">Ortalama Sipariş Değeri</div>
            <div class="stat-change" style="color: ${getChangeColor(report.summary.avgOrderChange)}">
              ${report.summary.avgOrderChange === 0 ? '→ Sabit' : `${getChangeIcon(report.summary.avgOrderChange)} ${formatPercent(report.summary.avgOrderChange)}`}
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">%${report.summary.conversionRate}</div>
            <div class="stat-label">Dönüşüm Oranı</div>
            <div class="stat-change" style="color: ${getChangeColor(report.summary.conversionChange)}">
              ${getChangeIcon(report.summary.conversionChange)} ${formatPercent(report.summary.conversionChange)} artış
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Pazaryeri Performansı -->
      <div class="section">
        <h2 class="section-title">🏪 Pazaryeri Performansı</h2>
        ${report.marketplaces.map(mp => `
          <div class="marketplace-card">
            <div class="marketplace-header">
              <div class="marketplace-name">${mp.name}</div>
              <div style="color: ${getChangeColor(mp.growth)}; font-weight: 600;">
                ${getChangeIcon(mp.growth)} ${formatPercent(mp.growth)}
              </div>
            </div>
            <div class="marketplace-stats">
              <span>💰 ${formatCurrency(mp.revenue)}</span>
              <span>📦 ${mp.orders} sipariş</span>
              <span>🏷️ ${mp.products} ürün</span>
              <span>⭐ ${mp.rating}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="divider"></div>

      <!-- En Çok Satan Ürünler -->
      <div class="section">
        <h2 class="section-title">🏆 En Çok Satan 10 Ürün</h2>
        ${report.topProducts.map(product => `
          <div class="product-row">
            <div class="product-rank">${product.rank}</div>
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-sku">${product.sku} • ${product.marketplace}</div>
            </div>
            <div class="product-stats">
              <div class="product-revenue">${formatCurrency(product.revenue)}</div>
              <div class="product-sales">${product.totalSales} adet satış</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="divider"></div>

      <!-- Kategori Performansı -->
      <div class="section">
        <h2 class="section-title">📂 Kategori Performansı</h2>
        ${report.categories.map((cat, i) => {
          const colors = ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF'];
          return `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${cat.name}</span>
                <span style="color: #6B7280;">${formatCurrency(cat.revenue)} (${cat.percentage}%)</span>
              </div>
              <div class="category-bar">
                <div class="category-fill" style="width: ${cat.percentage}%; background: ${colors[i % colors.length]};"></div>
              </div>
              <div style="font-size: 12px; color: ${getChangeColor(cat.growth)};">
                ${getChangeIcon(cat.growth)} ${formatPercent(cat.growth)} • ${cat.productCount} ürün
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="divider"></div>

      <!-- Stok Uyarıları -->
      ${report.inventory.alerts.length > 0 ? `
        <div class="section">
          <h2 class="section-title">⚠️ Stok Uyarıları</h2>
          ${report.inventory.alerts.map(alert => `
            <div class="alert-card">
              <div class="alert-title">🚨 ${alert.product}</div>
              <div class="alert-desc">
                Mevcut stok: ${alert.currentStock} adet • Günlük satış: ${alert.avgDailySales} adet • 
                <strong>${alert.daysUntilStockout} gün içinde tükenecek!</strong>
              </div>
            </div>
          `).join('')}
          <div style="margin-top: 16px; padding: 12px; background: #F9FAFB; border-radius: 8px; font-size: 13px;">
            📦 Toplam Stok Değeri: <strong>${formatCurrency(report.inventory.totalValue)}</strong> •
            Düşük Stok: <strong style="color: #F59E0B;">${report.inventory.lowStockCount}</strong> •
            Stokta Yok: <strong style="color: #EF4444;">${report.inventory.outOfStockCount}</strong>
          </div>
        </div>
        <div class="divider"></div>
      ` : ''}

      <!-- AI Önerileri -->
      <div class="section">
        <h2 class="section-title">🤖 AI Önerileri</h2>
        ${report.aiRecommendations.map(rec => `
          <div class="recommendation-card ${rec.priority}">
            <div class="rec-title">${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'} ${rec.title}</div>
            <div class="rec-description">${rec.description}</div>
            <div class="rec-impact">💡 ${rec.potentialImpact}</div>
          </div>
        `).join('')}
      </div>

      <div class="divider"></div>

      <!-- Hedefler -->
      <div class="section">
        <h2 class="section-title">🎯 Hedefler ve İlerleme</h2>
        ${report.goals.map(goal => `
          <div class="goal-card">
            <div class="goal-info">
              <div class="goal-name">${goal.name}</div>
              <div class="goal-progress">
                ${typeof goal.current === 'number' && goal.current > 100 
                  ? formatCurrency(goal.current) + ' / ' + formatCurrency(goal.target)
                  : goal.current + ' / ' + goal.target
                } (%${goal.percentage.toFixed(1)})
              </div>
            </div>
            <div class="goal-badge ${goal.status}">
              ${goal.status === 'on_track' ? '✅ Yolunda' : goal.status === 'at_risk' ? '⚠️ Risk' : '❌ Geride'}
            </div>
          </div>
        `).join('')}
      </div>

      ${report.customers ? `
        <div class="divider"></div>
        <!-- Müşteri Analizi (Kurumsal) -->
        <div class="section">
          <h2 class="section-title">👥 Müşteri Analizi</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${report.customers.newCustomers}</div>
              <div class="stat-label">Yeni Müşteri</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${report.customers.returningCustomers}</div>
              <div class="stat-label">Tekrar Eden Müşteri</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${formatCurrency(report.customers.avgLifetimeValue)}</div>
              <div class="stat-label">Ort. Müşteri Değeri</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">⭐ ${report.customers.satisfactionScore}</div>
              <div class="stat-label">Memnuniyet Skoru</div>
            </div>
          </div>
          <h3 style="margin-top: 20px; font-size: 14px; font-weight: 600;">🏅 En Değerli Müşteriler</h3>
          ${report.customers.topCustomers.map((c, i) => `
            <div class="product-row">
              <div class="product-rank">${i + 1}</div>
              <div class="product-info">
                <div class="product-name">${c.name}</div>
                <div class="product-sku">${c.orders} sipariş</div>
              </div>
              <div class="product-stats">
                <div class="product-revenue">${formatCurrency(c.totalSpent)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${report.competitors ? `
        <div class="divider"></div>
        <!-- Rakip Analizi (Kurumsal) -->
        <div class="section">
          <h2 class="section-title">🎯 Rakip Analizi</h2>
          <div style="background: #F0FDF4; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 24px; font-weight: 700; color: #059669;">%${report.competitors.marketShare}</div>
            <div style="font-size: 13px; color: #065F46;">Pazar Payı</div>
          </div>
          <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">📊 Fiyat Karşılaştırması</h3>
          ${report.competitors.priceComparison.map(p => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
              <span>${p.category}</span>
              <span>
                Sizin: ${formatCurrency(p.yourAvg)} • Piyasa: ${formatCurrency(p.marketAvg)}
                <span style="color: ${p.difference <= 0 ? '#10B981' : '#EF4444'}; font-weight: 600;">
                  (${p.difference <= 0 ? '' : '+'}${p.difference}%)
                </span>
              </span>
            </div>
          `).join('')}
          <h3 style="font-size: 14px; font-weight: 600; margin: 20px 0 12px;">🔍 Arama Sıralaması Değişimleri</h3>
          ${report.competitors.rankingChanges.map(r => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
              <span>"${r.keyword}"</span>
              <span>
                <strong style="color: #6366F1;">#${r.yourRank}</strong>
                <span style="color: ${r.yourRank < r.previousRank ? '#10B981' : r.yourRank > r.previousRank ? '#EF4444' : '#6B7280'};">
                  (${r.yourRank < r.previousRank ? '↑' : r.yourRank > r.previousRank ? '↓' : '→'} ${Math.abs(r.yourRank - r.previousRank) || ''})
                </span>
                • Lider: ${r.topCompetitor}
              </span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="#" class="cta-button">📊 Detaylı Raporu İncele</a>
        <p style="margin-top: 12px; font-size: 13px; color: #6B7280;">
          Tüm verileri ve interaktif grafikleri görmek için panele giriş yapın
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">🚀 PazarYönetimi</div>
      <p>E-ticaret operasyonlarınızı tek platformdan yönetin</p>
      <p style="margin-top: 16px; font-size: 11px;">
        Bu rapor ${report.planType === 'enterprise' ? 'Kurumsal' : 'Profesyonel'} Plan kapsamında otomatik olarak gönderilmektedir.<br>
        Rapor ayarlarınızı değiştirmek için <a href="#" style="color: #6366F1;">buraya tıklayın</a>.
      </p>
      <p style="margin-top: 12px; font-size: 11px; color: #9CA3AF;">
        © 2026 PazarYönetimi. Tüm hakları saklıdır.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Rapor e-postası için konu satırı oluştur
   */
  generateSubject(storeName: string, period: ReportPeriod): string {
    const periodName = this.reportsService.getPeriodName(period);
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    
    return `📊 ${storeName} - ${periodName} Rapor (${dateStr})`;
  }
}
