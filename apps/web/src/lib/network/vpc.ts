// VPC Network Manager
// Virtual Private Cloud and network isolation

import { EventEmitter } from 'events';

type SubnetType = 'public' | 'private' | 'isolated';
type GatewayType = 'internet' | 'nat' | 'vpn' | 'transit';

interface VPC {
  id: string;
  tenantId: string;
  name: string;
  cidr: string;
  region: string;
  status: 'pending' | 'available' | 'failed';
  subnets: Subnet[];
  gateways: Gateway[];
  routeTables: RouteTable[];
  securityGroups: SecurityGroup[];
  networkACLs: NetworkACL[];
  dns: {
    enabled: boolean;
    hostnames: boolean;
    resolution: boolean;
  };
  createdAt: Date;
}

interface Subnet {
  id: string;
  name: string;
  cidr: string;
  az: string; // Availability zone
  type: SubnetType;
  availableIps: number;
  mapPublicIp: boolean;
}

interface Gateway {
  id: string;
  type: GatewayType;
  name: string;
  attached: boolean;
  config: Record<string, unknown>;
}

interface RouteTable {
  id: string;
  name: string;
  main: boolean;
  routes: Array<{
    destination: string;
    target: string;
    type: 'igw' | 'nat' | 'vpc_peering' | 'transit' | 'local';
  }>;
  subnetAssociations: string[];
}

interface SecurityGroup {
  id: string;
  name: string;
  description: string;
  inbound: SecurityRule[];
  outbound: SecurityRule[];
}

interface SecurityRule {
  id: string;
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  portRange: { from: number; to: number } | 'all';
  source: string; // CIDR or security group ID
  description?: string;
}

interface NetworkACL {
  id: string;
  name: string;
  subnetIds: string[];
  inbound: ACLRule[];
  outbound: ACLRule[];
}

interface ACLRule {
  number: number;
  protocol: string;
  portRange?: { from: number; to: number };
  source?: string;
  action: 'allow' | 'deny';
}

// VPC Manager
export class VPCManager extends EventEmitter {
  private vpcs: Map<string, VPC> = new Map();

  // Create VPC
  createVPC(config: Omit<VPC, 'id' | 'subnets' | 'gateways' | 'routeTables' | 'securityGroups' | 'networkACLs' | 'createdAt'>): VPC {
    const vpc: VPC = {
      ...config,
      id: crypto.randomUUID(),
      subnets: [],
      gateways: [],
      routeTables: [],
      securityGroups: [],
      networkACLs: [],
      createdAt: new Date(),
    };

    // Create default security group
    vpc.securityGroups.push(this.createDefaultSecurityGroup(vpc.id));

    // Create main route table
    vpc.routeTables.push({
      id: crypto.randomUUID(),
      name: 'main',
      main: true,
      routes: [{ destination: config.cidr, target: 'local', type: 'local' }],
      subnetAssociations: [],
    });

    this.vpcs.set(vpc.id, vpc);
    this.emit('vpcCreated', vpc);
    return vpc;
  }

  // Create subnet
  createSubnet(
    vpcId: string,
    config: Omit<Subnet, 'id' | 'availableIps'>
  ): Subnet {
    const vpc = this.vpcs.get(vpcId);
    if (!vpc) throw new Error('VPC not found');

    const subnet: Subnet = {
      ...config,
      id: crypto.randomUUID(),
      availableIps: this.calculateAvailableIps(config.cidr),
    };

    vpc.subnets.push(subnet);

    // Associate with route table
    const mainRouteTable = vpc.routeTables.find(rt => rt.main);
    if (mainRouteTable) {
      mainRouteTable.subnetAssociations.push(subnet.id);
    }

    this.emit('subnetCreated', { vpcId, subnet });
    return subnet;
  }

