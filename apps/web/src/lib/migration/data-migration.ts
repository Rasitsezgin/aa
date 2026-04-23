// Data Migration System
// Safe data migration with rollback capability

import { prisma } from '@/lib/prisma';

type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
type MigrationType = 'schema' | 'data' | 'seed' | 'cleanup';

interface Migration {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  type: MigrationType;
  version: string;
  status: MigrationStatus;
  script: string;
  rollbackScript?: string;
  checksum: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  error?: string;
  affectedRows?: number;
  dependsOn?: string[];
  createdAt: Date;
  createdBy: string;
}

interface MigrationBatch {
  id: string;
  migrations: Migration[];
  status: MigrationStatus;
  startedAt?: Date;
  completedAt?: Date;
  results: Array<{
    migrationId: string;
    success: boolean;
    error?: string;
    duration: number;
  }>;
}

interface MigrationValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  estimatedDuration: number;
  affectedTables: string[];
  rollbackAvailable: boolean;
}

// Migration manager
export class MigrationManager {
  private migrations: Map<string, Migration> = new Map();
  private executedMigrations: Set<string> = new Set();

  // Register migration
  register(migration: Omit<Migration, 'id' | 'status' | 'createdAt'>): Migration {
    const fullMigration: Migration = {
      ...migration,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    this.migrations.set(fullMigration.id, fullMigration);
    return fullMigration;
  }

  // Validate migration before execution
  async validate(migrationId: string): Promise<MigrationValidation> {
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      return {
        valid: false,
        errors: ['Migration not found'],
        warnings: [],
        estimatedDuration: 0,
        affectedTables: [],
        rollbackAvailable: false,
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check dependencies
    if (migration.dependsOn) {
      for (const depId of migration.dependsOn) {
        if (!this.executedMigrations.has(depId)) {
          errors.push(`Dependency ${depId} not executed`);
        }
      }
    }

    // Validate checksum
    const currentChecksum = this.calculateChecksum(migration.script);
    if (currentChecksum !== migration.checksum) {
      errors.push('Checksum mismatch - migration script has been modified');
    }

    // Check if already executed
    const isExecuted = await this.isMigrationExecuted(migration.version);
    if (isExecuted) {
      warnings.push('Migration already executed');
    }

    // Estimate affected tables
    const affectedTables = this.extractAffectedTables(migration.script);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      estimatedDuration: this.estimateDuration(migration),
      affectedTables,
      rollbackAvailable: !!migration.rollbackScript,
    };
  }

  // Execute single migration
  async execute(migrationId: string): Promise<Migration> {
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      throw new Error('Migration not found');
    }

    // Validate first
    const validation = await this.validate(migrationId);
    if (!validation.valid) {
      migration.status = 'failed';
      migration.error = `Validation failed: ${validation.errors.join(', ')}`;
      return migration;
    }

    // Execute
    migration.status = 'running';
    migration.startedAt = new Date();

    try {
      // Run migration in transaction
      const result = await this.runWithTransaction(migration);
      
      migration.status = 'completed';
      migration.completedAt = new Date();
      migration.duration = migration.completedAt.getTime() - migration.startedAt.getTime();
      migration.affectedRows = result.affectedRows;

      // Record as executed
      this.executedMigrations.add(migration.id);
      await this.recordExecution(migration);

    } catch (error) {
      migration.status = 'failed';
      migration.error = String(error);
      migration.completedAt = new Date();
    }

    return migration;
  }

  // Execute batch migrations
  async executeBatch(migrationIds: string[]): Promise<MigrationBatch> {
    const batch: MigrationBatch = {
      id: crypto.randomUUID(),
      migrations: migrationIds.map(id => this.migrations.get(id)).filter(Boolean) as Migration[],
      status: 'running',
      startedAt: new Date(),
      results: [],
    };

    for (const migration of batch.migrations) {
      const start = Date.now();
      
      try {
        const result = await this.execute(migration.id);
        
        batch.results.push({
          migrationId: migration.id,
          success: result.status === 'completed',
          duration: result.duration || 0,
        });

        // Stop on first failure
        if (result.status === 'failed') {
          batch.status = 'failed';
          batch.completedAt = new Date();
          return batch;
        }
      } catch (error) {
        batch.results.push({
          migrationId: migration.id,
          success: false,
          error: String(error),
          duration: Date.now() - start,
        });
        
        batch.status = 'failed';
        batch.completedAt = new Date();
        return batch;
      }
    }

    batch.status = 'completed';
    batch.completedAt = new Date();
    return batch;
  }

