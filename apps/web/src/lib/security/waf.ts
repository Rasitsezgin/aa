// WAF Manager
// Web Application Firewall rules and protection

import { EventEmitter } from 'events';

type WAFRuleAction = 'allow' | 'block' | 'count' | 'captcha' | 'challenge';
type WAFRulePriority = 1 | 2 | 3 | 4 | 5;

interface WAFWebACL {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  scope: 'cloudfront' | 'regional';
  status: 'active' | 'disabled';
  defaultAction: 'allow' | 'block';
  rules: WAFRule[];
  visibilityConfig: {
    sampledRequestsEnabled: boolean;
    cloudWatchMetricsEnabled: boolean;
    metricName: string;
  };
  capacity: number; // 0-1500
  association: string[]; // Resource ARNs
  createdAt: Date;
  updatedAt: Date;
}

interface WAFRule {
  id: string;
  name: string;
  priority: WAFRulePriority;
  action: WAFRuleAction;
  statement: WAFStatement;
  visibilityConfig: {
    sampledRequestsEnabled: boolean;
    cloudWatchMetricsEnabled: boolean;
    metricName: string;
  };
  overrideAction?: {
    type: 'none' | 'count';
  };
}

type WAFStatement = 
  | { type: 'byte_match'; field: string; searchString: string; position: 'contains' | 'exactly' | 'starts_with' | 'ends_with' }
  | { type: 'sqli_match'; field: string }
  | { type: 'xss_match'; field: string }
  | { type: 'rate_based'; limit: number; aggregateKey: 'ip' | 'forwarded_ip' }
  | { type: 'geo_match'; countries: string[] }
  | { type: 'ip_set'; ipSetId: string }
  | { type: 'size_constraint'; field: string; operator: 'eq' | 'ne' | 'le' | 'lt' | 'ge' | 'gt'; size: number }
  | { type: 'managed_rule_group'; vendor: string; name: string; version?: string }
  | { type: 'and'; statements: WAFStatement[] }
  | { type: 'or'; statements: WAFStatement[] }
  | { type: 'not'; statement: WAFStatement };

interface IPSet {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  addresses: string[]; // CIDR blocks
  type: 'ipv4' | 'ipv6';
}

interface WAFRequest {
  id: string;
  webAclId: string;
  timestamp: Date;
  clientIp: string;
  country?: string;
  method: string;
  uri: string;
  headers: Record<string, string>;
  action: WAFRuleAction;
  ruleId?: string;
  terminatingRuleId?: string;
  labels: string[];
}

interface RateLimitRule {
  id: string;
  name: string;
  limit: number; // requests per 5 minutes
  aggregateKey: 'ip' | 'forwarded_ip' | 'custom';
  customKey?: string;
  action: 'block' | 'count';
  scopeDownStatement?: WAFStatement;
}

// WAF Manager
export class WAFManager extends EventEmitter {
  private webACLs: Map<string, WAFWebACL> = new Map();
  private ipSets: Map<string, IPSet> = new Map();
  private requests: Map<string, WAFRequest[]> = new Map();

  // Create WebACL
  createWebACL(
    tenantId: string,
    config: Omit<WAFWebACL, 'id' | 'capacity' | 'association' | 'rules' | 'createdAt' | 'updatedAt'>
  ): WAFWebACL {
    const acl: WAFWebACL = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
      capacity: 0,
      association: [],
      rules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.webACLs.set(acl.id, acl);
    this.emit('webACLCreated', acl);
    return acl;
  }

  // Add rule to WebACL
  addRule(
    aclId: string,
    rule: Omit<WAFRule, 'id'>
  ): WAFRule {
    const acl = this.webACLs.get(aclId);
    if (!acl) throw new Error('WebACL not found');

    const fullRule: WAFRule = {
      ...rule,
      id: crypto.randomUUID(),
    };

    acl.rules.push(fullRule);
    acl.rules.sort((a, b) => a.priority - b.priority);
    
    // Update capacity
    acl.capacity += this.calculateRuleCapacity(fullRule);
    acl.updatedAt = new Date();

    this.emit('ruleAdded', { aclId, rule: fullRule });
    return fullRule;
  }

