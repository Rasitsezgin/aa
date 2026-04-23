// Data Import System
// CSV, Excel import with validation and transformation

import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';

type ImportFileType = 'csv' | 'xlsx' | 'xls' | 'json' | 'xml';
type ImportStatus = 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled';

type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'enum' | 'reference';

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  type: ColumnType;
  required?: boolean;
  unique?: boolean;
  transform?: string; // JavaScript function as string
  defaultValue?: unknown;
  enumValues?: string[];
  referenceEntity?: string;
  referenceField?: string;
}

interface ImportConfig {
  id: string;
  tenantId: string;
  name: string;
  targetEntity: string;
  columnMappings: ColumnMapping[];
  settings: {
    skipHeader: boolean;
    skipEmptyRows: boolean;
    batchSize: number;
    allowPartial: boolean;
    updateExisting: boolean;
    matchFields?: string[];
    webhookUrl?: string;
  };
  validationRules?: Array<{
    type: 'required' | 'unique' | 'format' | 'custom';
    field: string;
    message: string;
    condition?: string;
  }>;
}

interface ImportJob {
  id: string;
  configId: string;
  tenantId: string;
  fileName: string;
  fileType: ImportFileType;
  fileSize: number;
  rowCount?: number;
  status: ImportStatus;
  progress: {
    processed: number;
    succeeded: number;
    failed: number;
    percentage: number;
  };
  errors: Array<{
    row: number;
    column?: string;
    message: string;
    value?: unknown;
  }>;
  results?: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
}

interface PreviewData {
  headers: string[];
  rows: Array<Record<string, unknown>>;
  totalRows: number;
  sampleSize: number;
}

// Data Import Manager
export class DataImportManager {
  private configs: Map<string, ImportConfig> = new Map();
  private jobs: Map<string, ImportJob> = new Map();

  // Create import configuration
  createConfig(config: Omit<ImportConfig, 'id'>): ImportConfig {
    const newConfig: ImportConfig = {
      ...config,
      id: crypto.randomUUID(),
    };

    this.configs.set(newConfig.id, newConfig);
    return newConfig;
  }

