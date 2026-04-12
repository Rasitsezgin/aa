'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Clock,
  Trash2,
  Save,
  Settings,
  TrendingUp,
  Tags,
  Calendar,
  DollarSign,
  User,
  Star,
  Zap,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';

// Types
interface SearchFilter {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'range' | 'checkbox';
  value?: any;
  operator?: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
  options?: Array<{ value: string; label: string }>;
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAt: Date;
  usageCount: number;
  isFavorite: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'order' | 'customer' | 'vendor';
  description: string;
  metadata: Record<string, any>;
  relevanceScore: number;
  updatedAt: Date;
}

// Demo data
const savedSearches: SavedSearch[] = [
  {
    id: '1',
    name: 'Yüksek Değerli Müşteriler',
    description: 'Son 30 günde 5000+ TL harcayan müşteriler',
    filters: [
      { id: '1', name: 'Toplam Harcama', type: 'range', operator: 'gt', value: 5000 },
      { id: '2', name: 'Dönem', type: 'date', value: 'last_30_days' },
    ],
    sortBy: 'spending',
    sortOrder: 'desc',
    createdAt: new Date('2025-02-15'),
    usageCount: 47,
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Risk Altında Ürünler',
    description: 'Stok seviyeleri düşük ürünler',
    filters: [
      { id: '1', name: 'Stok Durumu', type: 'select', value: 'low' },
      { id: '2', name: 'Kategori', type: 'select', value: 'all' },
    ],
    sortBy: 'stock_level',
    sortOrder: 'asc',
    createdAt: new Date('2025-02-10'),
    usageCount: 23,
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Beklemede Siparişler',
    description: 'Ödeme bekleme durumundaki siparişler',
    filters: [
      { id: '1', name: 'Durum', type: 'select', value: 'pending_payment' },
    ],
    sortBy: 'created_at',
    sortOrder: 'asc',
    createdAt: new Date('2025-02-05'),
    usageCount: 156,
    isFavorite: false,
  },
];

const recentSearches = [
  '"Samsung Galaxy S24" kategorisi:Elektronik',
  'fiyat:>5000 fiyat:<50000',
  'stok:<10 durum:aktif',
  'müşteri:"premium" son_sipariş:"son_7_gün"',
];

const searchResults: SearchResult[] = [
  {
    id: 'prod-001',
    title: 'Samsung Galaxy S24',
    type: 'product',
    description: '6.1 inç AMOLED ekran, Snapdragon 8 Gen 3',
    metadata: {
      price: 45999,
      stock: 24,
      category: 'Elektronik',
      rating: 4.8,
      reviews: 1250,
    },
    relevanceScore: 0.98,
    updatedAt: new Date(),
  },
  {
    id: 'order-245',
    title: 'Sipariş #245 - Ali Demir',
    type: 'order',
    description: 'Toplam: 15,500 TL | Ürünler: 4 | Durum: Kargo Yolunda',
    metadata: {
      total: 15500,
      items: 4,
      status: 'shipped',
      date: '2025-02-28',
      shipping: 'Fast Courier',
    },
    relevanceScore: 0.85,
    updatedAt: new Date(),
  },
  {
    id: 'cust-089',
    title: 'Müşteri - Fatma Kaya',
    type: 'customer',
    description: 'Premium üye | Toplam: 67,800 TL | 15 Sipariş',
    metadata: {
      tier: 'premium',
      lifetime: 67800,
      orders: 15,
      joinDate: '2023-06-15',
      lastOrder: '2025-02-25',
    },
    relevanceScore: 0.92,
    updatedAt: new Date(),
  },
  {
    id: 'prod-002',
    title: 'iPhone 15 Pro Max',
    type: 'product',
    description: '6.7 inç Dynamic Island, A17 Pro Chip',
    metadata: {
      price: 52999,
      stock: 12,
      category: 'Elektronik',
      rating: 4.9,
      reviews: 2100,
    },
    relevanceScore: 0.88,
    updatedAt: new Date(),
  },
];

