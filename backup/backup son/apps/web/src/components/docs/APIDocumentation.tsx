'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Code,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Github,
  Play,
  Search,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Terminal,
} from 'lucide-react';

// Types
interface Endpoint {
  method: string;
  path: string;
  description: string;
  permissions: string[];
}

interface CodeExample {
  language: string;
  code: string;
  icon: any;
}

const codeExamples: Record<string, CodeExample> = {
  javascript: {
    language: 'JavaScript',
    icon: Code,
    code: `const client = new PazaryonetimiClient({ 
  apiKey: 'sk_live_abc123xyz789' 
});

// Ürünleri listele
const products = await client.products.list({ 
  limit: 10,
  category: 'electronics'
});

// Yeni ürün oluştur
const newProduct = await client.products.create({
  name: 'Yeni Elektronik',
  price: 999.99,
  description: 'Harika bir ürün',
  categoryId: 'cat_123'
});`,
  },
  python: {
    language: 'Python',
    icon: Code,
    code: `import pazaryonetimi

client = pazaryonetimi.Client('sk_live_abc123xyz789')

# Ürünleri listele
products = client.products.list(limit=10, category='electronics')

# Yeni ürün oluştur
new_product = client.products.create(
    name='Yeni Elektronik',
    price=999.99,
    description='Harika bir ürün',
    category_id='cat_123'
)`,
  },
  curl: {
    language: 'cURL',
    icon: Code,
    code: `# Ürünleri listele
curl -X GET https://api.pazaryonetimi.com/v1/products \\
  -H "Authorization: Bearer sk_live_abc123xyz789" \\
  -H "Content-Type: application/json"

# Yeni ürün oluştur
curl -X POST https://api.pazaryonetimi.com/v1/products \\
  -H "Authorization: Bearer sk_live_abc123xyz789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Yeni Elektronik",
    "price": 999.99,
    "description": "Harika bir ürün"
  }'`,
  },
};

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/products',
    description: 'Tüm ürünleri listele',
    permissions: ['products:read'],
  },
  {
    method: 'POST',
    path: '/products',
    description: 'Yeni ürün oluştur',
    permissions: ['products:write'],
  },
  {
    method: 'GET',
    path: '/orders',
    description: 'Siparişleri listele',
    permissions: ['orders:read'],
  },
  {
    method: 'GET',
    path: '/customers',
    description: 'Müşterileri listele',
    permissions: ['customers:read'],
  },
  {
    method: 'GET',
    path: '/analytics/dashboard',
    description: 'Dashboard metrikleri',
    permissions: ['analytics:read'],
  },
  {
    method: 'GET',
    path: '/inventory',
    description: 'Envanter verisi',
    permissions: ['inventory:read'],
  },
];

// Endpoint Card
function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const methodConfig: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    POST: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    PATCH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    DELETE: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  };
  
  return (
    <motion.div
      whileHover={{ translateX: 4 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start gap-3">
        <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${methodConfig[endpoint.method] || methodConfig.GET}`}>
          {endpoint.method}
        </span>
        <div className="flex-1">
          <p className="font-mono text-sm text-gray-900 dark:text-white">{endpoint.path}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{endpoint.description}</p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {endpoint.permissions.map(perm => (
              <span key={perm} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                {perm}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );
}

// SDK Card
function SDKCard({
  name,
  version,
  icon: Icon,
  color,
}: {
  name: string;
  version: string;
  icon: any;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
          v{version}
        </span>
      </div>
      <h3 className="font-semibold mb-3">{name}</h3>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Resmi SDK'mız ile hızlı entegrasyon
        </p>
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Download className="w-4 h-4" />
          Yükle
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
          <Github className="w-4 h-4" />
          Repo
        </button>
      </div>
    </motion.div>
  );
}

// Main Component
export function APIDocumentation() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [copiedCode, setCopiedCode] = useState(false);
  
  const currentExample = codeExamples[selectedLanguage];
  
  const copyCode = () => {
    navigator.clipboard.writeText(currentExample.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          API Dokumentasyonu
        </h2>
        <p className="text-gray-500">
          Pazaryönetimi REST API'sını kullanarak entegrasyon yapın
        </p>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.a
          whileHover={{ translateY: -2 }}
          href="https://docs.pazaryonetimi.com"
          className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4 border border-blue-200 dark:border-blue-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileJson className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Swagger UI</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Interaktif API belgelerine erişin</p>
        </motion.a>
        
        <motion.a
          whileHover={{ translateY: -2 }}
          href="https://github.com/pazaryonetimi/api"
          className="bg-green-50 dark:bg-green-500/10 rounded-lg p-4 border border-green-200 dark:border-green-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Github className="w-5 h-5 text-green-600" />
            <span className="font-semibold">GitHub</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kaynak kodu ve örnekler</p>
        </motion.a>
        
        <motion.a
          whileHover={{ translateY: -2 }}
          href="#"
          className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-4 border border-purple-200 dark:border-purple-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">Yardım Merkezi</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">SSS ve sorun giderme</p>
        </motion.a>
      </div>
      
      {/* Code Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4">Kod Örneği</h3>
        
        <div className="flex gap-2 mb-4">
          {Object.entries(codeExamples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => setSelectedLanguage(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedLanguage === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {example.language}
            </button>
          ))}
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 mb-3 relative">
          <button
            onClick={copyCode}
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition"
          >
            {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Kopyalandı' : 'Kopyala'}
          </button>
          
          <pre className="text-green-400 text-sm font-mono overflow-x-auto">
            <code>{currentExample.code}</code>
          </pre>
        </div>
        
        <p className="text-xs text-gray-500">
          📌 Kendi API anahtarınızı 'sk_live_...' yerine geçirin
        </p>
      </div>
      
      {/* API Endpoints */}
      <div>
        <h3 className="text-xl font-bold mb-4">API Endpoints</h3>
        <div className="space-y-3">
          {endpoints.map((endpoint, idx) => (
            <EndpointCard key={idx} endpoint={endpoint} />
          ))}
        </div>
      </div>
      
      {/* SDKs */}
      <div>
        <h3 className="text-xl font-bold mb-4">Resmi SDK'lar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SDKCard
            name="JavaScript / TypeScript"
            version="1.0.0"
            icon={Code}
            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
          />
          <SDKCard
            name="Python"
            version="1.0.0"
            icon={Code}
            color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          />
          <SDKCard
            name="Go"
            version="1.0.0"
            icon={Code}
            color="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
          />
        </div>
      </div>
      
      {/* Authentication */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-6 border border-blue-200 dark:border-blue-500/30">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          Kimlik Doğrulama
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Tüm API isteklerine Authorization header'ı içinde Bearer token ekleyin:
        </p>
        <div className="bg-white dark:bg-gray-800 rounded p-3 font-mono text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
          Authorization: Bearer sk_live_abc123xyz789
        </div>
      </div>
      
      {/* Rate Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Rate Limitler
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>✓ 100 istek/dakika</li>
            <li>✓ 5,000 istek/saat</li>
            <li>✓ Kalan limit: X-RateLimit-Remaining</li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            API Durumu
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>✓ Operasyonel (%99.99 uptime)</li>
            <li>✓ Ortalama yanıt: 100ms</li>
            <li>✓ <a href="#" className="text-blue-600 hover:underline">Durumu izle</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default APIDocumentation;
