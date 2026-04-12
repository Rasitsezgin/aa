"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Code, Copy, Check, ChevronRight, ChevronDown, Search, Book, Zap, Shield, Globe, 
    Terminal, Key, Package, ShoppingCart, BarChart3, Users, Webhook, Settings,
    Play, Download, ExternalLink, Lock, Clock, CheckCircle2, ArrowRight, Sparkles,
    FileJson, Braces, Hash, AlertCircle, Info, Server, Database, Cpu, RefreshCw,
    Layers, GitBranch, Send, Eye, Star, MessageCircle, FileCode, Box, Tag, Truck
} from 'lucide-react';
import Link from 'next/link';

// API Kategorileri
const apiCategories = [
    {
        id: 'products',
        category: "Ürünler",
        icon: Package,
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-500',
        description: 'Ürün yönetimi endpointleri',
        endpoints: [
            { method: "GET", path: "/api/v1/products", description: "Tüm ürünleri listele", auth: true, rateLimit: "1000/dk" },
            { method: "GET", path: "/api/v1/products/{id}", description: "Tek ürün detayı", auth: true, rateLimit: "1000/dk" },
            { method: "POST", path: "/api/v1/products", description: "Yeni ürün oluştur", auth: true, rateLimit: "500/dk" },
            { method: "PUT", path: "/api/v1/products/{id}", description: "Ürün güncelle", auth: true, rateLimit: "500/dk" },
            { method: "PATCH", path: "/api/v1/products/{id}/price", description: "Fiyat güncelle", auth: true, rateLimit: "1000/dk" },
            { method: "DELETE", path: "/api/v1/products/{id}", description: "Ürün sil", auth: true, rateLimit: "100/dk" },
            { method: "POST", path: "/api/v1/products/bulk", description: "Toplu ürün işlemi", auth: true, rateLimit: "50/dk" },
            { method: "GET", path: "/api/v1/products/{id}/variants", description: "Varyantları listele", auth: true, rateLimit: "1000/dk" },
        ]
    },
    {
        id: 'orders',
        category: "Siparişler",
        icon: ShoppingCart,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Sipariş yönetimi endpointleri',
        endpoints: [
            { method: "GET", path: "/api/v1/orders", description: "Tüm siparişleri listele", auth: true, rateLimit: "1000/dk" },
            { method: "GET", path: "/api/v1/orders/{id}", description: "Sipariş detayı", auth: true, rateLimit: "1000/dk" },
            { method: "PUT", path: "/api/v1/orders/{id}/status", description: "Sipariş durumu güncelle", auth: true, rateLimit: "500/dk" },
            { method: "POST", path: "/api/v1/orders/{id}/ship", description: "Siparişi kargola", auth: true, rateLimit: "500/dk" },
            { method: "POST", path: "/api/v1/orders/{id}/cancel", description: "Sipariş iptal", auth: true, rateLimit: "100/dk" },
            { method: "GET", path: "/api/v1/orders/{id}/tracking", description: "Kargo takip", auth: true, rateLimit: "1000/dk" },
            { method: "POST", path: "/api/v1/orders/{id}/invoice", description: "Fatura oluştur", auth: true, rateLimit: "500/dk" },
        ]
    },
    {
        id: 'inventory',
        category: "Stok",
        icon: BarChart3,
        color: 'amber',
        gradient: 'from-amber-500 to-orange-500',
        description: 'Stok yönetimi endpointleri',
        endpoints: [
            { method: "GET", path: "/api/v1/inventory", description: "Stok durumu", auth: true, rateLimit: "1000/dk" },
            { method: "GET", path: "/api/v1/inventory/{sku}", description: "SKU bazlı stok", auth: true, rateLimit: "1000/dk" },
            { method: "PUT", path: "/api/v1/inventory/{sku}", description: "Stok güncelle", auth: true, rateLimit: "1000/dk" },
            { method: "POST", path: "/api/v1/inventory/sync", description: "Stok senkronize et", auth: true, rateLimit: "100/dk" },
            { method: "POST", path: "/api/v1/inventory/bulk-update", description: "Toplu stok güncelle", auth: true, rateLimit: "50/dk" },
            { method: "GET", path: "/api/v1/inventory/low-stock", description: "Düşük stok uyarıları", auth: true, rateLimit: "500/dk" },
        ]
    },
    {
        id: 'marketplaces',
        category: "Pazaryerleri",
        icon: Globe,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-500',
        description: 'Pazaryeri entegrasyonları',
        endpoints: [
            { method: "GET", path: "/api/v1/marketplaces", description: "Bağlı pazaryerlerini listele", auth: true, rateLimit: "500/dk" },
            { method: "POST", path: "/api/v1/marketplaces/connect", description: "Yeni pazaryeri bağla", auth: true, rateLimit: "50/dk" },
            { method: "DELETE", path: "/api/v1/marketplaces/{id}", description: "Pazaryeri bağlantısını kes", auth: true, rateLimit: "50/dk" },
            { method: "POST", path: "/api/v1/marketplaces/{id}/sync", description: "Pazaryeri senkronize et", auth: true, rateLimit: "10/dk" },
            { method: "GET", path: "/api/v1/marketplaces/{id}/status", description: "Senkronizasyon durumu", auth: true, rateLimit: "500/dk" },
            { method: "POST", path: "/api/v1/marketplaces/{id}/publish", description: "Ürün yayınla", auth: true, rateLimit: "100/dk" },
        ]
    },
    {
        id: 'customers',
        category: "Müşteriler",
        icon: Users,
        color: 'rose',
        gradient: 'from-rose-500 to-red-500',
        description: 'Müşteri yönetimi endpointleri',
        endpoints: [
            { method: "GET", path: "/api/v1/customers", description: "Tüm müşterileri listele", auth: true, rateLimit: "500/dk" },
            { method: "GET", path: "/api/v1/customers/{id}", description: "Müşteri detayı", auth: true, rateLimit: "500/dk" },
            { method: "GET", path: "/api/v1/customers/{id}/orders", description: "Müşteri siparişleri", auth: true, rateLimit: "500/dk" },
            { method: "PUT", path: "/api/v1/customers/{id}", description: "Müşteri güncelle", auth: true, rateLimit: "200/dk" },
            { method: "GET", path: "/api/v1/customers/{id}/analytics", description: "Müşteri analitiği", auth: true, rateLimit: "200/dk" },
        ]
    },
    {
        id: 'webhooks',
        category: "Webhooks",
        icon: Webhook,
        color: 'indigo',
        gradient: 'from-indigo-500 to-violet-500',
        description: 'Webhook yönetimi',
        endpoints: [
            { method: "GET", path: "/api/v1/webhooks", description: "Tüm webhook'ları listele", auth: true, rateLimit: "500/dk" },
            { method: "POST", path: "/api/v1/webhooks", description: "Yeni webhook oluştur", auth: true, rateLimit: "50/dk" },
            { method: "PUT", path: "/api/v1/webhooks/{id}", description: "Webhook güncelle", auth: true, rateLimit: "50/dk" },
            { method: "DELETE", path: "/api/v1/webhooks/{id}", description: "Webhook sil", auth: true, rateLimit: "50/dk" },
            { method: "POST", path: "/api/v1/webhooks/{id}/test", description: "Webhook test et", auth: true, rateLimit: "20/dk" },
        ]
    },
    {
        id: 'analytics',
        category: "Analitik",
        icon: BarChart3,
        color: 'cyan',
        gradient: 'from-cyan-500 to-teal-500',
        description: 'Raporlama ve analitik',
        endpoints: [
            { method: "GET", path: "/api/v1/analytics/sales", description: "Satış raporu", auth: true, rateLimit: "200/dk" },
            { method: "GET", path: "/api/v1/analytics/revenue", description: "Gelir raporu", auth: true, rateLimit: "200/dk" },
            { method: "GET", path: "/api/v1/analytics/top-products", description: "En çok satanlar", auth: true, rateLimit: "200/dk" },
            { method: "GET", path: "/api/v1/analytics/marketplace-performance", description: "Pazaryeri performansı", auth: true, rateLimit: "200/dk" },
            { method: "GET", path: "/api/v1/analytics/export", description: "Rapor dışa aktar", auth: true, rateLimit: "20/dk" },
        ]
    },
];