// Filter Chip Component
function FilterChip({
  filter,
  onRemove,
}: {
  filter: SearchFilter;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-sm"
    >
      <Filter className="w-3 h-3" />
      <span>{filter.name}</span>
      {filter.value && <span className="font-semibold">{filter.value}</span>}
      <button
        onClick={() => onRemove(filter.id)}
        className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-full"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

// Saved Search Card Component
function SavedSearchCard({
  search,
  onApply,
  onDelete,
  onToggleFavorite,
}: {
  search: SavedSearch;
  onApply: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold flex items-center gap-2">
            {search.name}
            {search.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          </h4>
          {search.description && (
            <p className="text-xs text-gray-500 mt-1">{search.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(search.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Star
              className={`w-4 h-4 ${
                search.isFavorite
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-400'
              }`}
            />
          </button>
          <button
            onClick={() => onDelete(search.id)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <Clock className="w-3 h-3" />
        {search.createdAt.toLocaleDateString('tr-TR')}
        <span>•</span>
        <Zap className="w-3 h-3" />
        {search.usageCount} kullanım
      </div>

      <div className="flex gap-2">
        {search.filters.slice(0, 2).map(f => (
          <span
            key={f.id}
            className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
          >
            {f.name}
          </span>
        ))}
        {search.filters.length > 2 && (
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
            +{search.filters.length - 2}
          </span>
        )}
      </div>

      <button
        onClick={() => onApply(search)}
        className="w-full mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 text-sm font-medium"
      >
        Kullan
      </button>
    </motion.div>
  );
}

// Search Result Component
function SearchResultCard({ result }: { result: SearchResult }) {
  const typeColors: Record<string, string> = {
    product: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
    order: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    customer: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    vendor: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
  };

  const typeLabels: Record<string, string> = {
    product: '📦 Ürün',
    order: '🛒 Sipariş',
    customer: '👤 Müşteri',
    vendor: '🏪 Satıcı',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-1 rounded-full ${typeColors[result.type]}`}>
              {typeLabels[result.type]}
            </span>
            <span className="text-xs text-gray-500">
              Uygunluk: {(result.relevanceScore * 100).toFixed(0)}%
            </span>
          </div>
          <h4 className="font-semibold">{result.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {result.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mt-3">
        {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
          <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <p className="text-gray-500 dark:text-gray-400 capitalize">{key}</p>
            <p className="font-semibold">
              {typeof value === 'number'
                ? key.includes('price')
                  ? value.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })
                  : value.toLocaleString('tr-TR')
                : String(value)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Main Component
export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(true);
  const [localSavedSearches, setLocalSavedSearches] = useState(savedSearches);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const performSearch = () => {
    if (searchQuery.trim()) {
      setSearchActive(true);
      setShowResults(true);
      setShowSavedSearches(false);
      setResults(searchResults);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Search className="w-8 h-8 text-blue-600" />
          Gelişmiş Arama
        </h2>
        <p className="text-gray-500 mt-1">Ürünler, siparişler ve müşteriler arasında hızlı arama yapın</p>
      </div>

      {/* Search Box */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && performSearch()}
            placeholder="Ürün, sipariş, müşteri... aramak için yazın"
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

          <button
            onClick={performSearch}
            className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Ara
          </button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Aktif Filtreler:</span>
            <AnimatePresence>
              {activeFilters.map(filter => (
                <FilterChip
                  key={filter.id}
                  filter={filter}
                  onRemove={(id) =>
                    setActiveFilters(prev => prev.filter(f => f.id !== id))
                  }
                />
              ))}
            </AnimatePresence>
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Temizle
            </button>
          </div>
        )}

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Filter className="w-4 h-4" />
          Filtreler
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4"
            >
              {[
                { name: 'Durum', icon: Tags, options: ['Aktif', 'İnaktif', 'Arşiv'] },
                { name: 'Kategori', icon: Tags, options: ['Elektronik', 'Giyim', 'Kitap'] },
                { name: 'Tarih Aralığı', icon: Calendar, options: ['Son 7 Gün', 'Son 30 Gün', 'Son Yıl'] },
                { name: 'Fiyat Aralığı', icon: DollarSign, options: ['<1000', '1000-5000', '>5000'] },
              ].map((section, idx) => (
                <div key={idx}>
                  <label className="flex items-center gap-2 font-semibold mb-2">
                    <section.icon className="w-4 h-4" />
                    {section.name}
                  </label>
                  <div className="space-y-2">
                    {section.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Searches */}
      {!searchActive && !showSavedSearches && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Son Aramalar</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((query, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(query);
                  setTimeout(() => performSearch(), 0);
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
              >
                <Clock className="w-3 h-3 inline mr-1" />
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {showSavedSearches && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Kaydedilmiş Aramalar</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Yeni Ara
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localSavedSearches.map(search => (
              <SavedSearchCard
                key={search.id}
                search={search}
                onApply={(search) => {
                  setActiveFilters(search.filters);
                  setShowSavedSearches(false);
                  setShowResults(true);
                }}
                onDelete={(id) =>
                  setLocalSavedSearches(prev => prev.filter(s => s.id !== id))
                }
                onToggleFavorite={(id) =>
                  setLocalSavedSearches(prev =>
                    prev.map(s => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {results.length} Sonuç Bulundu
            </h3>
            <button
              onClick={() => {
                setShowResults(false);
                setShowSavedSearches(true);
                setSearchQuery('');
                setActiveFilters([]);
                setSearchActive(false);
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            >
              Temizle
            </button>
          </div>

          <div className="space-y-3">
            {results.map(result => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4 border border-blue-200 dark:border-blue-500/30">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>İpucu:</strong> Gelişmiş arama için operatörleri kullanabilirsiniz:
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
          <code className="bg-white/50 dark:bg-gray-800 px-2 py-1 rounded">fiyat:&gt;5000</code>
          <code className="bg-white/50 dark:bg-gray-800 px-2 py-1 rounded">durum:aktif</code>
          <code className="bg-white/50 dark:bg-gray-800 px-2 py-1 rounded">&quot;tam ifade&quot;</code>
          <code className="bg-white/50 dark:bg-gray-800 px-2 py-1 rounded">-hariç tutulanlar</code>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearch;