  // Preview file before import
  async preview(
    file: Buffer,
    fileType: ImportFileType,
    options: {
      sampleSize?: number;
      encoding?: string;
    } = {}
  ): Promise<PreviewData> {
    const sampleSize = options.sampleSize || 100;

    switch (fileType) {
      case 'csv':
        return this.previewCSV(file, sampleSize, options.encoding);
      case 'xlsx':
      case 'xls':
        return this.previewExcel(file, sampleSize);
      case 'json':
        return this.previewJSON(file, sampleSize);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  // Start import job
  async startImport(
    configId: string,
    file: Buffer,
    fileName: string,
    fileType: ImportFileType,
    userId: string
  ): Promise<ImportJob> {
    const config = this.configs.get(configId);
    if (!config) throw new Error('Import configuration not found');

    const job: ImportJob = {
      id: crypto.randomUUID(),
      configId,
      tenantId: config.tenantId,
      fileName,
      fileType,
      fileSize: file.length,
      status: 'pending',
      progress: {
        processed: 0,
        succeeded: 0,
        failed: 0,
        percentage: 0,
      },
      errors: [],
      createdAt: new Date(),
      createdBy: userId,
    };

    this.jobs.set(job.id, job);

    // Process asynchronously
    this.processImport(job, file, config).catch(error => {
      job.status = 'failed';
      job.errors.push({ row: 0, message: String(error) });
    });

    return job;
  }

  // Validate data without importing
  async validate(
    configId: string,
    file: Buffer,
    fileType: ImportFileType
  ): Promise<{
    valid: boolean;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors: ImportJob['errors'];
    warnings: string[];
  }> {
    const config = this.configs.get(configId);
    if (!config) throw new Error('Import configuration not found');

    const preview = await this.preview(file, fileType);
    const errors: ImportJob['errors'] = [];
    const warnings: string[] = [];

    let validRows = 0;
    let invalidRows = 0;

    for (let i = 0; i < preview.rows.length; i++) {
      const row = preview.rows[i];
      const rowErrors = this.validateRow(row, config, i + (config.settings.skipHeader ? 2 : 1));
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        invalidRows++;
      } else {
        validRows++;
      }
    }

    // Check for missing required columns
    const mappedColumns = config.columnMappings.map(m => m.sourceColumn);
    const missingColumns = mappedColumns.filter(col => !preview.headers.includes(col));
    if (missingColumns.length > 0) {
      warnings.push(`Missing columns: ${missingColumns.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      totalRows: preview.totalRows,
      validRows,
      invalidRows,
      errors,
      warnings,
    };
  }

  // Get job status
  getJobStatus(jobId: string): ImportJob | null {
    return this.jobs.get(jobId) || null;
  }

  // Cancel running job
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && (job.status === 'pending' || job.status === 'validating' || job.status === 'processing')) {
      job.status = 'cancelled';
      job.completedAt = new Date();
      return true;
    }
    return false;
  }

  // Get import history
  getHistory(tenantId: string, options: {
    limit?: number;
    offset?: number;
    status?: ImportStatus;
  } = {}): ImportJob[] {
    let jobs = Array.from(this.jobs.values()).filter(j => j.tenantId === tenantId);

    if (options.status) {
      jobs = jobs.filter(j => j.status === options.status);
    }

    jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return jobs.slice(offset, offset + limit);
  }

  // Download error report
  downloadErrorReport(jobId: string): Buffer {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    const errors = job.errors;
    const csv = [
      ['Row', 'Column', 'Value', 'Error'].join(','),
      ...errors.map(e => [
        e.row,
        e.column || '',
        JSON.stringify(e.value) || '',
        `"${e.message.replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\n');

    return Buffer.from(csv);
  }

  // Private methods
  private async processImport(
    job: ImportJob,
    file: Buffer,
    config: ImportConfig
  ): Promise<void> {
    job.status = 'validating';
    job.startedAt = new Date();

    // Parse file
    let rows: Array<Record<string, unknown>> = [];
    
    switch (job.fileType) {
      case 'csv':
        rows = await this.parseCSV(file);
        break;
      case 'xlsx':
      case 'xls':
        rows = this.parseExcel(file);
        break;
      case 'json':
        rows = this.parseJSON(file);
        break;
    }

    job.rowCount = rows.length;

    // Process in batches
    job.status = 'processing';
    const batchSize = config.settings.batchSize || 100;
    const results = { created: 0, updated: 0, skipped: 0, failed: 0 };

    for (let i = 0; i < rows.length; i += batchSize) {
      if (job.status === 'cancelled') break;

      const batch = rows.slice(i, i + batchSize);
      const startRow = i + (config.settings.skipHeader ? 2 : 1);

      for (let j = 0; j < batch.length; j++) {
        const row = batch[j];
        const rowNumber = startRow + j;

        try {
          // Validate
          const errors = this.validateRow(row, config, rowNumber);
          if (errors.length > 0) {
            job.errors.push(...errors);
            results.failed++;
            continue;
          }

          // Transform
          const transformed = this.transformRow(row, config);

          // Import
          const result = await this.importRow(transformed, config);
          
          if (result === 'created') results.created++;
          else if (result === 'updated') results.updated++;
          else if (result === 'skipped') results.skipped++;

          job.progress.succeeded++;
        } catch (error) {
          job.errors.push({
            row: rowNumber,
            message: String(error),
            value: row,
          });
          results.failed++;
        }

        job.progress.processed++;
        job.progress.percentage = Math.floor((job.progress.processed / rows.length) * 100);
      }

      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    job.results = results;
    job.status = job.errors.length > 0 && !config.settings.allowPartial ? 'failed' : 'completed';
    job.completedAt = new Date();

    // Trigger webhook if configured
    if (config.settings.webhookUrl) {
      await this.triggerWebhook(config.settings.webhookUrl, job);
    }
  }

  private async parseCSV(file: Buffer, encoding?: string): Promise<Array<Record<string, unknown>>> {
    return new Promise((resolve, reject) => {
      const records: Array<Record<string, unknown>> = [];
      
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        encoding: encoding || 'utf8',
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on('error', reject);
      parser.on('end', () => resolve(records));

      parser.write(file);
      parser.end();
    });
  }

  private parseExcel(file: Buffer): Array<Record<string, unknown>> {
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }

  private parseJSON(file: Buffer): Array<Record<string, unknown>> {
    const data = JSON.parse(file.toString());
    return Array.isArray(data) ? data : [data];
  }

  private async previewCSV(
    file: Buffer,
    sampleSize: number,
    encoding?: string
  ): Promise<PreviewData> {
    const rows = await this.parseCSV(file.slice(0, 100000), encoding); // First 100KB
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      headers,
      rows: rows.slice(0, sampleSize),
      totalRows: rows.length,
      sampleSize: Math.min(sampleSize, rows.length),
    };
  }

  private previewExcel(file: Buffer, sampleSize: number): PreviewData {
    const rows = this.parseExcel(file);
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      headers,
      rows: rows.slice(0, sampleSize),
      totalRows: rows.length,
      sampleSize: Math.min(sampleSize, rows.length),
    };
  }

  private previewJSON(file: Buffer, sampleSize: number): PreviewData {
    const rows = this.parseJSON(file);
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      headers,
      rows: rows.slice(0, sampleSize),
      totalRows: rows.length,
      sampleSize: Math.min(sampleSize, rows.length),
    };
  }

  private validateRow(
    row: Record<string, unknown>,
    config: ImportConfig,
    rowNumber: number
  ): Array<{ row: number; column?: string; message: string; value?: unknown }> {
    const errors: Array<{ row: number; column?: string; message: string; value?: unknown }> = [];

    for (const mapping of config.columnMappings) {
      const value = row[mapping.sourceColumn];

      // Required check
      if (mapping.required && (value === undefined || value === null || value === '')) {
        errors.push({
          row: rowNumber,
          column: mapping.sourceColumn,
          message: `Required field is empty`,
          value,
        });
        continue;
      }

      if (value === undefined || value === null || value === '') continue;

      // Type validation
      const typeError = this.validateType(value, mapping.type, mapping);
      if (typeError) {
        errors.push({
          row: rowNumber,
          column: mapping.sourceColumn,
          message: typeError,
          value,
        });
      }
    }

    // Custom validation rules
    if (config.validationRules) {
      for (const rule of config.validationRules) {
        const mapping = config.columnMappings.find(m => m.targetField === rule.field);
        if (mapping) {
          const value = row[mapping.sourceColumn];
          
          if (rule.type === 'required' && !value) {
            errors.push({
              row: rowNumber,
              column: mapping.sourceColumn,
              message: rule.message,
              value,
            });
          }
          
          if (rule.type === 'custom' && rule.condition) {
            try {
              const fn = new Function('value', 'row', rule.condition);
              if (!fn(value, row)) {
                errors.push({
                  row: rowNumber,
                  column: mapping.sourceColumn,
                  message: rule.message,
                  value,
                });
              }
            } catch (error) {
              // Invalid condition
            }
          }
        }
      }
    }

    return errors;
  }

  private validateType(
    value: unknown,
    type: ColumnType,
    mapping: ColumnMapping
  ): string | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') return 'Must be a string';
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          return 'Must be a number';
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean' && !['true', 'false', '0', '1'].includes(String(value).toLowerCase())) {
          return 'Must be a boolean';
        }
        break;
      case 'date':
        if (isNaN(Date.parse(String(value)))) return 'Must be a valid date';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          return 'Must be a valid email';
        }
        break;
      case 'url':
        try {
          new URL(String(value));
        } catch {
          return 'Must be a valid URL';
        }
        break;
      case 'enum':
        if (mapping.enumValues && !mapping.enumValues.includes(String(value))) {
          return `Must be one of: ${mapping.enumValues.join(', ')}`;
        }
        break;
    }
    return null;
  }

  private transformRow(
    row: Record<string, unknown>,
    config: ImportConfig
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const mapping of config.columnMappings) {
      let value = row[mapping.sourceColumn];

      // Apply default
      if ((value === undefined || value === null || value === '') && mapping.defaultValue !== undefined) {
        value = mapping.defaultValue;
      }

      // Apply transform
      if (mapping.transform && value !== undefined) {
        try {
          const fn = new Function('value', mapping.transform);
          value = fn(value);
        } catch (error) {
          // Keep original value
        }
      }

      // Type conversion
      value = this.convertType(value, mapping.type);

      result[mapping.targetField] = value;
    }

    return result;
  }

  private convertType(value: unknown, type: ColumnType): unknown {
    if (value === undefined || value === null) return value;

    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return ['true', '1', 'yes'].includes(String(value).toLowerCase());
      case 'date':
        return new Date(String(value));
      default:
        return value;
    }
  }

  private async importRow(
    data: Record<string, unknown>,
    config: ImportConfig
  ): Promise<'created' | 'updated' | 'skipped'> {
    // Would import to database based on config
    // Check if exists and update or create
    
    if (config.settings.updateExisting && config.settings.matchFields) {
      // Check for existing record
      // Would query database
      const exists = false; // Mock
      
      if (exists) {
        // Update
        return 'updated';
      }
    }

    // Create new
    return 'created';
  }

  private async triggerWebhook(url: string, job: ImportJob): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          status: job.status,
          results: job.results,
          errors: job.errors.length,
        }),
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }
}