// Kod örnekleri
const codeExamples = {
    curl: `# Ürünleri Listele
curl -X GET "https://api.pazaryonetimi.com/v1/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: your-tenant-id"

# Yeni Ürün Oluştur
curl -X POST "https://api.pazaryonetimi.com/v1/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Örnek Ürün",
    "sku": "SKU-001",
    "price": 199.99,
    "stock": 100,
    "category": "Elektronik"
  }'`,
    javascript: `import { PazarYonetimi } from '@pazaryonetimi/sdk';

// SDK'yı başlat
const client = new PazarYonetimi({
  apiKey: 'YOUR_API_KEY',
  tenantId: 'your-tenant-id'
});

// Ürünleri listele
const products = await client.products.list({
  page: 1,
  limit: 50,
  status: 'active'
});

console.log(\`Toplam \${products.total} ürün bulundu\`);

// Yeni ürün oluştur
const newProduct = await client.products.create({
  name: 'Örnek Ürün',
  sku: 'SKU-001',
  price: 199.99,
  stock: 100,
  category: 'Elektronik',
  marketplaces: ['trendyol', 'hepsiburada']
});

console.log('Ürün oluşturuldu:', newProduct.id);`,
    python: `from pazaryonetimi import PazarYonetimi

# SDK'yı başlat
client = PazarYonetimi(
    api_key='YOUR_API_KEY',
    tenant_id='your-tenant-id'
)

# Ürünleri listele
products = client.products.list(
    page=1,
    limit=50,
    status='active'
)

print(f"Toplam {products.total} ürün bulundu")

# Yeni ürün oluştur
new_product = client.products.create(
    name='Örnek Ürün',
    sku='SKU-001',
    price=199.99,
    stock=100,
    category='Elektronik',
    marketplaces=['trendyol', 'hepsiburada']
)

print(f"Ürün oluşturuldu: {new_product.id}")`,
    php: `<?php
use PazarYonetimi\\Client;

// SDK'yı başlat
$client = new Client([
    'api_key' => 'YOUR_API_KEY',
    'tenant_id' => 'your-tenant-id'
]);

// Ürünleri listele
$products = $client->products->list([
    'page' => 1,
    'limit' => 50,
    'status' => 'active'
]);

echo "Toplam " . $products->total . " ürün bulundu\\n";

// Yeni ürün oluştur
$newProduct = $client->products->create([
    'name' => 'Örnek Ürün',
    'sku' => 'SKU-001',
    'price' => 199.99,
    'stock' => 100,
    'category' => 'Elektronik',
    'marketplaces' => ['trendyol', 'hepsiburada']
]);

echo "Ürün oluşturuldu: " . $newProduct->id;`,
};

