// Document Generator
// PDF, DOCX, XLSX generation for invoices, reports, etc.

import puppeteer from 'puppeteer';

interface DocumentTemplate {
  id: string;
  tenantId: string;
  name: string;
  type: 'invoice' | 'report' | 'label' | 'contract' | 'custom';
  format: 'pdf' | 'docx' | 'xlsx' | 'html';
  content: string; // HTML template with placeholders
  header?: string;
  footer?: string;
  styles?: {
    fontFamily?: string;
    fontSize?: number;
    colors?: {
      primary?: string;
      secondary?: string;
      text?: string;
    };
  };
  pageSize?: 'A4' | 'A5' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: { top: number; right: number; bottom: number; left: number };
}

interface DocumentData {
  [key: string]: unknown;
  items?: Array<Record<string, unknown>>;
  company?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    logo?: string;
    taxNumber?: string;
  };
  customer?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
}

interface GeneratedDocument {
  id: string;
  templateId: string;
  data: DocumentData;
  fileName: string;
  contentType: string;
  buffer: Buffer;
  size: number;
  generatedAt: Date;
}

interface BatchGeneration {
  templateId: string;
  items: DocumentData[];
  options: {
    merge?: boolean;
    fileNamePattern?: string;
  };
}

// Document generator
export class DocumentGenerator {
  private templates: Map<string, DocumentTemplate> = new Map();
  private browser: puppeteer.Browser | null = null;

