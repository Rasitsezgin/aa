"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, ArrowRight, Search, Tag, TrendingUp, Flame,
    BookOpen, Sparkles, Eye, Heart, Filter, ChevronDown, X,
    Zap, ShoppingCart, BarChart3, Settings, Lightbulb, Rocket
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
    {
        id: 1,
        title: "E-ticarette Yapay Zeka: 2026'da Neler Değişiyor?",
        excerpt: "Yapay zeka teknolojileri e-ticaret sektörünü kökten değiştiriyor. Otomasyon, kişiselleştirme ve tahminleme alanlarındaki son gelişmeleri inceliyoruz.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
        category: "Yapay Zeka",
        date: "28 Ocak 2026",
        readTime: "8 dk",
        featured: true,
        trending: true,
        views: 12453,
        likes: 847,
        author: {
            name: "Ahmet Yılmaz",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        }
    },
    {
        id: 2,
        title: "Trendyol'da Satışlarınızı %200 Artırmanın 10 Yolu",
        excerpt: "Trendyol'da rekabette öne çıkmak için uygulamanız gereken stratejiler ve SEO ipuçları.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
        category: "Pazaryeri",
        date: "25 Ocak 2026",
        readTime: "6 dk",
        featured: false,
        trending: true,
        views: 28934,
        likes: 1523,
        author: {
            name: "Zeynep Kaya",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
        }
    },
    {
        id: 3,
        title: "Stok Yönetiminde Yapılan 5 Kritik Hata",
        excerpt: "E-ticaret satıcılarının stok yönetiminde sıkça yaptığı hatalar ve bunlardan nasıl kaçınılacağı.",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
        category: "Operasyon",
        date: "22 Ocak 2026",
        readTime: "5 dk",
        featured: false,
        trending: false,
        views: 8234,
        likes: 412,
        author: {
            name: "Mehmet Demir",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        }
    },
    {
        id: 4,
        title: "Çoklu Pazaryeri Yönetimi: Başlangıç Rehberi",
        excerpt: "Birden fazla pazaryerinde satış yaparken verimliliği nasıl artırabilirsiniz? Kapsamlı rehberimiz.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
        category: "Rehber",
        date: "18 Ocak 2026",
        readTime: "10 dk",
        featured: false,
        trending: true,
        views: 15678,
        likes: 923,
        author: {
            name: "Ayşe Yıldız",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
        }
    },
    {
        id: 5,
        title: "2026 E-ticaret Trendleri: Hazır mısınız?",
        excerpt: "Bu yıl e-ticaret dünyasını şekillendirecek trendler ve işletmenizi nasıl hazırlayabileceğiniz.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
        category: "Trend",
        date: "15 Ocak 2026",
        readTime: "7 dk",
        featured: false,
        trending: false,
        views: 21456,
        likes: 1245,
        author: {
            name: "Can Özkan",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
        }
    },
    {
        id: 6,
        title: "Amazon Türkiye'de Satış Yapmaya Başlamak",
        excerpt: "Amazon Türkiye'de mağaza açma sürecinden ilk satışa kadar bilmeniz gereken her şey.",
        image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=400&fit=crop",
        category: "Pazaryeri",
        date: "12 Ocak 2026",
        readTime: "9 dk",
        featured: false,
        trending: false,
        views: 34567,
        likes: 1876,
        author: {
            name: "Emre Şahin",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"
        }
    }
];

const categories = [
    { name: "Tümü", icon: BookOpen, color: "blue" },
    { name: "Yapay Zeka", icon: Sparkles, color: "purple" },
    { name: "Pazaryeri", icon: ShoppingCart, color: "green" },
    { name: "Operasyon", icon: Settings, color: "orange" },
    { name: "Rehber", icon: Lightbulb, color: "yellow" },
    { name: "Trend", icon: TrendingUp, color: "pink" }
];

const popularTags = [
    "E-ticaret", "Trendyol", "Amazon", "Stok Yönetimi", "AI", "SEO",
    "Fiyatlandırma", "Pazarlama", "Lojistik", "Müşteri Deneyimi"
];