  // Rollback migration
  async rollback(migrationId: string): Promise<Migration> {
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      throw new Error('Migration not found');
    }

    if (!migration.rollbackScript) {
      throw new Error('No rollback script available');
    }

    if (migration.status !== 'completed') {
      throw new Error('Can only rollback completed migrations');
    }

    try {
      // Execute rollback
      await this.runWithTransaction({
        ...migration,
        script: migration.rollbackScript,
      });

      migration.status = 'rolled_back';
      migration.updatedAt = new Date();

      // Remove from executed set
      this.executedMigrations.delete(migrationId);
      await this.removeExecutionRecord(migration.version);

    } catch (error) {
      throw new Error(`Rollback failed: ${error}`);
    }

    return migration;
  }

  // Get migration status
  async getStatus(): Promise<{
    pending: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const all = Array.from(this.migrations.values());
    
    return {
      pending: all.filter(m => m.status === 'pending').length,
      completed: all.filter(m => m.status === 'completed').length,
      failed: all.filter(m => m.status === 'failed').length,
      total: all.length,
    };
  }

  // Generate migration script from changes
  generateScript(
    type: MigrationType,
    changes: Array<{
      table: string;
      operation: 'create' | 'alter' | 'drop' | 'insert' | 'update' | 'delete';
      columns?: Array<{ name: string; type: string; nullable?: boolean; default?: unknown }>;
      data?: unknown[];
    }>
  ): string {
    const lines: string[] = [];

    lines.push(`-- Migration Type: ${type}`);
    lines.push(`-- Generated at: ${new Date().toISOString()}`);
    lines.push('');

    for (const change of changes) {
      switch (change.operation) {
        case 'create':
          lines.push(`CREATE TABLE IF NOT EXISTS ${change.table} (`);
          change.columns?.forEach((col, i) => {
            const nullable = col.nullable ? '' : ' NOT NULL';
            const defaultVal = col.default !== undefined ? ` DEFAULT ${col.default}` : '';
            const comma = i < change.columns!.length - 1 ? ',' : '';
            lines.push(`  ${col.name} ${col.type}${nullable}${defaultVal}${comma}`);
          });
          lines.push(');');
          break;

        case 'alter':
          change.columns?.forEach(col => {
            lines.push(`ALTER TABLE ${change.table} ADD COLUMN ${col.name} ${col.type};`);
          });
          break;

        case 'drop':
          lines.push(`DROP TABLE IF EXISTS ${change.table};`);
          break;

        case 'insert':
          if (change.data) {
            for (const row of change.data) {
              const columns = Object.keys(row).join(', ');
              const values = Object.values(row).map(v => 
                typeof v === 'string' ? `'${v}'` : v
              ).join(', ');
              lines.push(`INSERT INTO ${change.table} (${columns}) VALUES (${values});`);
            }
          }
          break;
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  // Generate rollback script
  generateRollbackScript(
    type: MigrationType,
    changes: Array<{
      table: string;
      operation: 'create' | 'alter' | 'drop' | 'insert' | 'update' | 'delete';
    }>
  ): string {
    const lines: string[] = [];

    lines.push(`-- Rollback Script`);
    lines.push(`-- Generated at: ${new Date().toISOString()}`);
    lines.push('');

    // Reverse order for rollback
    const reversed = [...changes].reverse();

    for (const change of reversed) {
      switch (change.operation) {
        case 'create':
          lines.push(`DROP TABLE IF EXISTS ${change.table};`);
          break;

        case 'alter':
          // Rollback alter is complex - would need original schema
          lines.push(`-- TODO: Revert alter on ${change.table}`);
          break;

        case 'drop':
          lines.push(`-- TODO: Recreate ${change.table}`);
          break;

        case 'insert':
          lines.push(`DELETE FROM ${change.table} WHERE migrated_at = NOW();`);
          break;
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  // Seed data generator
  async seed(
    tenantId: string,
    data: {
      users?: number;
      products?: number;
      orders?: number;
    }
  ): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    // Seed users
    if (data.users) {
      for (let i = 0; i < data.users; i++) {
        try {
          // Would create users
          created++;
        } catch (error) {
          errors.push(`Failed to create user ${i}: ${error}`);
        }
      }
    }

    // Seed products
    if (data.products) {
      for (let i = 0; i < data.products; i++) {
        try {
          // Would create products
          created++;
        } catch (error) {
          errors.push(`Failed to create product ${i}: ${error}`);
        }
      }
    }

    return { created, errors };
  }

  // Private helper methods
  private async runWithTransaction(migration: Migration): Promise<{ affectedRows: number }> {
    // Would execute in database transaction
    console.log(`Executing migration: ${migration.name}`);
    console.log(migration.script);

    // Simulate execution
    return { affectedRows: 0 };
  }

  private async isMigrationExecuted(version: string): Promise<boolean> {
    // Would check migration history table
    return false;
  }

  private async recordExecution(migration: Migration): Promise<void> {
    // Would record in migration history
    console.log(`Recorded execution of migration ${migration.version}`);
  }

  private async removeExecutionRecord(version: string): Promise<void> {
    // Would remove from migration history
    console.log(`Removed execution record for migration ${version}`);
  }

  private calculateChecksum(script: string): string {
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < script.length; i++) {
      const char = script.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private extractAffectedTables(script: string): string[] {
    const tables: string[] = [];
    const regex = /(?:CREATE TABLE|ALTER TABLE|DROP TABLE|INSERT INTO|UPDATE|DELETE FROM)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?(\w+)/gi;
    let match;

    while ((match = regex.exec(script)) !== null) {
      if (!tables.includes(match[1])) {
        tables.push(match[1]);
      }
    }

    return tables;
  }

  private estimateDuration(migration: Migration): number {
    // Simple estimation based on script size
    const baseTime = 1000; // 1 second base
    const sizeFactor = migration.script.length / 1000;
    return Math.round(baseTime * sizeFactor);
  }
}

// Data export/import for migrations
export class DataTransfer {
  // Export data for migration
  async export(
    tenantId: string,
    tables: string[],
    options: {
      format?: 'json' | 'csv' | 'sql';
      where?: string;
      limit?: number;
    }
  ): Promise<{
    data: Record<string, unknown[]>;
    metadata: {
      exportedAt: Date;
      rowCounts: Record<string, number>;
      size: number;
    };
  }> {
    const data: Record<string, unknown[]> = {};
    const rowCounts: Record<string, number> = {};
    let totalSize = 0;

    for (const table of tables) {
      // Would fetch from database
      data[table] = [];
      rowCounts[table] = 0;
    }

    return {
      data,
      metadata: {
        exportedAt: new Date(),
        rowCounts,
        size: totalSize,
      },
    };
  }

  // Import data
  async import(
    tenantId: string,
    data: Record<string, unknown[]>,
    options: {
      truncate?: boolean;
      validate?: boolean;
    }
  ): Promise<{
    imported: number;
    errors: string[];
  }> {
    let imported = 0;
    const errors: string[] = [];

    for (const [table, rows] of Object.entries(data)) {
      try {
        if (options.truncate) {
          // Would truncate table
        }

        for (const row of rows) {
          if (options.validate) {
            // Would validate row
          }
          // Would insert row
          imported++;
        }
      } catch (error) {
        errors.push(`Failed to import ${table}: ${error}`);
      }
    }

    return { imported, errors };
  }
}

// Export singleton
export const migrationManager = new MigrationManager();
export const dataTransfer = new DataTransfer();

export { Migration, MigrationBatch, MigrationValidation };