  // Initialize puppeteer
  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: true });
    }
  }

  // Create template
  createTemplate(
    tenantId: string,
    config: Omit<DocumentTemplate, 'id' | 'tenantId'>
  ): DocumentTemplate {
    const template: DocumentTemplate = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
    };

    this.templates.set(template.id, template);
    return template;
  }

  // Generate document from template
  async generate(
    templateId: string,
    data: DocumentData,
    options: {
      fileName?: string;
      language?: string;
    } = {}
  ): Promise<GeneratedDocument> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    await this.init();

    // Process template with data
    const processedContent = this.processTemplate(template.content, data);
    const fullHtml = this.buildFullHtml(template, processedContent);

    // Generate based on format
    let buffer: Buffer;
    let contentType: string;

    switch (template.format) {
      case 'pdf':
        buffer = await this.generatePDF(fullHtml, template);
        contentType = 'application/pdf';
        break;
      case 'html':
        buffer = Buffer.from(fullHtml);
        contentType = 'text/html';
        break;
      default:
        throw new Error(`Format ${template.format} not yet implemented`);
    }

    return {
      id: crypto.randomUUID(),
      templateId,
      data,
      fileName: options.fileName || `${template.name}_${Date.now()}.${template.format}`,
      contentType,
      buffer,
      size: buffer.length,
      generatedAt: new Date(),
    };
  }

  // Generate batch documents
  async generateBatch(batch: BatchGeneration): Promise<{
    documents: GeneratedDocument[];
    merged?: GeneratedDocument;
  }> {
    const documents: GeneratedDocument[] = [];

    for (const data of batch.items) {
      const doc = await this.generate(
        batch.templateId,
        data,
        { fileName: this.generateFileName(batch.options.fileNamePattern, data) }
      );
      documents.push(doc);
    }

    if (batch.options.merge && documents.length > 0) {
      const merged = await this.mergeDocuments(documents);
      return { documents, merged };
    }

    return { documents };
  }

  // Generate invoice
  async generateInvoice(
    tenantId: string,
    orderData: DocumentData,
    options?: {
      templateName?: string;
      includeQR?: boolean;
    }
  ): Promise<GeneratedDocument> {
    // Get or create invoice template
    let template = Array.from(this.templates.values())
      .find(t => t.tenantId === tenantId && t.type === 'invoice');

    if (!template) {
      template = this.createDefaultInvoiceTemplate(tenantId);
    }

    // Enhance data with invoice-specific fields
    const invoiceData: DocumentData = {
      ...orderData,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toLocaleDateString('tr-TR'),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      ...(options?.includeQR && { qrCode: this.generateQRData(orderData) }),
    };

    return this.generate(template.id, invoiceData, {
      fileName: `invoice_${invoiceData.invoiceNumber}.pdf`,
    });
  }

  // Generate shipping label
  async generateLabel(
    tenantId: string,
    orderData: DocumentData,
    carrier: string
  ): Promise<GeneratedDocument> {
    const template = this.createLabelTemplate(tenantId, carrier);

    return this.generate(template.id, orderData, {
      fileName: `label_${orderData.orderNumber || Date.now()}.pdf`,
    });
  }

  // Generate report
  async generateReport(
    tenantId: string,
    reportType: 'sales' | 'inventory' | 'financial',
    data: DocumentData,
    period: { start: Date; end: Date }
  ): Promise<GeneratedDocument> {
    const template = this.createReportTemplate(tenantId, reportType);

    const reportData: DocumentData = {
      ...data,
      reportType,
      period: {
        start: period.start.toLocaleDateString('tr-TR'),
        end: period.end.toLocaleDateString('tr-TR'),
      },
      generatedAt: new Date().toLocaleString('tr-TR'),
    };

    return this.generate(template.id, reportData, {
      fileName: `${reportType}_report_${period.start.toISOString().split('T')[0]}.pdf`,
    });
  }

  // Preview template
  async preview(templateId: string, sampleData: DocumentData): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    const processedContent = this.processTemplate(template.content, sampleData);
    return this.buildFullHtml(template, processedContent);
  }

  // Clone template
  cloneTemplate(templateId: string, newName: string): DocumentTemplate {
    const source = this.templates.get(templateId);
    if (!source) throw new Error('Template not found');

    return this.createTemplate(source.tenantId, {
      ...source,
      name: newName,
    });
  }

  // Get templates for tenant
  getTemplates(tenantId: string): DocumentTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.tenantId === tenantId);
  }

  // Private methods
  private processTemplate(template: string, data: DocumentData): string {
    // Replace {{variable}} placeholders
    let result = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key);
      return value !== undefined ? String(value) : match;
    });

    // Handle loops for items
    result = result.replace(
      /\{\{#each items\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, content) => {
        const items = data.items || [];
        return items.map((item: Record<string, unknown>) => 
          this.processTemplate(content, item as DocumentData)
        ).join('');
      }
    );

    // Handle conditionals
    result = result.replace(
      /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition, content) => {
        const value = this.getNestedValue(data, condition);
        return value ? content : '';
      }
    );

    return result;
  }

  private buildFullHtml(template: DocumentTemplate, content: string): string {
    const styles = template.styles || {};
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${template.pageSize || 'A4'} ${template.orientation || 'portrait'};
      margin: ${JSON.stringify(template.margins || { top: 20, right: 20, bottom: 20, left: 20 })};
    }
    
    body {
      font-family: ${styles.fontFamily || 'Arial, sans-serif'};
      font-size: ${styles.fontSize || 12}px;
      color: ${styles.colors?.text || '#333'};
      margin: 0;
      padding: 0;
    }
    
    .header {
      ${template.header ? '' : 'display: none;'}
    }
    
    .footer {
      ${template.footer ? '' : 'display: none;'}
    }
    
    .content {
      padding: 20px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: ${styles.colors?.primary || '#f4f4f4'};
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">${template.header || ''}</div>
  <div class="content">${content}</div>
  <div class="footer">${template.footer || ''}</div>
</body>
</html>`;
  }

  private async generatePDF(html: string, template: DocumentTemplate): Promise<Buffer> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: template.pageSize || 'A4',
      landscape: template.orientation === 'landscape',
      printBackground: true,
      margin: template.margins || { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await page.close();
    return Buffer.from(pdf);
  }

  private async mergeDocuments(documents: GeneratedDocument[]): Promise<GeneratedDocument> {
    // Would use PDF merging library
    // For now, return first document
    return documents[0];
  }

  private getNestedValue(obj: any, path: string): unknown {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  private generateFileName(pattern: string | undefined, data: DocumentData): string {
    if (!pattern) return `document_${Date.now()}.pdf`;
    
    return pattern.replace(/\{(\w+)\}/g, (match, key) => {
      const value = this.getNestedValue(data, key);
      return value !== undefined ? String(value) : match;
    });
  }

  private generateQRData(data: DocumentData): string {
    // Generate QR code data for invoice verification
    return JSON.stringify({
      invoice: data.invoiceNumber,
      amount: data.total,
      date: data.invoiceDate,
    });
  }

  // Default templates
  private createDefaultInvoiceTemplate(tenantId: string): DocumentTemplate {
    return this.createTemplate(tenantId, {
      name: 'Default Invoice',
      type: 'invoice',
      format: 'pdf',
      content: `
<div class="invoice">
  <div class="header-section">
    <h1>FATURA</h1>
    <div class="invoice-info">
      <p><strong>Fatura No:</strong> {{invoiceNumber}}</p>
      <p><strong>Tarih:</strong> {{invoiceDate}}</p>
      <p><strong>Son Ödeme:</strong> {{dueDate}}</p>
    </div>
  </div>
  
  <div class="company-info">
    <h3>{{company.name}}</h3>
    <p>{{company.address}}</p>
    <p>VKN: {{company.taxNumber}}</p>
  </div>
  
  <div class="customer-info">
    <h3>Müşteri</h3>
    <p>{{customer.name}}</p>
    <p>{{customer.address}}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Ürün</th>
        <th>Adet</th>
        <th>Birim Fiyat</th>
        <th>Toplam</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{name}}</td>
        <td>{{quantity}}</td>
        <td class="text-right">{{price}}</td>
        <td class="text-right">{{total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  
  <div class="totals">
    <p class="text-right"><strong>Ara Toplam:</strong> {{subtotal}}</p>
    <p class="text-right"><strong>KDV (20%):</strong> {{tax}}</p>
    <p class="text-right"><strong>Genel Toplam:</strong> {{total}}</p>
  </div>
</div>`,
      pageSize: 'A4',
      orientation: 'portrait',
      styles: {
        fontFamily: 'Arial',
        fontSize: 12,
        colors: {
          primary: '#2563eb',
          text: '#1f2937',
        },
      },
    });
  }

  private createLabelTemplate(tenantId: string, carrier: string): DocumentTemplate {
    return this.createTemplate(tenantId, {
      name: `${carrier} Label`,
      type: 'label',
      format: 'pdf',
      content: `
<div class="label">
  <div class="carrier-logo">{{carrier}}</div>
  <div class="barcode">{{trackingNumber}}</div>
  <div class="recipient">
    <strong>{{customer.name}}</strong><br>
    {{customer.address}}
  </div>
  <div class="sender">
    <strong>{{company.name}}</strong><br>
    {{company.address}}
  </div>
</div>`,
      pageSize: 'A5',
      orientation: 'landscape',
    });
  }

  private createReportTemplate(
    tenantId: string,
    type: 'sales' | 'inventory' | 'financial'
  ): DocumentTemplate {
    return this.createTemplate(tenantId, {
      name: `${type} Report`,
      type: 'report',
      format: 'pdf',
      content: `
<div class="report">
  <h1>{{reportType}} Raporu</h1>
  <p>Dönem: {{period.start}} - {{period.end}}</p>
  <p>Oluşturulma: {{generatedAt}}</p>
  
  <div class="summary">
    {{#if summary}}
    <table>
      {{#each summary}}
      <tr>
        <td>{{label}}</td>
        <td class="text-right">{{value}}</td>
      </tr>
      {{/each}}
    </table>
    {{/if}}
  </div>
  
  <div class="charts">
    {{#if charts}}
    {{#each charts}}
    <img src="{{url}}" alt="{{title}}">
    {{/each}}
    {{/if}}
  </div>
</div>`,
      pageSize: 'A4',
      orientation: 'landscape',
    });
  }
}

// Document template library
export class DocumentTemplateLibrary {
  private templates: Map<string, Partial<DocumentTemplate>> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    this.templates.set('invoice_tr', {
      name: 'Türkiye Fatura',
      type: 'invoice',
      format: 'pdf',
      content: 'TR invoice template...',
    });

    this.templates.set('invoice_eu', {
      name: 'EU Invoice',
      type: 'invoice',
      format: 'pdf',
      content: 'EU invoice template...',
    });

    this.templates.set('shipping_label', {
      name: 'Shipping Label',
      type: 'label',
      format: 'pdf',
      content: 'Label template...',
    });
  }

  getTemplate(name: string): Partial<DocumentTemplate> | null {
    return this.templates.get(name) || null;
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

// Export singleton
export const documentGenerator = new DocumentGenerator();
export const templateLibrary = new DocumentTemplateLibrary();

export { DocumentTemplate, DocumentData, GeneratedDocument };