// Response örnekleri
const responseExamples = {
    success: `{
  "success": true,
  "data": {
    "id": "prod_123456",
    "name": "Örnek Ürün",
    "sku": "SKU-001",
    "price": 199.99,
    "stock": 100,
    "status": "active",
    "marketplaces": [
      {
        "name": "trendyol",
        "status": "published",
        "url": "https://trendyol.com/..."
      }
    ],
    "createdAt": "2025-02-04T10:30:00Z"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-02-04T10:30:00Z"
  }
}`,
    error: `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz parametre değeri",
    "details": [
      {
        "field": "price",
        "message": "Fiyat 0'dan büyük olmalıdır"
      }
    ]
  },
  "meta": {
    "requestId": "req_xyz789",
    "timestamp": "2025-02-04T10:30:00Z"
  }
}`,
    pagination: `{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "totalPages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}`
};

// SDK'lar
const sdks = [
    { name: 'JavaScript/TypeScript', icon: FileCode, package: '@pazaryonetimi/sdk', version: '2.4.0', downloads: '45K+' },
    { name: 'Python', icon: FileCode, package: 'pazaryonetimi', version: '2.4.0', downloads: '32K+' },
    { name: 'PHP', icon: FileCode, package: 'pazaryonetimi/sdk', version: '2.4.0', downloads: '18K+' },
    { name: 'C# / .NET', icon: FileCode, package: 'PazarYonetimi.SDK', version: '2.4.0', downloads: '8K+' },
];

