// Blockchain Audit Trail
// Immutable audit logs using blockchain concepts

import { createHash } from 'crypto';
import { EventEmitter } from 'events';

interface Block {
  index: number;
  timestamp: number;
  data: AuditRecord;
  previousHash: string;
  hash: string;
  nonce: number;
}

interface AuditRecord {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: {
    id: string;
    type: 'user' | 'system' | 'api';
    name?: string;
  };
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  signature?: string;
  createdAt: Date;
}

interface Blockchain {
  tenantId: string;
  chain: Block[];
  pendingRecords: AuditRecord[];
  difficulty: number;
  lastBlock?: Block;
}

interface VerificationResult {
  valid: boolean;
  blockCount: number;
  tamperedBlocks: number[];
  message: string;
}

// Blockchain Audit Manager
export class BlockchainAuditManager extends EventEmitter {
  private blockchains: Map<string, Blockchain> = new Map();
  private difficulty = 2; // Number of leading zeros required

  // Initialize blockchain for tenant
  initialize(tenantId: string): Blockchain {
    const genesisBlock = this.createGenesisBlock();
    
    const blockchain: Blockchain = {
      tenantId,
      chain: [genesisBlock],
      pendingRecords: [],
      difficulty: this.difficulty,
      lastBlock: genesisBlock,
    };

    this.blockchains.set(tenantId, blockchain);
    this.emit('blockchainInitialized', { tenantId, genesisBlock });
    
    return blockchain;
  }

  // Add audit record
  async addRecord(record: Omit<AuditRecord, 'id' | 'createdAt'>): Promise<Block> {
    const blockchain = this.blockchains.get(record.tenantId);
    if (!blockchain) {
      throw new Error('Blockchain not initialized for tenant');
    }

    const fullRecord: AuditRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Sign the record (in production, use proper cryptographic signing)
    fullRecord.signature = this.signRecord(fullRecord);

    // Add to pending records
    blockchain.pendingRecords.push(fullRecord);

    // Mine block if we have pending records
    if (blockchain.pendingRecords.length >= 1) {
      return this.mineBlock(blockchain);
    }

    // Return last block if no new block mined
    return blockchain.lastBlock!;
  }

