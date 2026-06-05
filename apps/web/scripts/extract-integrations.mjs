import fs from 'fs';
import path from 'path';

const srcPath = path.resolve('src/components/landing/IntegrationsClient.tsx');
const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('const integrations: Integration[] = [');
const end = src.indexOf('\n];', start) + 3;
const integrationsBlock = src.slice(start, end);

const header = `import {
    Store, ShoppingCart, Calculator, Truck, FileText, FileCode2, TrendingUp, Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CategoryId = 'all' | 'pazaryeri' | 'eticaret' | 'muhasebe' | 'kargo' | 'efatura' | 'xml' | 'dropshipping' | 'reklam';

export interface Integration {
    id: string;
    name: string;
    category: CategoryId;
    color: string;
    gradient: string;
    logo: string;
    desc: string;
    shortDesc: string;
    features: string[];
    stats: { users: string; syncTime: string; uptime: string };
    rating: number;
    reviews: number;
    isPopular: boolean;
    isNew: boolean;
    documentation: string;
    setupTime: string;
    price: string;
    requirements: string[];
}

export const categoryMeta: { id: CategoryId; name: string; icon: LucideIcon }[] = [
    { id: 'all', name: 'Tümü', icon: Layers },
    { id: 'pazaryeri', name: 'Pazaryerleri', icon: Store },
    { id: 'eticaret', name: 'E-ticaret', icon: ShoppingCart },
    { id: 'muhasebe', name: 'Muhasebe', icon: Calculator },
    { id: 'kargo', name: 'Kargo', icon: Truck },
    { id: 'efatura', name: 'E-Fatura', icon: FileText },
    { id: 'xml', name: 'XML', icon: FileCode2 },
    { id: 'reklam', name: 'Reklam', icon: TrendingUp },
];

`;

const body = integrationsBlock.replace('const integrations: Integration[]', 'export const integrations: Integration[]');
const outPath = path.resolve('src/components/landing/integrations-data.ts');
fs.writeFileSync(outPath, header + body + '\n');
console.log('Wrote', outPath);
