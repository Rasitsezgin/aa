"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Zap,
  Settings,
  ExternalLink,
  RefreshCw,
  Check,
  Lock,
  Eye,
  Star,
  Package,
  ShoppingCart,
  ChevronRight,
  MoreVertical,
  Unlink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react';

// Types
interface MarketplaceFeatures {
  productSync: boolean;
  orderSync: boolean;
  inventorySync: boolean;
  priceSync: boolean;
  shippingIntegration: boolean;
  returnManagement: boolean;
  analyticsApi: boolean;
  advertisingApi: boolean;
  fulfillmentService: boolean;
  multiWarehouse: boolean;
}

interface IntegrationStatus {
  id: string;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending';
  lastSync?: string;
  productCount?: number;
  orderCount?: number;
  errorMessage?: string;
}

interface MarketplaceConfig {
  id: string;
  name: string;
  slug: string;
  logo: string;
  region: string;
  country: string;
  countryCode: string;
  category: string;
  description: string;
  website: string;
  apiType: string;
  authType: string;
  sandboxAvailable: boolean;
  features: MarketplaceFeatures;
  requiredFields?: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }>;
  minimumPlan: string;
  status: string;
  popularity: number;
  commissionRange?: string;
  brandColor: string;
  monthlyVisitors?: string;
  sellerCount?: string;
  userIntegration?: IntegrationStatus;
}

interface MarketplaceCardProps {
  marketplace: MarketplaceConfig;
  userPlan: string;
  isLocked: boolean;
  onConnect: (marketplace: MarketplaceConfig) => void;
  onDisconnect: (marketplace: MarketplaceConfig) => void;
  onSync: (marketplace: MarketplaceConfig) => void;
  onSettings: (marketplace: MarketplaceConfig) => void;
  onViewDetails: (marketplace: MarketplaceConfig) => void;
  index?: number;
}

// Plan hierarchy - eslint-disable-next-line
// @ts-ignore used in component below
const _PLAN_HIERARCHY = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'];

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Ücretsiz',
  STARTER: 'Başlangıç',
  PROFESSIONAL: 'Profesyonel',
  ENTERPRISE: 'Kurumsal',
  CUSTOM: 'Özel',
};

// Country flags
const COUNTRY_FLAGS: Record<string, string> = {
  TR: '🇹🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸',
  NL: '🇳🇱', PL: '🇵🇱', SE: '🇸🇪', JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', MX: '🇲🇽',
  BR: '🇧🇷', AE: '🇦🇪', SA: '🇸🇦', IN: '🇮🇳', SG: '🇸🇬', MY: '🇲🇾', TH: '🇹🇭',
  VN: '🇻🇳', PH: '🇵🇭', ID: '🇮🇩', CN: '🇨🇳', KR: '🇰🇷',
};

// Status Badge Component
const StatusBadge: React.FC<{ status: IntegrationStatus['status'] }> = ({ status }) => {
  const configs = {
    connected: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'Bağlı',
      pulse: false,
    },
    disconnected: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'Bağlı Değil',
      pulse: false,
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: 'Hata',
      pulse: true,
    },
    syncing: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      label: 'Senkronize Ediliyor',
      pulse: true,
    },
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: <Clock className="w-3.5 h-3.5" />,
      label: 'Beklemede',
      pulse: false,
    },
  };

  const config = configs[status];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.pulse ? 'animate-pulse' : ''}`}
    >
      {config.icon}
      {config.label}
    </motion.span>
  );
};

// Feature Badge
const FeatureBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${active
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 line-through'
      }`}
  >
    {label}
  </span>
);