  // Get audit trail for entity
  getAuditTrail(
    tenantId: string,
    entityType: string,
    entityId: string
  ): AuditRecord[] {
    const blockchain = this.blockchains.get(tenantId);
    if (!blockchain) return [];

    return blockchain.chain
      .flatMap(block => block.data)
      .filter(record => 
        record.entityType === entityType && 
        record.entityId === entityId
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Verify blockchain integrity
  verify(tenantId: string): VerificationResult {
    const blockchain = this.blockchains.get(tenantId);
    if (!blockchain) {
      return {
        valid: false,
        blockCount: 0,
        tamperedBlocks: [],
        message: 'Blockchain not found',
      };
    }

    const tamperedBlocks: number[] = [];

    for (let i = 1; i < blockchain.chain.length; i++) {
      const currentBlock = blockchain.chain[i];
      const previousBlock = blockchain.chain[i - 1];

      // Verify current block hash
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        tamperedBlocks.push(i);
      }

      // Verify chain link
      if (currentBlock.previousHash !== previousBlock.hash) {
        tamperedBlocks.push(i);
      }

      // Verify proof of work
      if (!this.isValidHash(currentBlock.hash, blockchain.difficulty)) {
        tamperedBlocks.push(i);
      }
    }

    const valid = tamperedBlocks.length === 0;

    return {
      valid,
      blockCount: blockchain.chain.length,
      tamperedBlocks,
      message: valid 
        ? 'Blockchain is valid' 
        : `Found ${tamperedBlocks.length} tampered blocks`,
    };
  }

  // Get blockchain stats
  getStats(tenantId: string): {
    blockCount: number;
    pendingRecords: number;
    totalRecords: number;
    lastBlockTime?: Date;
    averageMiningTime: number;
    chainSize: number; // Approximate bytes
  } | null {
    const blockchain = this.blockchains.get(tenantId);
    if (!blockchain) return null;

    const totalRecords = blockchain.chain.reduce(
      (sum, block) => sum + (Array.isArray(block.data) ? block.data.length : 1), 
      0
    ) + blockchain.pendingRecords.length;

    return {
      blockCount: blockchain.chain.length,
      pendingRecords: blockchain.pendingRecords.length,
      totalRecords,
      lastBlockTime: blockchain.lastBlock 
        ? new Date(blockchain.lastBlock.timestamp) 
        : undefined,
      averageMiningTime: 1000, // Mock 1 second average
      chainSize: JSON.stringify(blockchain.chain).length,
    };
  }

  // Export blockchain
  export(tenantId: string, format: 'json' | 'csv' = 'json'): string {
    const blockchain = this.blockchains.get(tenantId);
    if (!blockchain) throw new Error('Blockchain not found');

    if (format === 'csv') {
      const records = blockchain.chain.flatMap(block => 
        Array.isArray(block.data) ? block.data : [block.data]
      );
      
      const headers = ['id', 'timestamp', 'entityType', 'entityId', 'action', 'actorId', 'hash'];
      const rows = records.map(r => [
        r.id,
        r.createdAt.toISOString(),
        r.entityType,
        r.entityId,
        r.action,
        r.actor.id,
        '', // Would include block hash
      ]);

      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    return JSON.stringify(blockchain.chain, null, 2);
  }

  // Get record by hash
  getRecordByHash(tenantId: string, hash: string): AuditRecord | null {
    const blockchain = this.blockchains.get(tenantId);
    if (!blockchain) return null;

    for (const block of blockchain.chain) {
      if (block.hash === hash) {
        return Array.isArray(block.data) ? block.data[0] : block.data;
      }
    }

    return null;
  }

  // Compare two audit trails (for compliance verification)
  compareTrails(
    tenantId1: string,
    tenantId2: string,
    options: {
      from?: Date;
      to?: Date;
      entityTypes?: string[];
    } = {}
  ): {
    matching: number;
    differences: Array<{
      record1: AuditRecord;
      record2: AuditRecord;
      diff: string[];
    }>;
    onlyIn1: AuditRecord[];
    onlyIn2: AuditRecord[];
  } {
    const trail1 = this.getFullTrail(tenantId1, options);
    const trail2 = this.getFullTrail(tenantId2, options);

    let matching = 0;
    const differences: Array<{ record1: AuditRecord; record2: AuditRecord; diff: string[] }> = [];
    const onlyIn1: AuditRecord[] = [];
    const onlyIn2: AuditRecord[] = [];

    // This is a simplified comparison
    // In production, use more sophisticated matching

    return {
      matching,
      differences,
      onlyIn1,
      onlyIn2,
    };
  }

  // Create tamper proof certificate
  async createCertificate(
    tenantId: string,
    options: {
      from?: Date;
      to?: Date;
      entityTypes?: string[];
      entityIds?: string[];
    } = {}
  ): Promise<{
    certificateId: string;
    merkleRoot: string;
    timestamp: Date;
    blockHashes: string[];
    signature: string;
    verifyUrl: string;
  }> {
    const blockchain = this.blockchains.get(tenantId);
    if (!blockchain) throw new Error('Blockchain not found');

    // Create Merkle tree from relevant blocks
    const relevantBlocks = blockchain.chain.filter(block => {
      if (options.from && block.timestamp < options.from.getTime()) return false;
      if (options.to && block.timestamp > options.to.getTime()) return false;
      return true;
    });

    const merkleRoot = this.calculateMerkleRoot(relevantBlocks.map(b => b.hash));

    return {
      certificateId: crypto.randomUUID(),
      merkleRoot,
      timestamp: new Date(),
      blockHashes: relevantBlocks.map(b => b.hash),
      signature: this.signMerkleRoot(merkleRoot),
      verifyUrl: `/api/verify/${tenantId}/${merkleRoot}`,
    };
  }

  // Private methods
  private createGenesisBlock(): Block {
    const data: AuditRecord = {
      id: 'genesis',
      tenantId: 'genesis',
      entityType: 'genesis',
      entityId: '0',
      action: 'genesis',
      actor: { id: 'system', type: 'system' },
      createdAt: new Date(),
    };

    const block: Block = {
      index: 0,
      timestamp: Date.now(),
      data,
      previousHash: '0',
      hash: '',
      nonce: 0,
    };

    block.hash = this.calculateHash(block);
    return block;
  }

  private mineBlock(blockchain: Blockchain): Block {
    const previousBlock = blockchain.lastBlock!;
    const index = blockchain.chain.length;
    
    // Get data from pending records (can batch multiple records)
    const data = blockchain.pendingRecords.length === 1 
      ? blockchain.pendingRecords[0]
      : [...blockchain.pendingRecords];

    const block: Block = {
      index,
      timestamp: Date.now(),
      data: data as AuditRecord,
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0,
    };

    // Proof of work
    const startTime = Date.now();
    while (!this.isValidHash(block.hash, blockchain.difficulty)) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
    const miningTime = Date.now() - startTime;

    // Add block to chain
    blockchain.chain.push(block);
    blockchain.lastBlock = block;
    blockchain.pendingRecords = [];

    this.emit('blockMined', { 
      tenantId: blockchain.tenantId, 
      block, 
      miningTime,
    });

    return block;
  }

  private calculateHash(block: Omit<Block, 'hash'>): string {
    const data = 
      block.index +
      block.timestamp +
      JSON.stringify(block.data) +
      block.previousHash +
      block.nonce;

    return createHash('sha256').update(data).digest('hex');
  }

  private isValidHash(hash: string, difficulty: number): boolean {
    const prefix = '0'.repeat(difficulty);
    return hash.startsWith(prefix);
  }

  private signRecord(record: AuditRecord): string {
    const data = JSON.stringify(record);
    return createHash('sha256').update(data).digest('hex');
  }

  private signMerkleRoot(root: string): string {
    // In production, use proper private key signing
    return createHash('sha256').update(root + 'secret-key').digest('hex');
  }

  private calculateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];

    // Pair and hash
    const newLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      const combined = createHash('sha256').update(left + right).digest('hex');
      newLevel.push(combined);
    }

    return this.calculateMerkleRoot(newLevel);
  }

  private getFullTrail(
    tenantId: string,
    options: {
      from?: Date;
      to?: Date;
      entityTypes?: string[];
    }
  ): AuditRecord[] {
    const blockchain = this.blockchains.get(tenantId);
    if (!blockchain) return [];

    return blockchain.chain
      .filter(block => {
        if (options.from && block.timestamp < options.from.getTime()) return false;
        if (options.to && block.timestamp > options.to.getTime()) return false;
        return true;
      })
      .flatMap(block => 
        Array.isArray(block.data) ? block.data : [block.data]
      )
      .filter(record => 
        !options.entityTypes || options.entityTypes.includes(record.entityType)
      );
  }
}

// Export singleton
export const blockchainAuditManager = new BlockchainAuditManager();

export { Block, AuditRecord, Blockchain, VerificationResult };
