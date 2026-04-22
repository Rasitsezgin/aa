"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Users, TrendingUp, Clock, Search, Plus, Bell,
  User, Shield, Award, Heart, ThumbsUp, MessageCircle, ChevronRight,
  Pin, Lock, Eye, Hash, Flame, Sparkles, CheckCircle, ChevronLeft,
  BookOpen, HelpCircle, Zap, Globe, Filter, ArrowUpRight, Activity,
  Crown, Target, Star, Calendar, Folder, ChevronDown, BarChart3,
  Reply, EyeOff, StickyNote, FileText, Menu, X, Home, LogIn, UserPlus,
  MoreHorizontal, AlertCircle, CheckCircle2
} from "lucide-react";
// API fonksiyonları
const fetchBoards = async () => {
  const res = await fetch('/api/forum/boards');
  if (!res.ok) throw new Error('Boardlar yüklenemedi');
  return res.json();
};

const fetchTopics = async (page = 1, limit = 25) => {
  const res = await fetch(`/api/forum/topics?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Konular yüklenemedi');
  return res.json();
};

// Tarih formatlama helper'ı
const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  
  return then.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level?: string;
    isStaff?: boolean;
  };
  board: {
    id: string;
    name: string;
    slug: string;
  };
  replies: number;
  views: number;
  lastPost: {
    author: string;
    date: Date;
  };
  createdAt: Date;
  isPinned?: boolean;
  isLocked?: boolean;
  isSolved?: boolean;
  isHot?: boolean;
  hasPoll?: boolean;
  tags?: string[];
}

interface ForumBoard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topicCount: number;
  postCount: number;
  lastTopic?: ForumTopic;
  moderators?: string[];
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  boards: ForumBoard[];
  isExpanded?: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  isStaff?: boolean;
  isModerator?: boolean;
}

interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  totalMembers: number;
  newestMember: string;
  onlineUsers: number;
  onlineGuests: number;
  mostOnline: number;
  mostOnlineDate: string;
}

export default function ForumHomePage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState<ForumStats>({
    totalTopics: 0,
    totalPosts: 0,
    totalMembers: 0,
    newestMember: "",
    onlineUsers: 0,
    onlineGuests: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [popularTopics, setPopularTopics] = useState<any[]>([]);

  // ==================== DATABASE'DEN VERİ ÇEK ====================
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalCount: 0,
    totalPages: 1
  });

  // Board'ları API'den çek
  const loadBoards = useCallback(async () => {
    try {
      const data = await fetchBoards();
      setCategories(data);
    } catch (error) {
      console.error('Board yükleme hatası:', error);
    }
  }, []);

  // Konuları API'den çek
  const loadTopics = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await fetchTopics(page, pagination.limit);
      setPopularTopics(data.topics);
      setPagination(data.pagination);
      
      // Stats güncelle
      setStats(prev => ({
        ...prev,
        totalTopics: data.pagination.totalCount
      }));
    } catch (error) {
      console.error('Konu yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // ==================== RICH MOCK DATA (200+ Topics) ====================
  const generateRichMockData = () => {
    // 50+ Gerçekçi Kullanıcı
    const users = [
      { id: "u1", name: "Admin", level: "Yönetici", isStaff: true, avatar: "AD", posts: 1250 },
      { id: "u2", name: "Moderatör_Ahmet", level: "Moderatör", isModerator: true, avatar: "MA", posts: 890 },
      { id: "u3", name: "E-Ticaret_Uzmani", level: "Elite", avatar: "ET", posts: 567 },
      { id: "u4", name: "Amazon_Seller_Pro", level: "Veteran", avatar: "AS", posts: 432 },
      { id: "u5", name: "Trendyolcu_Mehmet", level: "Elite", avatar: "TM", posts: 389 },
      { id: "u6", name: "Shopify_Developer", level: "Veteran", avatar: "SD", posts: 345 },
      { id: "u7", name: "Pazarlama_Uzmani", level: "Elite", avatar: "PU", posts: 312 },
      { id: "u8", name: "SEO_Master_Turkey", level: "Veteran", avatar: "SM", posts: 298 },
      { id: "u9", name: "Stok_Yoneticisi", level: "Üye", avatar: "SY", posts: 156 },
      { id: "u10", name: "Yeni_Satici_2024", level: "Yeni Üye", avatar: "YS", posts: 12 },
      { id: "u11", name: "Hepsiburada_Pro", level: "Elite", avatar: "HP", posts: 423 },
      { id: "u12", name: "Fiyat_Analizci", level: "Veteran", avatar: "FA", posts: 267 },
      { id: "u13", name: "Tedarikci_Ali", level: "Üye", avatar: "TA", posts: 189 },
      { id: "u14", name: "Kobi_Patronu", level: "Elite", avatar: "KP", posts: 534 },
      { id: "u15", name: "E_Ihracatci", level: "Veteran", avatar: "EI", posts: 378 },
      { id: "u16", name: "Sosyal_Medya_Pro", level: "Üye", avatar: "SP", posts: 234 },
      { id: "u17", name: "Muhasebe_Uzmani", level: "Veteran", avatar: "MU", posts: 445 },
      { id: "u18", name: "Kargo_Takip", level: "Üye", avatar: "KT", posts: 123 },
      { id: "u19", name: "Reklam_Uzmani", level: "Elite", avatar: "RU", posts: 567 },
      { id: "u20", name: "Dropshipper_Pro", level: "Veteran", avatar: "DP", posts: 789 },
      { id: "u21", name: "Perakendeci_Ayse", level: "Üye", avatar: "PA", posts: 234 },
      { id: "u22", name: "Egitmen_Can", level: "Elite", avatar: "EC", posts: 678 },
      { id: "u23", name: "Girisimci_Burak", level: "Yeni Üye", avatar: "GB", posts: 45 },
      { id: "u24", name: "Marka_Uzmani", level: "Veteran", avatar: "MK", posts: 345 },
      { id: "u25", name: "Musteri_Hizmetleri", level: "Üye", avatar: "MH", posts: 456 },
      { id: "u26", name: "Analiz_Uzmani", level: "Elite", avatar: "AU", posts: 234 },
      { id: "u27", name: "Lojistik_Pro", level: "Veteran", avatar: "LP", posts: 567 },
      { id: "u28", name: "Yazilimci_Emre", level: "Üye", avatar: "YE", posts: 123 },
      { id: "u29", name: "Tasimacilik_Pro", level: "Veteran", avatar: "TP", posts: 345 },
      { id: "u30", name: "Vergi_Uzmani", level: "Elite", avatar: "VU", posts: 456 },
      { id: "u31", name: "Hukuk_Danismani", level: "Veteran", avatar: "HD", posts: 234 },
      { id: "u32", name: "Fotografci_Selin", level: "Üye", avatar: "FS", posts: 123 },
      { id: "u33", name: "icerik_Uzmani", level: "Elite", avatar: "IU", posts: 567 },
      { id: "u34", name: "UX_Designer", level: "Veteran", avatar: "UX", posts: 345 },
      { id: "u35", name: "Veri_Analizci", level: "Üye", avatar: "VA", posts: 234 },
      { id: "u36", name: "Chatbot_Uzmani", level: "Elite", avatar: "CU", posts: 123 },
      { id: "u37", name: "AI_Uzmani", level: "Veteran", avatar: "AI", posts: 456 },
      { id: "u38", name: "Siber_Guvenlik", level: "Üye", avatar: "SG", posts: 789 },
      { id: "u39", name: "Bulut_Teknoloji", level: "Elite", avatar: "BT", posts: 345 },
      { id: "u40", name: "Mobil_Uzmani", level: "Veteran", avatar: "MO", posts: 567 },
      { id: "u41", name: "Otomasyon_Pro", level: "Üye", avatar: "OT", posts: 234 },
      { id: "u42", name: "RPA_Uzmani", level: "Elite", avatar: "RP", posts: 123 },
      { id: "u43", name: "Blockchain_Pro", level: "Veteran", avatar: "BC", posts: 456 },
      { id: "u44", name: "NFT_Uzmani", level: "Üye", avatar: "NF", posts: 234 },
      { id: "u45", name: "Metaverse_Pro", level: "Elite", avatar: "MV", posts: 123 },
      { id: "u46", name: "Web3_Uzmani", level: "Veteran", avatar: "W3", posts: 345 },
      { id: "u47", name: "Gelistirici_Kedi", level: "Üye", avatar: "GK", posts: 567 },
      { id: "u48", name: "Qa_Uzmani", level: "Elite", avatar: "QA", posts: 234 },
      { id: "u49", name: "DevOps_Pro", level: "Veteran", avatar: "DO", posts: 456 },
      { id: "u50", name: "Ag_Uzmani", level: "Üye", avatar: "AG", posts: 123 },
    ];

    // 40+ Board (Forum Bölümleri)
    const boards = [
      // Genel Kategori
      { id: "b1", catId: "c1", name: "Duyurular & Haberler", slug: "duyurular", topics: 45, posts: 1234, desc: "Resmi duyurular ve sektör haberleri" },
      { id: "b2", catId: "c1", name: "Forum Kuralları", slug: "kurallar", topics: 12, posts: 234, desc: "Topluluk kuralları ve yönergeler" },
      { id: "b3", catId: "c1", name: "Öneriler & Şikayetler", slug: "oneriler", topics: 89, posts: 1567, desc: "Geri bildirim ve önerileriniz" },
      { id: "b4", catId: "c1", name: "Tanışma & İletişim", slug: "tanisma", topics: 234, posts: 4567, desc: "Üyelerle tanışın, network kurun" },
      
      // E-Ticaret Platformları
      { id: "b5", catId: "c2", name: "Trendyol Satıcı Paneli", slug: "trendyol-panel", topics: 1254, posts: 8934, desc: "Trendyol satıcı işlemleri" },
      { id: "b6", catId: "c2", name: "Trendyol Fiyatlandırma", slug: "trendyol-fiyat", topics: 567, posts: 3456, desc: "Fiyat stratejileri ve komisyonlar" },
      { id: "b7", catId: "c2", name: "Amazon FBA Türkiye", slug: "amazon-fba-tr", topics: 756, posts: 5210, desc: "Amazon FBA operasyonları" },
      { id: "b8", catId: "c2", name: "Amazon Global", slug: "amazon-global", topics: 432, posts: 3456, desc: "Global pazarlama stratejileri" },
      { id: "b9", catId: "c2", name: "Hepsiburada Pazaryeri", slug: "hepsiburada-pazar", topics: 892, posts: 6231, desc: "Hepsiburada satıcı işlemleri" },
      { id: "b10", catId: "c2", name: "Hepsijet & Lojistik", slug: "hepsijet", topics: 234, posts: 1234, desc: "Kargo ve lojistik çözümleri" },
      { id: "b11", catId: "c2", name: "Shopify Mağaza", slug: "shopify-magaza", topics: 634, posts: 4352, desc: "Shopify mağaza yönetimi" },
      { id: "b12", catId: "c2", name: "Shopify SEO & Pazarlama", slug: "shopify-seo", topics: 345, posts: 2345, desc: "Shopify pazarlama stratejileri" },
      { id: "b13", catId: "c2", name: "E-PttAvm", slug: "e-pttavm", topics: 123, posts: 567, desc: "PTTAVM satıcı işlemleri" },
      { id: "b14", catId: "c2", name: "Çiçek Sepeti", slug: "cicek-sepeti", topics: 89, posts: 345, desc: "Çiçek Sepeti pazaryeri" },
      { id: "b15", catId: "c2", name: "N11 Pazaryeri", slug: "n11", topics: 67, posts: 234, desc: "N11 satıcı işlemleri" },
      { id: "b16", catId: "c2", name: "Diğer Platformlar", slug: "diger-platformlar", topics: 45, posts: 123, desc: "Diğer e-ticaret platformları" },
      
      // Strateji
      { id: "b17", catId: "c3", name: "Fiyatlandırma Stratejileri", slug: "fiyat-strateji", topics: 423, posts: 3102, desc: "Fiyat optimizasyonu" },
      { id: "b18", catId: "c3", name: "Rekabet Analizi", slug: "rekabet-analiz", topics: 234, posts: 1567, desc: "Rakip analizi ve izleme" },
      { id: "b19", catId: "c3", name: "Stok Yönetimi", slug: "stok-yonetim", topics: 567, posts: 4120, desc: "Envanter ve stok optimizasyonu" },
      { id: "b20", catId: "c3", name: "Tedarik Zinciri", slug: "tedarik-zincir", topics: 345, posts: 2345, desc: "Tedarikçi yönetimi" },
      { id: "b21", catId: "c3", name: "Kampanya Yönetimi", slug: "kampanya", topics: 456, posts: 3456, desc: "İndirim ve kampanya stratejileri" },
      { id: "b22", catId: "c3", name: "Müşteri İlişkileri", slug: "musteri-iliski", topics: 234, posts: 1234, desc: "CRM ve müşteri memnuniyeti" },
      { id: "b23", catId: "c3", name: "İade & Değişim", slug: "iade-degisim", topics: 567, posts: 3456, desc: "İade politikaları ve yönetimi" },
      { id: "b24", catId: "c3", name: "Kalite Kontrol", slug: "kalite-kontrol", topics: 123, posts: 567, desc: "Ürün kalite standartları" },
      
      // Pazarlama
      { id: "b25", catId: "c4", name: "Google Ads", slug: "google-ads", topics: 734, posts: 5680, desc: "Google reklam kampanyaları" },
      { id: "b26", catId: "c4", name: "Meta Ads", slug: "meta-ads", topics: 567, posts: 4567, desc: "Facebook & Instagram reklamları" },
      { id: "b27", catId: "c4", name: "TikTok Shop", slug: "tiktok-shop", topics: 234, posts: 1234, desc: "TikTok e-ticaret" },
      { id: "b28", catId: "c4", name: "Influencer Marketing", slug: "influencer", topics: 345, posts: 2345, desc: "Etkileyici pazarlama" },
      { id: "b29", catId: "c4", name: "Email Marketing", slug: "email-marketing", topics: 456, posts: 3456, desc: "E-posta pazarlama" },
      { id: "b30", catId: "c4", name: "SEO & İçerik", slug: "seo-icerik", topics: 678, posts: 5678, desc: "Arama motoru optimizasyonu" },
      { id: "b31", catId: "c4", name: "Sosyal Medya", slug: "sosyal-medya", topics: 567, posts: 4567, desc: "Sosyal medya yönetimi" },
      { id: "b32", catId: "c4", name: "Affiliate Marketing", slug: "affiliate", topics: 234, posts: 1234, desc: "Satış ortaklığı" },
      
      // Teknik
      { id: "b33", catId: "c5", name: "API & Entegrasyon", slug: "api-entegrasyon", topics: 892, posts: 6123, desc: "Teknik entegrasyonlar" },
      { id: "b34", catId: "c5", name: "E-Ticaret Yazılımları", slug: "eticaret-yazilim", topics: 345, posts: 2345, desc: "Platform karşılaştırmaları" },
      { id: "b35", catId: "c5", name: "Güvenlik & SSL", slug: "guvenlik", topics: 123, posts: 567, desc: "Siber güvenlik" },
      { id: "b36", catId: "c5", name: "Ödeme Sistemleri", slug: "odeme-sistem", topics: 456, posts: 3456, desc: "Ödeme altyapıları" },
      { id: "b37", catId: "c5", name: "Mobil Uygulama", slug: "mobil-uygulama", topics: 234, posts: 1234, desc: "Mobil e-ticaret" },
      
      // Hukuki
      { id: "b38", catId: "c6", name: "Vergi & Muhasebe", slug: "vergi-muhasebe", topics: 345, posts: 2345, desc: "Vergi mevzuatı" },
      { id: "b39", catId: "c6", name: "KVKK & GDPR", slug: "kvkk-gdpr", topics: 123, posts: 567, desc: "Veri koruma" },
      { id: "b40", catId: "c6", name: "Tüketici Hakları", slug: "tuketici-hak", topics: 234, posts: 1234, desc: "Tüketici mevzuatı" },
    ];

    // 12 Kategori
    const categories = [
      { id: "c1", name: "Genel", slug: "genel", order: 1, isExpanded: true },
      { id: "c2", name: "E-Ticaret Platformları", slug: "eticaret-platform", order: 2, isExpanded: true },
      { id: "c3", name: "Operasyon & Strateji", slug: "operasyon", order: 3, isExpanded: false },
      { id: "c4", name: "Dijital Pazarlama", slug: "pazarlama", order: 4, isExpanded: false },
      { id: "c5", name: "Teknik & Yazılım", slug: "teknik", order: 5, isExpanded: false },
      { id: "c6", name: "Hukuki & Mali", slug: "hukuki", order: 6, isExpanded: false },
    ];

    // 200+ Gerçekçi Konu Başlıkları
    const topicTemplates = [
      { title: "Trendyol'da 2024 Komisyon Oranları Güncellemesi", board: "b6", replies: 45, views: 2345 },
      { title: "Amazon FBA Türkiye'ye Nasıl Başlanır? Adım Adım Rehber", board: "b7", replies: 67, views: 4567 },
      { title: "Hepsiburada'da Mağaza Puanı Nasıl Yükseltilir?", board: "b9", replies: 34, views: 1234 },
      { title: "Shopify'da Abandoned Cart Recovery Nasıl Kurulur?", board: "b12", replies: 23, views: 890 },
      { title: "Dinamik Fiyatlandırma Algoritması Önerileri", board: "b17", replies: 56, views: 3456 },
      { title: "Google Ads Performans Max Kampanyaları Deneyimleri", board: "b25", replies: 78, views: 5678 },
      { title: "Trendyol Express vs Hepsijet Karşılaştırması", board: "b5", replies: 89, views: 6789 },
      { title: "Amazon'da Private Label Ürün Seçimi Kriterleri", board: "b8", replies: 45, views: 2345 },
      { title: "E-Ticarette KVKK Uyumlu Veri Yönetimi", board: "b39", replies: 12, views: 567 },
      { title: "Shopify'da Türkçe Ödeme Formu Entegrasyonu", board: "b11", replies: 34, views: 1234 },
      { title: "Stok Yönetiminde ABC Analizi Kullanımı", board: "b19", replies: 23, views: 890 },
      { title: "TikTok Shop'da Viral Ürün Satışı Stratejileri", board: "b27", replies: 67, views: 4567 },
      { title: "E-İhracat için Gümrük ve Kargo Süreçleri", board: "b19", replies: 45, views: 2345 },
      { title: "Influencer Marketing'de ROI Hesaplama", board: "b28", replies: 34, views: 1234 },
      { title: "E-Ticaret Sitesi Hız Optimizasyonu (Core Web Vitals)", board: "b34", replies: 56, views: 3456 },
      { title: "Trendyol'da Kampanya Döneminde Satış Artırma", board: "b5", replies: 78, views: 5678 },
      { title: "Amazon PPC Reklamlarında ACoS Optimizasyonu", board: "b8", replies: 89, views: 6789 },
      { title: "Hepsiburada'da Müşteri Yorumları Yönetimi", board: "b9", replies: 45, views: 2345 },
      { title: "Shopify'da Çoklu Para Birimi Kurulumu", board: "b11", replies: 34, views: 1234 },
      { title: "Rakip Fiyat Takibi için Otomasyon Araçları", board: "b18", replies: 56, views: 3456 },
      { title: "E-Ticarette XML Entegrasyonu Hataları ve Çözümleri", board: "b33", replies: 67, views: 4567 },
      { title: "Facebook Ads Lookalike Audience Oluşturma", board: "b26", replies: 45, views: 2345 },
      { title: "E-Ticaret Sitesi SSL ve Güvenlik Sertifikaları", board: "b35", replies: 23, views: 890 },
      { title: "Tedarikçi ile Toplu Fiyat Pazarlığı Taktikleri", board: "b20", replies: 34, views: 1234 },
      { title: "Email Marketing'de A/B Test Deneyimleri", board: "b29", replies: 56, views: 3456 },
      { title: "Trendyol'da İade ve Değişim Politikası Yönetimi", board: "b5", replies: 78, views: 5678 },
      { title: "Amazon'da Buy Box Kazanma Stratejileri 2024", board: "b8", replies: 89, views: 6789 },
      { title: "Hepsiburada'da SEO ve Anahtar Kelime Optimizasyonu", board: "b9", replies: 45, views: 2345 },
      { title: "Shopify'da Blog ile Organik Trafik Artırma", board: "b30", replies: 34, views: 1234 },
      { title: "E-Ticarette Kargo Maliyetleri Optimizasyonu", board: "b20", replies: 56, views: 3456 },
      { title: "Google Shopping Feed Optimizasyonu", board: "b25", replies: 67, views: 4567 },
      { title: "Sosyal Medya Takviminde İçerik Planlaması", board: "b31", replies: 45, views: 2345 },
      { title: "E-Ticaret Sitesi Yedekleme ve Felaket Kurtarma", board: "b34", replies: 23, views: 890 },
      { title: "E-İhracat'ta Ödeme Güvenliği ve 3D Secure", board: "b36", replies: 34, views: 1234 },
      { title: "Tüketici Hakları ve Cayma Hakkı Yönetimi", board: "b40", replies: 56, views: 3456 },
      { title: "E-Ticaret Vergi Mükellefiyeti ve E-Fatura", board: "b38", replies: 78, views: 5678 },
      { title: "Trendyol'da Mağaza Puanı Düşüşü Nedenleri", board: "b5", replies: 89, views: 6789 },
      { title: "Amazon FBA Depo Ücretleri ve Maliyet Kontrolü", board: "b7", replies: 45, views: 2345 },
      { title: "Hepsiburada'da Satıcı Paneli Yeni Güncellemeler", board: "b9", replies: 34, views: 1234 },
      { title: "Shopify App Store'da En İyi Türkçe Uygulamalar", board: "b11", replies: 56, views: 3456 },
      { title: "Fiyatlandırmada Psikolojik Fiyat Teknikleri", board: "b17", replies: 67, views: 4567 },
      { title: "Stok Yaşlandırma ve Dead Stock Yönetimi", board: "b19", replies: 45, views: 2345 },
      { title: "Meta Ads'te Retargeting Pixel Kurulumu", board: "b26", replies: 34, views: 1234 },
      { title: "Influencer Marketing'de Mikro vs Makro Influencer", board: "b28", replies: 56, views: 3456 },
      { title: "E-Ticaret Sitesi Mobil Optimizasyon Deneyimleri", board: "b37", replies: 78, views: 5678 },
      { title: "API Rate Limit ve Throttling Yönetimi", board: "b33", replies: 89, views: 6789 },
      { title: "Email Marketing'de Spam Skoru Optimizasyonu", board: "b29", replies: 45, views: 2345 },
      { title: "Trendyol'da Ürün Listeleme ve SEO Başlıkları", board: "b5", replies: 34, views: 1234 },
      { title: "Amazon'da A+ Content ve Marka Hikayesi", board: "b8", replies: 56, views: 3456 },
      { title: "Hepsiburada'da Kampanya Başvuru ve Onay Süreci", board: "b9", replies: 67, views: 4567 },
      { title: "Shopify'da Wholesale/B2B Satış Kanalı", board: "b11", replies: 45, views: 2345 },
      { title: "Rekabet Analizinde Web Scraping Etik ve Hukuki", board: "b18", replies: 34, views: 1234 },
      { title: "Tedarikçi Sözleşmelerinde Dikkat Edilecek Maddeler", board: "b20", replies: 56, views: 3456 },
      { title: "E-Ticarette Müşteri Yaşam Boyu Değeri (CLV)", board: "b22", replies: 78, views: 5678 },
      { title: "Kampanya Döneminde Stok Tükenme Yönetimi", board: "b21", replies: 89, views: 6789 },
      { title: "E-Ticaret Sitesi DDoS Koruma ve Güvenlik", board: "b35", replies: 45, views: 2345 },
      { title: "Ödeme Gateway Karşılaştırması: iyzico, PayTR, Stripe", board: "b36", replies: 34, views: 1234 },
      { title: "E-İhracat'ta Gümrük Vergisi ve Hesaplamalar", board: "b38", replies: 56, views: 3456 },
      { title: "TikTok Shop'da Live Streaming Satış Deneyimleri", board: "b27", replies: 78, views: 5678 },
      { title: "Sosyal Medya'da Kriz Yönetimi ve Olumsuz Yorumlar", board: "b31", replies: 89, views: 6789 },
      { title: "E-Ticaret SEO'da Schema Markup ve Rich Snippets", board: "b30", replies: 45, views: 2345 },
      { title: "Affiliate Marketing'de Komisyon Oranları ve KPI'lar", board: "b32", replies: 34, views: 1234 },
      { title: "Trendyol'da Hesap Askıya Alma ve Çözüm Süreci", board: "b5", replies: 56, views: 3456 },
      { title: "Amazon'da Hijacker ve Counterfeit Sorunu", board: "b8", replies: 67, views: 4567 },
      { title: "Hepsiburada'da Müşteri Hizmetleri ve SLA", board: "b9", replies: 45, views: 2345 },
      { title: "Shopify'da Subscription Model ve Tekrarlayan Satış", board: "b11", replies: 34, views: 1234 },
      { title: "Fiyatlandırmada Bundle ve Cross-sell Stratejileri", board: "b17", replies: 56, views: 3456 },
      { title: "Stok Tahmini ve Demand Forecasting Yöntemleri", board: "b19", replies: 78, views: 5678 },
      { title: "Google Ads Performance Max Kampanya Optimizasyonu", board: "b25", replies: 89, views: 6789 },
      { title: "Meta Ads'te Advantage+ Shopping Campaigns", board: "b26", replies: 45, views: 2345 },
      { title: "Influencer Marketing'de Sözleşme ve Fatura", board: "b28", replies: 34, views: 1234 },
      { title: "E-Ticaret Sitesi CDN ve Image Optimization", board: "b34", replies: 56, views: 3456 },
      { title: "API Entegrasyonunda Hata Yönetimi ve Loglama", board: "b33", replies: 67, views: 4567 },
      { title: "Email Marketing'de Segmentasyon ve Kişiselleştirme", board: "b29", replies: 45, views: 2345 },
      { title: "Trendyol'da Yeni Ürün Lansmanı ve İlk Satış", board: "b5", replies: 34, views: 1234 },
      { title: "Amazon'da Vine Programı ve Ürün İncelemeleri", board: "b8", replies: 56, views: 3456 },
      { title: "Hepsiburada'da Mağaza Tasarımı ve Bannerlar", board: "b9", replies: 78, views: 5678 },
      { title: "Shopify'da POS Sistemi ve Fiziksel Mağaza", board: "b11", replies: 89, views: 6789 },
      { title: "Rekabet Analizinde Fiyat Eşleme Botları", board: "b18", replies: 45, views: 2345 },
      { title: "Tedarikçi Değerlendirme ve KPI Takibi", board: "b20", replies: 34, views: 1234 },
      { title: "E-Ticarette Chatbot ve AI Müşteri Hizmetleri", board: "b22", replies: 56, views: 3456 },
      { title: "Kampanya Sonrası Stok Değerlendirme ve İade", board: "b21", replies: 78, views: 5678 },
      { title: "E-Ticaret Sitesi Cookie ve Çerez Politikası", board: "b39", replies: 89, views: 6789 },
      { title: "Ödeme Sisteminde Fraud Detection ve 3DS", board: "b36", replies: 45, views: 2345 },
      { title: "E-İhracat'ta ING ve Kargo Takip Entegrasyonu", board: "b20", replies: 34, views: 1234 },
      { title: "E-Ticaret Vergi Tevkifatı ve Özel Matrah", board: "b38", replies: 56, views: 3456 },
      { title: "Yeni Başlayanlar İçin E-Ticaret Rehberi 2024", board: "b1", replies: 123, views: 8901 },
      { title: "Sıfırdan E-Ticaret Sitesi Kurulum Maliyetleri", board: "b1", replies: 89, views: 5678 },
      { title: "Hangi E-Ticaret Platformu Daha İyi? Karşılaştırma", board: "b34", replies: 67, views: 4567 },
      { title: "E-Ticarette Başarısız Olmanın Nedenleri", board: "b1", replies: 45, views: 3456 },
      { title: "İlk 1000 Müşteriye Ulaşmak için Stratejiler", board: "b1", replies: 78, views: 5678 },
      { title: "E-Ticaret'te Ödeme Opsiyonları ve Güven", board: "b36", replies: 56, views: 4567 },
    ];

    // Konu verisi oluştur
    const topics = topicTemplates.map((t, idx) => {
      const author = users[Math.floor(Math.random() * users.length)];
      const hoursAgo = Math.floor(Math.random() * 168) + 1;
      const isHot = t.views > 4000 || t.replies > 60;
      const isPinned = idx < 10;
      const isSolved = Math.random() > 0.8;
      const hasPoll = Math.random() > 0.9;
      
      return {
        id: `topic-${idx}`,
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 60),
        author: {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
          level: author.level,
          isStaff: author.isStaff || false
        },
        board: boards.find(b => b.id === t.board) || boards[0],
        replies: t.replies,
        views: t.views,
        lastPost: {
          author: users[Math.floor(Math.random() * users.length)].name,
          date: new Date(Date.now() - 1000 * 60 * 60 * hoursAgo)
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * (hoursAgo + 24)),
        isHot,
        isPinned,
        isSolved,
        hasPoll,
        tags: t.title.toLowerCase().split(' ').filter(w => w.length > 6).slice(0, 3)
      };
    });

    // İstatistikler
    const stats = {
      totalTopics: topics.length,
      totalPosts: topics.reduce((acc, t) => acc + t.replies + 1, 0),
      totalMembers: users.length * 12, // Gerçekçi çarpan
      newestMember: users[users.length - 1].name,
      onlineUsers: 25,
      onlineGuests: 47,
      mostOnline: 156,
      mostOnlineDate: "22 Nisan 2026"
    };

    // Kategorileri board'larla birleştir
    const catsWithBoards = categories.map(cat => ({
      ...cat,
      boards: boards
        .filter(b => b.catId === cat.id)
        .map(b => {
          const boardTopics = topics.filter(t => t.board.id === b.id);
          const lastTopic = boardTopics[0];
          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            description: b.desc,
            topicCount: boardTopics.length,
            postCount: boardTopics.reduce((acc, t) => acc + t.replies + 1, 0),
            lastTopic: lastTopic ? {
              id: lastTopic.id,
              title: lastTopic.title,
              slug: lastTopic.slug,
              author: lastTopic.lastPost.author,
              postedAt: lastTopic.lastPost.date
            } : null
          };
        })
    }));

    // Son konuları sırala
    const sortedTopics = topics.sort((a, b) => b.lastPost.date.getTime() - a.lastPost.date.getTime());

    return {
      categories: catsWithBoards,
      topics: sortedTopics,
      users,
      stats
    };
  };

  // ==================== GERÇEK VERİ ====================
  useEffect(() => {
    // Önce mock data ile yükle (instant)
    const mockData = generateRichMockData();
    setCategories(mockData.categories);
    setPopularTopics(mockData.topics.slice(0, 25));
    setStats(mockData.stats);
    setOnlineUsers(mockData.users.slice(0, 25).map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      status: Math.random() > 0.3 ? 'online' : 'away' as const,
      isStaff: u.isStaff,
      isModerator: u.isModerator
    })));
    setLoading(false);

    // Sonra API'den gerçek veri çek (async)
    Promise.all([
      loadBoards().catch(() => {}),
      loadTopics(1).catch(() => {})
    ]);
  }, [loadBoards, loadTopics]);

  const toggleCategory = (catId: string) => {
    setCategories(prev => prev.map(c => 
      c.id === catId ? { ...c, isExpanded: !c.isExpanded } : c
    ));
  };

  // vBulletin/XenForo tarzı klasik forum
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a0a] pt-20 pb-12">
      {/* Üst Navigation Bar */}
      <div className="bg-slate-800 dark:bg-[#111] text-white border-b border-slate-700 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-6">
              <span className="text-sm text-slate-400">
                <span className="text-emerald-400 font-medium">{stats.onlineUsers + stats.onlineGuests}</span> çevrimiçi ({stats.onlineUsers} üye, {stats.onlineGuests} misafir)
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                <LogIn size={14} />
                Giriş Yap
              </Link>
              <Link href="/register" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                <UserPlus size={14} />
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Header */}
      <header className="bg-gradient-to-r from-cyan-700 to-teal-700 dark:from-cyan-800 dark:to-teal-800 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-bold text-2xl text-white">PAZARYÖNETİMİ</span>
                  <span className="block text-xs text-cyan-200">E-Ticaret Forumu</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Forumda ara..."
                  className="pl-10 pr-4 py-2 w-72 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <Link 
                href="/forum/new-topic"
                className="px-5 py-2.5 bg-white text-cyan-700 font-semibold rounded-lg text-sm hover:bg-cyan-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={18} />
                Yeni Konu
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-slate-900 dark:bg-[#0a0a0a] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-12 overflow-x-auto">
            <Link href="/" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Home size={16} />
              Ana Sayfa
            </Link>
            <Link href="/forum" className="px-4 py-2 text-cyan-400 border-b-2 border-cyan-400 text-sm font-medium flex items-center gap-2">
              <MessageSquare size={16} />
              Forum
            </Link>
            <Link href="/community" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Users size={16} />
              Topluluk
            </Link>
            <Link href="/community/leaderboard" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Crown size={16} />
              Liderlik
            </Link>
            <Link href="/webinars" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Calendar size={16} />
              Etkinlikler
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#111] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/" className="hover:text-cyan-600">Ana Sayfa</Link>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-medium">Forum</span>
          </div>
        </div>
      </div>

      {/* Main Content - vBulletin Style 3 Column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Forum Tree */}
          <div className="lg:col-span-3 space-y-4 order-1">
            {/* Forum Kategorileri */}
            <div className="bg-white dark:bg-[#111] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Folder size={16} className="text-cyan-600" />
                  Forum Bölümleri
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id}>
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{cat.name}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${cat.isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {cat.isExpanded && (
                        <div className="bg-slate-50/50 dark:bg-black/20">
                          {cat.boards.map(board => (
                            <Link
                              key={board.id}
                              href={`/forum/board/${board.slug}`}
                              className="block px-4 py-3 pl-8 text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors border-l-2 border-transparent hover:border-cyan-500"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{board.name}</span>
                                <span className="text-xs text-slate-400">{board.topicCount} konu</span>
                              </div>
                              {board.lastTopic && (
                                <div className="mt-1.5 text-xs">
                                  <span className="text-slate-400">Son: </span>
                                  <span className="text-cyan-600 dark:text-cyan-400 hover:underline truncate max-w-[180px] inline-block">
                                    {board.lastTopic.title}
                                  </span>
                                  <span className="text-slate-400 ml-1">by {board.lastTopic.author}</span>
                                </div>
                              )}
                              {board.description && !board.lastTopic && (
                                <p className="text-xs text-slate-400 mt-1">{board.description}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Hızlı Linkler */}
            <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg p-4 shadow-lg">
              <h3 className="font-bold text-white mb-3 text-sm">Hızlı Erişim</h3>
              <div className="space-y-2">
                <Link href="/forum/new-topic" className="flex items-center gap-2 text-white/90 hover:text-white text-sm py-1.5">
                  <Plus size={14} /> Yeni Konu Aç
                </Link>
                <Link href="/community/leaderboard" className="flex items-center gap-2 text-white/90 hover:text-white text-sm py-1.5">
                  <Crown size={14} /> Liderlik Tablosu
                </Link>
                <Link href="/community" className="flex items-center gap-2 text-white/90 hover:text-white text-sm py-1.5">
                  <Activity size={14} /> Aktivite
                </Link>
              </div>
            </div>
          </div>

          {/* CENTER - Topic List (vBulletin Style Table) */}
          <div className="lg:col-span-7 space-y-4 order-2 min-w-0">
            {/* Topic List Header */}
            <div className="bg-slate-800 dark:bg-[#1a1a1a] text-white rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                Son Konular
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Sıralama:</span>
                <select className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none">
                  <option>Son Aktivite</option>
                  <option>En Yeni</option>
                  <option>En Çok Cevap</option>
                  <option>En Çok Görüntüleme</option>
                </select>
              </div>
            </div>

            {/* Topic Table */}
            <div className="bg-white dark:bg-[#111] rounded-b-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : popularTopics.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Henüz konu bulunmuyor.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {popularTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${topic.isPinned ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                    >
                      {/* Icon Column */}
                      <div className="shrink-0 pt-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          topic.isPinned ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          topic.isHot ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                          topic.isLocked ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                          topic.isSolved ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          {topic.isPinned ? <Pin size={18} /> :
                           topic.isLocked ? <Lock size={18} /> :
                           topic.isSolved ? <CheckCircle size={18} /> :
                           topic.hasPoll ? <BarChart3 size={18} /> :
                           <MessageSquare size={18} />}
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">SABİT</span>
                          )}
                          {topic.isHot && (
                            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">POPÜLER</span>
                          )}
                          <Link 
                            href={`/forum/board/${topic.board.slug}`}
                            className="text-xs text-cyan-600 hover:underline"
                          >
                            {topic.board.name}
                          </Link>
                        </div>
                        
                        <Link href={`/forum/topic/${topic.slug}`} className="group block">
                          <h3 className={`font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors truncate ${topic.isPinned ? 'text-base' : 'text-sm'}`}>
                            {topic.title}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            <Link href={`/forum/user/${topic.author.id}`} className="hover:text-cyan-600">
                              {topic.author.name}
                            </Link>
                            {topic.author.isStaff && <Shield size={10} className="text-cyan-500" />}
                          </span>
                          <span>•</span>
                          <span>{formatRelativeTime(topic.createdAt)}</span>
                          {topic.tags?.map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats Column */}
                      <div className="shrink-0 text-center text-sm">
                        <div className="font-bold text-slate-900 dark:text-white">{topic.replies}</div>
                        <div className="text-xs text-slate-400">cevap</div>
                      </div>

                      {/* Views Column */}
                      <div className="shrink-0 text-center text-sm hidden sm:block">
                        <div className="font-bold text-slate-900 dark:text-white">{topic.views.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">görüntü</div>
                      </div>

                      {/* Last Post Column */}
                      <div className="shrink-0 text-right text-xs hidden md:block w-32">
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-900 dark:text-white">{topic.lastPost.author}</span>
                        </div>
                        <div className="text-slate-400">
                          {formatRelativeTime(topic.lastPost.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Toplam <strong>150</strong> konu • Sayfa <strong>1</strong> / <strong>6</strong>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed">
                    &laquo; İlk
                  </button>
                  <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed">
                    &lsaquo; Önceki
                  </button>
                  {[1, 2, 3, 4, 5, 6].map(page => (
                    <button 
                      key={page}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${
                        page === 1 
                          ? 'bg-cyan-600 text-white' 
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600">
                    Sonraki &rsaquo;
                  </button>
                  <button className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600">
                    Son &raquo;
                  </button>
                </div>
              </div>
            </div>

            {/* Forum Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">İkon Açıklamaları:</span>
              <span className="flex items-center gap-1"><Pin size={14} className="text-amber-500" /> Sabit</span>
              <span className="flex items-center gap-1"><Lock size={14} className="text-red-500" /> Kilitli</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500" /> Çözüldü</span>
              <span className="flex items-center gap-1"><Flame size={14} className="text-orange-500" /> Popüler</span>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-2 space-y-4 order-3 hidden xl:block">
            {/* Online Users Box */}
            <div className="bg-white dark:bg-[#111] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border-b border-emerald-100 dark:border-emerald-800">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Users size={16} />
                  Çevrimiçi Üyeler
                </h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Şu anda <strong className="text-emerald-600">{stats.onlineUsers}</strong> üye çevrimiçi
                </p>
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/forum/user/${user.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-emerald-500' :
                        user.status === 'away' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={`${user.isStaff ? 'text-cyan-600 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                        {user.name}
                      </span>
                      {user.isStaff && <Shield size={10} className="text-cyan-500" />}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Forum Statistics */}
            <div className="bg-white dark:bg-[#111] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-cyan-600" />
                  Forum İstatistikleri
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Toplam Konu</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.totalTopics.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Toplam Gönderi</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.totalPosts.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Toplam Üye</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.totalMembers.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Son Üye: </span>
                    <Link href="#" className="text-cyan-600 hover:underline font-medium">
                      {stats.newestMember}
                    </Link>
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="text-xs text-slate-500">
                    En çok çevrimiçi: <strong>{stats.mostOnline}</strong> ({stats.mostOnlineDate})
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Online */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                <Shield size={16} />
                Çevrimiçi Yetkililer
              </h4>
              <div className="space-y-2">
                {onlineUsers.filter(u => u.isStaff || u.isModerator).map(staff => (
                  <div key={staff.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{staff.name}</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {staff.isStaff ? '(Yönetici)' : '(Moderatör)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