  // Create internet gateway
  createInternetGateway(vpcId: string): Gateway {
    const vpc = this.vpcs.get(vpcId);
    if (!vpc) throw new Error('VPC not found');

    const gateway: Gateway = {
      id: crypto.randomUUID(),
      type: 'internet',
      name: 'igw',
      attached: true,
      config: {},
    };

    vpc.gateways.push(gateway);

    // Add route to main route table
    const mainRouteTable = vpc.routeTables.find(rt => rt.main);
    if (mainRouteTable) {
      mainRouteTable.routes.push({
        destination: '0.0.0.0/0',
        target: gateway.id,
        type: 'igw',
      });
    }

    this.emit('gatewayCreated', { vpcId, gateway });
    return gateway;
  }

  // Create NAT gateway
  createNATGateway(vpcId: string, subnetId: string): Gateway {
    const vpc = this.vpcs.get(vpcId);
    if (!vpc) throw new Error('VPC not found');

    const gateway: Gateway = {
      id: crypto.randomUUID(),
      type: 'nat',
      name: `nat-${subnetId}`,
      attached: true,
      config: { subnetId },
    };

    vpc.gateways.push(gateway);

    // Add route in private subnet route tables
    for (const routeTable of vpc.routeTables) {
      if (routeTable.subnetAssociations.includes(subnetId)) {
        routeTable.routes.push({
          destination: '0.0.0.0/0',
          target: gateway.id,
          type: 'nat',
        });
      }
    }

    this.emit('natGatewayCreated', { vpcId, gateway });
    return gateway;
  }

  // Create security group
  createSecurityGroup(
    vpcId: string,
    config: { name: string; description: string }
  ): SecurityGroup {
    const vpc = this.vpcs.get(vpcId);
    if (!vpc) throw new Error('VPC not found');

    const sg: SecurityGroup = {
      id: crypto.randomUUID(),
      name: config.name,
      description: config.description,
      inbound: [],
      outbound: [
        {
          id: crypto.randomUUID(),
          protocol: 'all',
          portRange: 'all',
          source: '0.0.0.0/0',
          description: 'Allow all outbound',
        },
      ],
    };

    vpc.securityGroups.push(sg);
    this.emit('securityGroupCreated', { vpcId, securityGroup: sg });
    return sg;
  }

  // Add security group rule
  addSecurityGroupRule(
    vpcId: string,
    sgId: string,
    direction: 'inbound' | 'outbound',
    rule: Omit<SecurityRule, 'id'>
  ): SecurityGroup {
    const vpc = this.vpcs.get(vpcId);
    if (!vpc) throw new Error('VPC not found');

    const sg = vpc.securityGroups.find(s => s.id === sgId);
    if (!sg) throw new Error('Security group not found');

    const fullRule: SecurityRule = {
      ...rule,
      id: crypto.randomUUID(),
    };

    if (direction === 'inbound') {
      sg.inbound.push(fullRule);
    } else {
      sg.outbound.push(fullRule);
    }

    return sg;
  }

  // Create VPC peering
  createPeering(
    vpcId: string,
    peerVpcId: string,
    options: {
      autoAccept?: boolean;
    } = {}
  ): {
    peeringId: string;
    status: 'pending' | 'active';
  } {
    const vpc = this.vpcs.get(vpcId);
    const peerVpc = this.vpcs.get(peerVpcId);

    if (!vpc || !peerVpc) throw new Error('VPC not found');

    const peeringId = crypto.randomUUID();

    // Add routes to both VPCs
    vpc.routeTables.forEach(rt => {
      rt.routes.push({
        destination: peerVpc.cidr,
        target: peeringId,
        type: 'vpc_peering',
      });
    });

    peerVpc.routeTables.forEach(rt => {
      rt.routes.push({
        destination: vpc.cidr,
        target: peeringId,
        type: 'vpc_peering',
      });
    });

    this.emit('peeringCreated', { peeringId, vpcId, peerVpcId });

    return {
      peeringId,
      status: options.autoAccept ? 'active' : 'pending',
    };
  }