// Webhook events
const webhookEvents = [
    { event: 'order.created', description: 'Yeni sipariş oluşturulduğunda' },
    { event: 'order.updated', description: 'Sipariş güncellendiğinde' },
    { event: 'order.shipped', description: 'Sipariş kargolandığında' },
    { event: 'order.cancelled', description: 'Sipariş iptal edildiğinde' },
    { event: 'product.created', description: 'Yeni ürün oluşturulduğunda' },
    { event: 'product.updated', description: 'Ürün güncellendiğinde' },
    { event: 'inventory.low', description: 'Stok düşük seviyeye geldiğinde' },
    { event: 'marketplace.sync', description: 'Pazaryeri senkronizasyonunda' },
];

// İstatistikler
const stats = [
    { icon: Zap, label: "Ortalama Yanıt", value: "<50ms", color: "amber" },
    { icon: Shield, label: "Güvenlik", value: "OAuth 2.0", color: "emerald" },
    { icon: Server, label: "Uptime", value: "99.99%", color: "blue" },
    { icon: Layers, label: "Endpoint", value: "60+", color: "purple" },
    { icon: RefreshCw, label: "Rate Limit", value: "1000/dk", color: "rose" },
    { icon: Globe, label: "Bölge", value: "EU/TR", color: "cyan" },
];

