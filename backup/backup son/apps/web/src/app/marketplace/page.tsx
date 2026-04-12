'use client';

import React, { useState, useEffect } from 'react';
import {
  Store, Globe, TrendingUp, Users, Package, Star, ArrowRight, Plus,
  RefreshCw, Settings, Download, Share2, Badge, DollarSign, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface StoreInfo {
  storeName: string;
  rating: number;
  followers: number;
  totalProducts: number;
  verification: {
    score: number;
    status: string;
  };
}

export default function MarketplacePage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(
          `${apiUrl}/marketplace/trendyol/store-info?storeId=624588`
        );
        const data = await response.json();
        setStoreInfo(data);
      } catch (error) {
        console.error('Mağaza bilgisi yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-3 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pazaryerleri</h1>
              <p className="text-slate-300">Çoklu platform yönetimi</p>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Platform
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          {(['overview', 'products', 'orders', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition-colors ${activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
                }`}
            >
              {tab === 'overview' && 'Genel Bakış'}
              {tab === 'products' && 'Ürünler'}
              {tab === 'orders' && 'Siparişler'}
              {tab === 'analytics' && 'Analizler'}
            </button>
          ))}
        </div>

        {/* Trendyol Store Card */}
        {loading ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <div className="inline-block animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="mt-2 text-slate-300">Mağaza bilgileri yükleniyor...</p>
          </div>
        ) : storeInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Store Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Image
                      src="https://acdn.trendyol.com/staticfiles/new/header/trendyol-logo.svg"
                      alt="Trendyol"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                      unoptimized
                    />
                    {storeInfo.storeName}
                  </h2>
                  <p className="text-slate-400 mt-1">Türkiye'nin en büyük pazaryeri</p>
                </div>
                <div className="bg-yellow-500/20 px-3 py-1 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{storeInfo.rating}</span>
                  </div>
                </div>
              </div>

              {/* Store Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Takipçi</p>
                  <p className="text-2xl font-bold">
                    {(storeInfo.followers / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Ürün</p>
                  <p className="text-2xl font-bold">{storeInfo.totalProducts}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Verificiation Score</p>
                  <p className="text-2xl font-bold">{storeInfo.verification.score}/10</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Senkronize Et
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Ayarlar
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Rapor
                </button>
              </div>
            </div>

            {/* Integration Info */}
            <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-lg p-6 border border-green-800/50">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Badge className="w-5 h-5 text-green-400" />
                Bağlantı Durumu
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">API Bağlantısı</span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-medium">
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Son Senkronizasyon</span>
                  <span className="text-slate-400 text-sm">2 saat önce</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Ürün Sayısı</span>
                  <span className="font-bold">{storeInfo.totalProducts}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
            Mağaza bilgileri yüklenemedi
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Package, title: 'Ürün Yönetimi', desc: '2,357 ürün' },
            { icon: ShoppingCart, title: 'Siparişler', desc: '145 aktif' },
            { icon: DollarSign, title: 'Gelir', desc: '₺58,000' },
            { icon: TrendingUp, title: 'Büyüme', desc: '+15.2%' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition cursor-pointer border border-slate-600">
              <item.icon className="w-6 h-6 text-blue-400 mb-2" />
              <p className="font-bold">{item.title}</p>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Additional Marketplaces Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Diğer Pazaryerleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Hepsiburada', status: 'Hazır', color: 'from-orange-600 to-orange-700' },
              { name: 'Amazon', status: 'Yakında', color: 'from-amber-600 to-orange-600' },
              { name: 'N11', status: 'Yakında', color: 'from-blue-600 to-blue-700' },
              { name: 'Çiçeksepeti', status: 'Yakında', color: 'from-pink-600 to-rose-600' },
            ].map((marketplace, i) => (
              <div key={i} className={`bg-gradient-to-br ${marketplace.color} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{marketplace.name}</span>
                  <span className={`text-sm px-2 py-1 rounded ${marketplace.status === 'Hazır'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-500/20 text-slate-300'
                    }`}>
                    {marketplace.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