export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = React.useState("Tümü");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState<'latest' | 'popular' | 'trending'>('latest');

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = selectedCategory === "Tümü" || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'popular') return b.views - a.views;
        if (sortBy === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        return 0;
    });

    const featuredPost = blogPosts.find(post => post.featured);
    const trendingPosts = blogPosts.filter(post => post.trending).slice(0, 4);

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wide uppercase">Blog & İçgörüler</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        E-ticaret <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Bilgi Merkezi</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Satışlarınızı artıracak stratejiler, sektör trendleri ve uzman görüşleri.
                        E-ticaret yolculuğunuzda yanınızdayız.
                    </p>
                </motion.div>

                {/* Search & Sort Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-4xl mx-auto mb-12"
                >
                    <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Yazı ara... (örn: Trendyol, stok yönetimi)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortBy('latest')}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${sortBy === 'latest'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/20'
                                    }`}
                            >
                                <Clock size={16} />
                                En Yeni
                            </button>
                            <button
                                onClick={() => setSortBy('popular')}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${sortBy === 'popular'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/20'
                                    }`}
                            >
                                <Eye size={16} />
                                Popüler
                            </button>
                            <button
                                onClick={() => setSortBy('trending')}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${sortBy === 'trending'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/20'
                                    }`}
                            >
                                <Flame size={16} />
                                Trend
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map(category => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.name;
                        return (
                            <button
                                key={category.name}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-md'
                                    }`}
                            >
                                <Icon size={16} />
                                {category.name}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Featured Post */}
                {featuredPost && selectedCategory === "Tümü" && !searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Rocket className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Öne Çıkan</h2>
                        </div>
                        <Link href={`/blog/${featuredPost.id}`} className="group block">
                            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="grid md:grid-cols-2 gap-8 relative">
                                    <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                                                ⭐ ÖNE ÇIKAN
                                            </span>
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full">
                                                {featuredPost.category}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-white/80 mb-6 line-clamp-2 text-lg">
                                            {featuredPost.excerpt}
                                        </p>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                                                    <Image
                                                        src={featuredPost.author.avatar}
                                                        alt={featuredPost.author.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="text-white font-medium">{featuredPost.author.name}</span>
                                            </div>
                                            <span className="flex items-center gap-1 text-white/70">
                                                <Calendar size={14} />
                                                {featuredPost.date}
                                            </span>
                                            <span className="flex items-center gap-1 text-white/70">
                                                <Clock size={14} />
                                                {featuredPost.readTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/20">
                                            <span className="flex items-center gap-1 text-white/70">
                                                <Eye size={16} />
                                                {featuredPost.views.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-white/70">
                                                <Heart size={16} />
                                                {featuredPost.likes.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="aspect-video md:aspect-auto overflow-hidden order-1 md:order-2 relative h-full">
                                        <Image
                                            src={featuredPost.image}
                                            alt={featuredPost.title}
                                            fill
                                            priority
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Trending Section */}
                {selectedCategory === "Tümü" && !searchQuery && trendingPosts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trend Yazılar</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {trendingPosts.map((post, index) => (
                                <Link key={post.id} href={`/blog/${post.id}`} className="group">
                                    <div className="relative p-5 bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                                        <span className="absolute -top-3 -left-1 text-5xl font-black text-orange-200 dark:text-orange-900/50">
                                            {index + 1}
                                        </span>
                                        <div className="relative">
                                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{post.category}</span>
                                            <h3 className="font-bold text-slate-900 dark:text-white mt-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Eye size={12} />
                                                    {(post.views / 1000).toFixed(1)}k
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Heart size={12} />
                                                    {post.likes}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-[1fr_320px] gap-12">
                    {/* Blog Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {selectedCategory === "Tümü" ? "Tüm Yazılar" : selectedCategory}
                                </h2>
                                <span className="text-sm text-slate-500">({filteredPosts.length})</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredPosts.filter(p => !p.featured || selectedCategory !== "Tümü" || searchQuery).map((post, index) => (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                >
                                    <Link href={`/blog/${post.id}`} className="group block h-full">
                                        <div className="h-full rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                                            <div className="relative aspect-video overflow-hidden group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow duration-500">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                                <Image
                                                    src={post.image}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                                {post.trending && (
                                                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                        <Flame size={12} />
                                                        Trend
                                                    </span>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Tag size={12} className="text-blue-500" />
                                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                        {post.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                                    {post.excerpt}
                                                </p>

                                                {/* Author */}
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative w-7 h-7 rounded-full overflow-hidden">
                                                            <Image
                                                                src={post.author.avatar}
                                                                alt={post.author.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="28px"
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">{post.author.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={12} />
                                                            {(post.views / 1000).toFixed(1)}k
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {post.readTime}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>

                        {filteredPosts.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                    <Search size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Sonuç Bulunamadı
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    Aramanızla eşleşen yazı bulunamadı. Farklı anahtar kelimeler deneyin.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('Tümü'); }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}

                        {/* Load More */}
                        {filteredPosts.length > 0 && (
                            <div className="text-center mt-12">
                                <button className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-2xl font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                                    Daha Fazla Yükle
                                    <ChevronDown size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">
                        {/* Newsletter */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Zap size={24} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Haftalık Bülten</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                E-ticaret ipuçları ve sektör haberleri her Pazartesi sabahı e-postanızda.
                            </p>
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-sm mb-3 focus:outline-none focus:border-white/40"
                            />
                            <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                Abone Ol <ArrowRight size={16} />
                            </button>
                            <p className="text-xs text-blue-200 mt-3 text-center">
                                10,000+ satıcı abone oldu
                            </p>
                        </motion.div>

                        {/* Popular Tags */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10"
                        >
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Tag size={18} className="text-blue-600" />
                                Popüler Etiketler
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map(tag => (
                                    <Link
                                        key={tag}
                                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                                        className="px-3 py-1.5 bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 text-sm rounded-full border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* Most Read */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10"
                        >
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart3 size={18} className="text-green-600" />
                                En Çok Okunan
                            </h3>
                            <div className="space-y-4">
                                {[...blogPosts].sort((a, b) => b.views - a.views).slice(0, 5).map((post, index) => (
                                    <Link key={post.id} href={`/blog/${post.id}`} className="group flex gap-3">
                                        <span className="text-2xl font-black text-slate-200 dark:text-slate-700">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                {post.title}
                                            </h4>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Eye size={10} />
                                                {post.views.toLocaleString()} görüntülenme
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                            className="p-6 bg-slate-900 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-2xl text-center"
                        >
                            <Rocket className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                            <h3 className="font-bold text-white mb-2">E-ticaretinizi Büyütün</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                7+ pazaryerini tek panelden yönetin, satışlarınızı katlayın.
                            </p>
                            <Link
                                href="/ucretsiz-dene"
                                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
                            >
                                14 Gün Ücretsiz Deneyin
                            </Link>
                        </motion.div>
                    </aside>
                </div>
            </div>
        </section >
    );
}