export default function APIDocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python' | 'php'>('javascript');
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCategory, setExpandedCategory] = useState<string | null>('products');
    const [activeTab, setActiveTab] = useState<'endpoints' | 'sdks' | 'webhooks'>('endpoints');
    const [responseTab, setResponseTab] = useState<'success' | 'error' | 'pagination'>('success');

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-emerald-500 text-white';
            case 'POST': return 'bg-blue-500 text-white';
            case 'PUT': return 'bg-amber-500 text-white';
            case 'PATCH': return 'bg-purple-500 text-white';
            case 'DELETE': return 'bg-red-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    // Filtreleme
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return apiCategories;
        return apiCategories.map(cat => ({
            ...cat,
            endpoints: cat.endpoints.filter(e => 
                e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(cat => cat.endpoints.length > 0);
    }, [searchQuery]);

    const totalEndpoints = apiCategories.reduce((acc, cat) => acc + cat.endpoints.length, 0);

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 blur-[150px] rounded-full" />
                {/* Code lines decoration */}
                <div className="absolute top-40 left-10 text-slate-200 dark:text-slate-800 text-xs font-mono opacity-50 hidden lg:block">
                    {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className="py-0.5">{String(i + 1).padStart(2, '0')}</div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-800 rounded-full mb-6"
                    >
                        <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 tracking-wide">API Dokümantasyon v2.4</span>
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="block">Güçlü &</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">
                            Esnek API
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
                        RESTful API ile e-ticaret operasyonlarınızı programatik olarak yönetin. 
                        Kapsamlı dokümantasyon, SDK desteği ve kolay entegrasyon.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        <Link href="/dashboard/settings/api" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25">
                            <Key size={18} /> API Anahtarı Al
                        </Link>
                        <a href="https://api.pazaryonetimi.com/playground" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/10 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/20 transition-all">
                            <Play size={18} /> API Playground <ExternalLink size={14} />
                        </a>
                    </div>

                    {/* Search */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto relative"
                    >
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Endpoint ara... (örn: /products, sipariş, stok)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none"
                        />
                        {searchQuery && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                {filteredCategories.reduce((acc, cat) => acc + cat.endpoints.length, 0)} sonuç
                            </span>
                        )}
                    </motion.div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16"
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center hover:shadow-lg transition-shadow">
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center mx-auto mb-3`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <div className="text-xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Quick Start */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Authentication Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Kimlik Doğrulama</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Tüm API isteklerinde <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-xs">Bearer Token</code> kullanın.
                            </p>
                            <div className="p-3 bg-slate-900 dark:bg-black/50 rounded-xl">
                                <code className="text-xs text-emerald-400">
                                    Authorization: Bearer YOUR_API_KEY
                                </code>
                            </div>
                            <Link href="/dashboard/settings/api" className="mt-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                                API Anahtarı Oluştur <ArrowRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Base URL */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Base URL</h3>
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-xl flex items-center justify-between">
                                <code className="text-sm text-slate-700 dark:text-slate-300">
                                    https://api.pazaryonetimi.com/v1
                                </code>
                                <button
                                    onClick={() => copyToClipboard('https://api.pazaryonetimi.com/v1', 'baseurl')}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    {copiedCode === 'baseurl' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Rate Limiting */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Rate Limiting</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-slate-600 dark:text-slate-400">Standart</span>
                                    <span className="font-bold text-slate-900 dark:text-white">1000/dk</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-slate-600 dark:text-slate-400">Yazma İşlemleri</span>
                                    <span className="font-bold text-slate-900 dark:text-white">500/dk</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-600 dark:text-slate-400">Bulk İşlemler</span>
                                    <span className="font-bold text-slate-900 dark:text-white">50/dk</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* SDKs Quick Links */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                    <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Resmi SDK&apos;lar</h3>
                            </div>
                            <div className="space-y-2">
                                {sdks.slice(0, 3).map((sdk, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-white/50 dark:bg-white/5 rounded-xl">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sdk.name}</span>
                                        <span className="text-xs text-purple-600 dark:text-purple-400">v{sdk.version}</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => setActiveTab('sdks')}
                                className="mt-4 w-full py-2 text-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                Tüm SDK&apos;ları Gör →
                            </button>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-2 mb-6 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit"
                        >
                            {[
                                { id: 'endpoints', label: 'Endpoints', icon: Terminal, count: totalEndpoints },
                                { id: 'sdks', label: 'SDK\'lar', icon: Box },
                                { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                    }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {tab.count && (
                                        <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </motion.div>

                        {/* Endpoints Tab */}
                        {activeTab === 'endpoints' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                {filteredCategories.map((category, catIndex) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + catIndex * 0.05 }}
                                        className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                                    >
                                        {/* Category Header */}
                                        <button
                                            onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                                                    <category.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{category.category}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{category.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400">{category.endpoints.length} endpoint</span>
                                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>

                                        {/* Endpoints List */}
                                        <AnimatePresence>
                                            {expandedCategory === category.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                                        {category.endpoints.map((endpoint, i) => (
                                                            <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold min-w-[60px] text-center ${getMethodColor(endpoint.method)}`}>
                                                                    {endpoint.method}
                                                                </span>
                                                                <code className="text-sm text-slate-700 dark:text-slate-300 font-mono flex-1">
                                                                    {endpoint.path}
                                                                </code>
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 hidden lg:block max-w-[200px] truncate">
                                                                    {endpoint.description}
                                                                </span>
                                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {endpoint.auth && (
                                                                        <span className="p-1 text-amber-500" title="Kimlik doğrulama gerekli">
                                                                            <Lock size={12} />
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                                                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                                                    >
                                                                        {copiedCode === endpoint.path ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* SDKs Tab */}
                        {activeTab === 'sdks' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="grid gap-4">
                                    {sdks.map((sdk, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                                        <sdk.icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 dark:text-white">{sdk.name}</h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{sdk.package}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">v{sdk.version}</div>
                                                    <div className="text-xs text-slate-400">{sdk.downloads} indirme</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(`npm install ${sdk.package}`, `sdk-${i}`)}
                                                    className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {copiedCode === `sdk-${i}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                    npm install {sdk.package}
                                                </button>
                                                <a href={`https://github.com/pazaryonetimi/${sdk.package}`} target="_blank" className="p-2 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                    <GitBranch size={18} className="text-slate-500 dark:text-slate-400" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Webhooks Tab */}
                        {activeTab === 'webhooks' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                            <Webhook className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Webhook Nedir?</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Webhook&apos;lar, belirli olaylar gerçekleştiğinde otomatik olarak URL&apos;nize HTTP POST isteği gönderir. 
                                                Böylece sürekli API&apos;yi sorgulamak yerine gerçek zamanlı bildirim alırsınız.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-900 dark:text-white">Desteklenen Olaylar</h3>
                                
                                <div className="grid gap-3">
                                    {webhookEvents.map((event, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-3">
                                                <code className="px-3 py-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg text-sm font-mono text-indigo-600 dark:text-indigo-400">
                                                    {event.event}
                                                </code>
                                            </div>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{event.description}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Code Examples Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Hızlı Başlangıç</h2>
                        <p className="text-slate-600 dark:text-slate-400">Favori programlama dilinizde API&apos;yi kullanmaya başlayın</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Code Example */}
                        <div className="rounded-2xl bg-slate-900 dark:bg-black/50 border border-slate-800 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    {(['curl', 'javascript', 'python', 'php'] as const).map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLang(lang)}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedLang === lang
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {lang === 'curl' ? 'cURL' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(codeExamples[selectedLang], 'code-example')}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedCode === 'code-example' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <pre className="p-6 text-sm text-slate-300 overflow-x-auto max-h-[400px]">
                                <code>{codeExamples[selectedLang]}</code>
                            </pre>
                        </div>

                        {/* Response Example */}
                        <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    {(['success', 'error', 'pagination'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setResponseTab(tab)}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${responseTab === tab
                                                ? tab === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : tab === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                            }`}
                                        >
                                            {tab === 'success' ? '✓ Başarılı' : tab === 'error' ? '✕ Hata' : '⋯ Sayfalama'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <pre className="p-6 text-sm text-slate-700 dark:text-slate-300 overflow-x-auto max-h-[400px] bg-slate-50 dark:bg-transparent">
                                <code>{responseExamples[responseTab]}</code>
                            </pre>
                        </div>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 grid md:grid-cols-3 gap-6"
                >
                    {[
                        {
                            icon: Shield,
                            title: 'Güvenli & Şifreli',
                            description: 'TLS 1.3 ile tüm iletişim şifrelenir. OAuth 2.0 ve API Key ile kimlik doğrulama.',
                            gradient: 'from-emerald-500 to-green-500'
                        },
                        {
                            icon: Zap,
                            title: 'Yüksek Performans',
                            description: 'Ortalama <50ms yanıt süresi. CDN destekli global erişim ve 99.99% uptime garantisi.',
                            gradient: 'from-amber-500 to-orange-500'
                        },
                        {
                            icon: Sparkles,
                            title: 'Kapsamlı Dokümantasyon',
                            description: 'Detaylı rehberler, interaktif playground ve tüm dillerde SDK desteği.',
                            gradient: 'from-purple-500 to-pink-500'
                        },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-xl transition-shadow"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Help CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 relative p-10 md:p-16 rounded-3xl overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                    
                    <div className="relative z-10 text-center">
                        <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            API Entegrasyonunda Yardıma mı İhtiyacınız Var?
                        </h2>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                            Teknik ekibimiz API entegrasyonunuzda size yardımcı olmaktan mutluluk duyar. 
                            Demo talep edin veya doğrudan destek alın.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                <Send size={18} /> İletişime Geç
                            </Link>
                            <Link href="/destek" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-colors">
                                <Book size={18} /> Destek Merkezi
                            </Link>
                            <a href="https://api.pazaryonetimi.com/playground" target="_blank" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-colors">
                                <Play size={18} /> API Playground
                            </a>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mt-10 pt-8 border-t border-white/10">
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">25K+</div>
                                <div className="text-sm text-white/60">Aktif Geliştirici</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">10M+</div>
                                <div className="text-sm text-white/60">Günlük API İsteği</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">99.99%</div>
                                <div className="text-sm text-white/60">Uptime SLA</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