  // Get VPC details
  getVPC(vpcId: string): VPC | null {
    return this.vpcs.get(vpcId) || null;
  }

  // List VPCs for tenant
  listVPCs(tenantId: string): VPC[] {
    return Array.from(this.vpcs.values())
      .filter(v => v.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get network topology
  getTopology(vpcId: string): {
    vpc: VPC;
    diagram: string;
  } | null {
    const vpc = this.vpcs.get(vpcId);
    if (!vpc) return null;

    // Generate Mermaid diagram
    let diagram = `graph TB\n`;
    diagram += `  Internet[Internet] --> IGW[Internet Gateway]\n`;
    diagram += `  IGW --> Public1[Public Subnet 1]\n`;
    diagram += `  IGW --> Public2[Public Subnet 2]\n`;
    diagram += `  NAT[NAT Gateway] --> Private1[Private Subnet 1]\n`;
    diagram += `  NAT --> Private2[Private Subnet 2]\n`;
    diagram += `  Public1 --> NAT\n`;
    diagram += `  Public2 --> NAT\n`;

    return { vpc, diagram };
  }

  // Validate security group rules
  validateSecurityGroupRules(vpcId: string, sgId: string): {
    valid: boolean;
    issues: string[];
  } {
    const vpc = this.vpcs.get(vpcId);
    if (!vpc) return { valid: false, issues: ['VPC not found'] };

    const sg = vpc.securityGroups.find(s => s.id === sgId);
    if (!sg) return { valid: false, issues: ['Security group not found'] };

    const issues: string[] = [];

    // Check for overly permissive rules
    for (const rule of sg.inbound) {
      if (rule.source === '0.0.0.0/0' && rule.portRange === 'all') {
        issues.push('Warning: Inbound rule allows all traffic from anywhere');
      }
      if (rule.source === '0.0.0.0/0' && 
          typeof rule.portRange !== 'string' &&
          rule.portRange.from === 22) {
        issues.push('Warning: SSH (22) open to the world');
      }
    }

    return { valid: issues.length === 0, issues };
  }

  // Private methods
  private createDefaultSecurityGroup(vpcId: string): SecurityGroup {
    return {
      id: crypto.randomUUID(),
      name: 'default',
      description: 'Default security group',
      inbound: [],
      outbound: [
        {
          id: crypto.randomUUID(),
          protocol: 'all',
          portRange: 'all',
          source: '0.0.0.0/0',
        },
      ],
    };
  }

  private calculateAvailableIps(cidr: string): number {
    // Simplified calculation
    const parts = cidr.split('/');
    if (parts.length !== 2) return 0;
    
    const mask = parseInt(parts[1], 10);
    if (mask < 16 || mask > 28) return 0;
    
    return Math.pow(2, 32 - mask) - 5; // -5 for reserved IPs
  }
}

// VPC presets
export const VPC_PRESETS = {
  standard: {
    cidr: '10.0.0.0/16',
    subnets: [
      { name: 'public-1a', cidr: '10.0.1.0/24', az: 'a', type: 'public' as const },
      { name: 'public-1b', cidr: '10.0.2.0/24', az: 'b', type: 'public' as const },
      { name: 'private-1a', cidr: '10.0.3.0/24', az: 'a', type: 'private' as const },
      { name: 'private-1b', cidr: '10.0.4.0/24', az: 'b', type: 'private' as const },
    ],
  },
  isolated: {
    cidr: '10.1.0.0/16',
    subnets: [
      { name: 'private-1a', cidr: '10.1.1.0/24', az: 'a', type: 'isolated' as const },
      { name: 'private-1b', cidr: '10.1.2.0/24', az: 'b', type: 'isolated' as const },
    ],
  },
};

// Export singleton
export const vpcManager = new VPCManager();

export { VPC, Subnet, Gateway, SecurityGroup, RouteTable };