// Main Card Component
export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  marketplace,
  userPlan: _userPlan,
  isLocked,
  onConnect,
  onDisconnect,
  onSync,
  onSettings,
  onViewDetails,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isConnected = marketplace.userIntegration?.isActive;
  const connectionStatus = marketplace.userIntegration?.status || 'disconnected';
  const flag = COUNTRY_FLAGS[marketplace.countryCode] || '🌐';

  // Feature labels
  const featureLabels: Record<keyof MarketplaceFeatures, string> = {
    productSync: 'Ürün',
    orderSync: 'Sipariş',
    inventorySync: 'Stok',
    priceSync: 'Fiyat',
    shippingIntegration: 'Kargo',
    returnManagement: 'İade',
    analyticsApi: 'Analitik',
    advertisingApi: 'Reklam',
    fulfillmentService: 'Fulfillment',
    multiWarehouse: 'Çoklu Depo',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      className={`group relative bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden ${isLocked
          ? 'border-gray-200 dark:border-gray-800 opacity-75'
          : isConnected
            ? 'border-green-200 dark:border-green-800 shadow-lg shadow-green-500/10'
            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl'
        }`}
    >
      {/* Brand Color Top Border */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
        style={{
          backgroundColor: isConnected ? marketplace.brandColor : 'transparent',
          opacity: isHovered || isConnected ? 1 : 0
        }}
      />

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center p-6"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {PLAN_LABELS[marketplace.minimumPlan]} paket gerekli
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white text-sm font-medium rounded-lg"
            >
              Planı Yükselt
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: `${marketplace.brandColor}10` }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: marketplace.brandColor }}
              />
              <Image
                src={marketplace.logo}
                alt={marketplace.name}
                width={40}
                height={40}
                className="w-10 h-10 object-contain relative z-10"
                unoptimized // In case logos are from external domains not in next.config
              />
              {isConnected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.div>

            {/* Name & Country */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {marketplace.name}
                {marketplace.popularity >= 90 && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <span>{flag}</span>
                <span>{marketplace.country}</span>
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20"
                >
                  <button
                    onClick={() => onViewDetails(marketplace)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Detayları Görüntüle
                  </button>
                  <button
                    onClick={() => window.open(marketplace.website, '_blank')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> Siteye Git
                  </button>
                  {isConnected && (
                    <>
                      <button
                        onClick={() => onSettings(marketplace)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" /> Ayarlar
                      </button>
                      <button
                        onClick={() => onSync(marketplace)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" /> Senkronize Et
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => onDisconnect(marketplace)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Unlink className="w-4 h-4" /> Bağlantıyı Kes
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status Badge */}
        {isConnected && (
          <div className="mb-4">
            <StatusBadge status={connectionStatus} />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {marketplace.description}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4 py-3 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ziyaretçi</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {marketplace.monthlyVisitors || 'N/A'}
            </p>
          </div>
          <div className="text-center border-x border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Satıcı</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {marketplace.sellerCount || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Komisyon</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {marketplace.commissionRange || 'N/A'}
            </p>
          </div>
        </div>

        {/* Features (Expandable) */}
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="font-medium">Desteklenen Özellikler</span>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(Object.keys(marketplace.features) as Array<keyof MarketplaceFeatures>).map((key) => (
                    <FeatureBadge
                      key={key}
                      label={featureLabels[key]}
                      active={marketplace.features[key]}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Integration Stats (if connected) */}
        {isConnected && marketplace.userIntegration && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">Ürünler</p>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    {marketplace.userIntegration.productCount?.toLocaleString('tr-TR') || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">Siparişler</p>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    {marketplace.userIntegration.orderCount?.toLocaleString('tr-TR') || 0}
                  </p>
                </div>
              </div>
            </div>
            {marketplace.userIntegration.lastSync && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Son senkronizasyon: {new Date(marketplace.userIntegration.lastSync).toLocaleString('tr-TR')}
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSync(marketplace)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Senkronize Et
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSettings(marketplace)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConnect(marketplace)}
              disabled={isLocked}
              style={{
                background: isLocked ? undefined : `linear-gradient(135deg, ${marketplace.brandColor}, ${marketplace.brandColor}dd)`,
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${isLocked
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'text-white shadow-lg hover:shadow-xl'
                }`}
            >
              <Zap className="w-4 h-4" />
              Bağlan
            </motion.button>
          )}
        </div>

        {/* API & Auth Type Tags */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
              {marketplace.apiType}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
              {marketplace.authType}
            </span>
            {marketplace.sandboxAvailable && (
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                Sandbox
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Min: {PLAN_LABELS[marketplace.minimumPlan]}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceCard;