  // Remove rule
  removeRule(aclId: string, ruleId: string): void {
    const acl = this.webACLs.get(aclId);
    if (!acl) return;

    const rule = acl.rules.find(r => r.id === ruleId);
    if (rule) {
      acl.capacity -= this.calculateRuleCapacity(rule);
      acl.rules = acl.rules.filter(r => r.id !== ruleId);
      acl.updatedAt = new Date();
    }
  }

  // Create IP Set
  createIPSet(
    tenantId: string,
    config: Omit<IPSet, 'id'>
  ): IPSet {
    const ipSet: IPSet = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
    };

    this.ipSets.set(ipSet.id, ipSet);
    this.emit('ipSetCreated', ipSet);
    return ipSet;
  }

  // Update IP Set
  updateIPSet(ipSetId: string, addresses: string[]): IPSet {
    const ipSet = this.ipSets.get(ipSetId);
    if (!ipSet) throw new Error('IP Set not found');

    ipSet.addresses = addresses;
    this.emit('ipSetUpdated', ipSet);
    return ipSet;
  }

  // Associate WebACL with resource
  associate(aclId: string, resourceArn: string): void {
    const acl = this.webACLs.get(aclId);
    if (!acl) throw new Error('WebACL not found');

    if (!acl.association.includes(resourceArn)) {
      acl.association.push(resourceArn);
      acl.updatedAt = new Date();
    }

    this.emit('webACLAssociated', { aclId, resourceArn });
  }

  // Disassociate
  disassociate(aclId: string, resourceArn: string): void {
    const acl = this.webACLs.get(aclId);
    if (!acl) return;

    acl.association = acl.association.filter(a => a !== resourceArn);
    acl.updatedAt = new Date();

    this.emit('webACLDisassociated', { aclId, resourceArn });
  }

  // Process request through WAF
  processRequest(
    aclId: string,
    request: Omit<WAFRequest, 'id' | 'webAclId' | 'action' | 'ruleId' | 'terminatingRuleId' | 'labels'>
  ): WAFRequest {
    const acl = this.webACLs.get(aclId);
    if (!acl) throw new Error('WebACL not found');

    const fullRequest: WAFRequest = {
      ...request,
      id: crypto.randomUUID(),
      webAclId: aclId,
      action: acl.defaultAction,
      labels: [],
    };

    // Evaluate rules in priority order
    for (const rule of acl.rules) {
      const matches = this.evaluateStatement(rule.statement, fullRequest);

      if (matches) {
        fullRequest.action = rule.action;
        fullRequest.ruleId = rule.id;
        fullRequest.labels.push(rule.name);

        if (rule.action !== 'count') {
          fullRequest.terminatingRuleId = rule.id;
          break; // Rule terminated evaluation
        }
      }
    }

    // Store request sample
    const requests = this.requests.get(aclId) || [];
    requests.unshift(fullRequest);
    this.requests.set(aclId, requests.slice(0, 10000));

    this.emit('requestProcessed', fullRequest);
    return fullRequest;
  }

  // Get blocked requests
  getBlockedRequests(
    aclId: string,
    period: { from: Date; to: Date }
  ): WAFRequest[] {
    const requests = this.requests.get(aclId) || [];
    
    return requests.filter(r => 
      r.action === 'block' &&
      r.timestamp >= period.from &&
      r.timestamp <= period.to
    );
  }

  // Get attack statistics
  getAttackStats(aclId: string): {
    totalRequests: number;
    allowed: number;
    blocked: number;
    captcha: number;
    topCountries: Array<{ country: string; count: number }>;
    topRules: Array<{ rule: string; count: number }>;
  } {
    const requests = this.requests.get(aclId) || [];
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = requests.filter(r => r.timestamp >= last24h);

    const countryCounts: Record<string, number> = {};
    const ruleCounts: Record<string, number> = {};

    for (const req of recent) {
      if (req.country) {
        countryCounts[req.country] = (countryCounts[req.country] || 0) + 1;
      }
      if (req.ruleId) {
        ruleCounts[req.ruleId] = (ruleCounts[req.ruleId] || 0) + 1;
      }
    }

    return {
      totalRequests: recent.length,
      allowed: recent.filter(r => r.action === 'allow').length,
      blocked: recent.filter(r => r.action === 'block').length,
      captcha: recent.filter(r => r.action === 'captcha').length,
      topCountries: Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topRules: Object.entries(ruleCounts)
        .map(([rule, count]) => ({ rule, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  // List WebACLs
  listWebACLs(tenantId: string): WAFWebACL[] {
    return Array.from(this.webACLs.values())
      .filter(acl => acl.tenantId === tenantId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get predefined rules
  getManagedRules(): Array<{
    vendor: string;
    name: string;
    description: string;
    version: string;
  }> {
    return [
      { vendor: 'AWS', name: 'AWSManagedRulesCommonRuleSet', description: 'Common OWASP rules', version: '1.0' },
      { vendor: 'AWS', name: 'AWSManagedRulesKnownBadInputsRuleSet', description: 'Known bad inputs', version: '1.0' },
      { vendor: 'AWS', name: 'AWSManagedRulesSQLiRuleSet', description: 'SQL injection protection', version: '1.0' },
      { vendor: 'AWS', name: 'AWSManagedRulesLinuxOSRuleSet', description: 'Linux OS protections', version: '1.0' },
      { vendor: 'AWS', name: 'AWSManagedRulesPHPRuleSet', description: 'PHP application protections', version: '1.0' },
      { vendor: 'AWS', name: 'AWSManagedRulesWordPressRuleSet', description: 'WordPress protections', version: '1.0' },
    ];
  }

  // Private methods
  private calculateRuleCapacity(rule: WAFRule): number {
    // WCU (Web ACL Capacity Units) calculation
    switch (rule.statement.type) {
      case 'byte_match': return 2;
      case 'sqli_match': return 20;
      case 'xss_match': return 40;
      case 'rate_based': return 2;
      case 'geo_match': return 1;
      case 'ip_set': return 1;
      case 'size_constraint': return 1;
      case 'managed_rule_group': return 100;
      case 'and': return 1;
      case 'or': return 1;
      case 'not': return 1;
      default: return 1;
    }
  }

  private evaluateStatement(statement: WAFStatement, request: WAFRequest): boolean {
    switch (statement.type) {
      case 'byte_match':
        const field = this.getFieldValue(statement.field, request);
        if (statement.position === 'contains') {
          return field.includes(statement.searchString);
        }
        return field === statement.searchString;

      case 'sqli_match':
        const sqlPatterns = [/union\s+select/i, /select\s+.*\s+from/i, /insert\s+into/i];
        const sqlField = this.getFieldValue(statement.field, request);
        return sqlPatterns.some(p => p.test(sqlField));

      case 'xss_match':
        const xssPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];
        const xssField = this.getFieldValue(statement.field, request);
        return xssPatterns.some(p => p.test(xssField));

      case 'rate_based':
        // Would check rate limit store
        return false;

      case 'geo_match':
        return statement.countries.includes(request.country || '');

      case 'ip_set':
        const ipSet = this.ipSets.get(statement.ipSetId);
        return ipSet ? ipSet.addresses.some(addr => this.ipMatches(request.clientIp, addr)) : false;

      case 'size_constraint':
        const sizeField = this.getFieldValue(statement.field, request);
        const size = Buffer.byteLength(sizeField);
        switch (statement.operator) {
          case 'eq': return size === statement.size;
          case 'ne': return size !== statement.size;
          case 'le': return size <= statement.size;
          case 'lt': return size < statement.size;
          case 'ge': return size >= statement.size;
          case 'gt': return size > statement.size;
        }
        return false;

      case 'managed_rule_group':
        // Would evaluate managed rule group
        return false;

      case 'and':
        return statement.statements.every(s => this.evaluateStatement(s, request));

      case 'or':
        return statement.statements.some(s => this.evaluateStatement(s, request));

      case 'not':
        return !this.evaluateStatement(statement.statement, request);

      default:
        return false;
    }
  }

  private getFieldValue(field: string, request: WAFRequest): string {
    switch (field.toLowerCase()) {
      case 'uri': return request.uri;
      case 'method': return request.method;
      case 'querystring': return '';
      case 'header': return JSON.stringify(request.headers);
      case 'body': return '';
      default: return '';
    }
  }

  private ipMatches(ip: string, cidr: string): boolean {
    // Simplified CIDR matching
    if (cidr.includes('/')) {
      const [network, mask] = cidr.split('/');
      return ip.startsWith(network.split('.').slice(0, parseInt(mask) / 8).join('.'));
    }
    return ip === cidr;
  }
}

// Export singleton
export const wafManager = new WAFManager();

export type { WAFWebACL, WAFRule, WAFStatement, IPSet, WAFRequest, WAFRuleAction };