// Import template library
export class ImportTemplateLibrary {
  private templates: Map<string, Omit<ImportConfig, 'id' | 'tenantId'>> = new Map([
    ['products', {
      name: 'Product Import',
      targetEntity: 'Product',
      columnMappings: [
        { sourceColumn: 'SKU', targetField: 'sku', type: 'string', required: true, unique: true },
        { sourceColumn: 'Name', targetField: 'title', type: 'string', required: true },
        { sourceColumn: 'Description', targetField: 'description', type: 'string' },
        { sourceColumn: 'Price', targetField: 'price', type: 'number', required: true },
        { sourceColumn: 'Stock', targetField: 'stock', type: 'number', defaultValue: 0 },
        { sourceColumn: 'Category', targetField: 'categoryId', type: 'reference', referenceEntity: 'Category' },
        { sourceColumn: 'Barcode', targetField: 'barcode', type: 'string' },
        { sourceColumn: 'Image URL', targetField: 'imageUrl', type: 'url' },
      ],
      settings: {
        skipHeader: true,
        skipEmptyRows: true,
        batchSize: 100,
        allowPartial: false,
        updateExisting: true,
        matchFields: ['sku'],
      },
    }],
    ['orders', {
      name: 'Order Import',
      targetEntity: 'Order',
      columnMappings: [
        { sourceColumn: 'Order Number', targetField: 'orderNumber', type: 'string', required: true },
        { sourceColumn: 'Customer Email', targetField: 'customerEmail', type: 'email', required: true },
        { sourceColumn: 'Total', targetField: 'totalAmount', type: 'number', required: true },
        { sourceColumn: 'Status', targetField: 'status', type: 'enum', enumValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
        { sourceColumn: 'Order Date', targetField: 'createdAt', type: 'date' },
      ],
      settings: {
        skipHeader: true,
        skipEmptyRows: true,
        batchSize: 50,
        allowPartial: true,
        updateExisting: false,
      },
    }],
    ['customers', {
      name: 'Customer Import',
      targetEntity: 'Customer',
      columnMappings: [
        { sourceColumn: 'Email', targetField: 'email', type: 'email', required: true, unique: true },
        { sourceColumn: 'First Name', targetField: 'firstName', type: 'string', required: true },
        { sourceColumn: 'Last Name', targetField: 'lastName', type: 'string', required: true },
        { sourceColumn: 'Phone', targetField: 'phone', type: 'string' },
        { sourceColumn: 'Address', targetField: 'address', type: 'string' },
        { sourceColumn: 'City', targetField: 'city', type: 'string' },
        { sourceColumn: 'Country', targetField: 'country', type: 'string' },
      ],
      settings: {
        skipHeader: true,
        skipEmptyRows: true,
        batchSize: 100,
        allowPartial: false,
        updateExisting: true,
        matchFields: ['email'],
      },
    }],
  ]);

  getTemplate(name: string): Omit<ImportConfig, 'id' | 'tenantId'> | null {
    return this.templates.get(name) || null;
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

// Export singleton
export const dataImportManager = new DataImportManager();
export const importTemplateLibrary = new ImportTemplateLibrary();

export { ImportConfig, ImportJob, ColumnMapping, ImportFileType };
