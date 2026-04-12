'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { 
    RotateCw, 
    ZoomIn, 
    ZoomOut, 
    Maximize2, 
    Package, 
    ShoppingCart, 
    Eye, 
    Heart,
    Star,
    TrendingUp,
    Sparkles
} from 'lucide-react';

interface ProductShowcase360Props {
    features?: {
        showcase?: {
            enabled: boolean;
            autoRotate: boolean;
            rotationSpeed: number;
            showHotspots: boolean;
            allowZoom: boolean;
        };
    };
}

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    reviews: number;
    image: string;
    description: string;
    features: string[];
    hotspots?: { x: number; y: number; title: string; description: string }[];
}

export const ProductShowcase360 = ({ features }: ProductShowcase360Props) => {
    const [selectedProduct, setSelectedProduct] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const rotationX = useMotionValue(0);
    const rotationY = useMotionValue(0);
    const smoothRotationX = useSpring(rotationX, { stiffness: 300, damping: 30 });
    const smoothRotationY = useSpring(rotationY, { stiffness: 300, damping: 30 });

    const autoRotate = features?.showcase?.autoRotate !== false;
    const rotationSpeed = features?.showcase?.rotationSpeed || 1;
    const showHotspots = features?.showcase?.showHotspots !== false;
    const allowZoom = features?.showcase?.allowZoom !== false;

    // Sample products data
    const products: Product[] = [
        {
            id: '1',
            name: 'iPhone 15 Pro Max',
            category: 'Elektronik',
            price: 54999,
            rating: 4.8,
            reviews: 1247,
            image: '/api/placeholder/400/400',
            description: 'A17 Pro chip ile güçlendirilmiş en yeni iPhone',
            features: ['A17 Pro', 'Titanium', 'Pro Camera', '5G'],
            hotspots: [
                { x: 50, y: 30, title: 'A17 Pro Chip', description: 'Industry-leading performance' },
                { x: 80, y: 50, title: 'Pro Camera', description: '48MP main camera' },
                { x: 20, y: 70, title: 'Titanium', description: 'Lightweight and durable' }
            ]
        },
        {
            id: '2',
            name: 'Samsung Galaxy S24 Ultra',
            category: 'Elektronik',
            price: 47999,
            rating: 4.7,
            reviews: 892,
            image: '/api/placeholder/400/400',
            description: 'Galaxy AI ile akıllı telefon deneyimi',
            features: ['Galaxy AI', 'S Pen', '200MP Camera', '5G'],
            hotspots: [
                { x: 45, y: 25, title: 'Galaxy AI', description: 'Smart AI features' },
                { x: 75, y: 45, title: '200MP Camera', description: 'Incredible zoom' }
            ]
        },
        {
            id: '3',
            name: 'AirPods Pro 2',
            category: 'Aksesuar',
            price: 4499,
            rating: 4.9,
            reviews: 2341,
            image: '/api/placeholder/400/400',
            description: 'Aktif gürültü engelleme ile kablosuz kulaklık',
            features: ['ANC', 'Spatial Audio', 'MagSafe', '6hr Battery'],
            hotspots: [
                { x: 50, y: 40, title: 'ANC', description: 'Active Noise Cancellation' },
                { x: 30, y: 60, title: 'MagSafe', description: 'Easy charging' }
            ]
        }
    ];

    useEffect(() => {
        if (!autoRotate || isDragging) return;

        const interval = setInterval(() => {
            setRotation(prev => (prev + rotationSpeed) % 360);
        }, 50);

        return () => clearInterval(interval);
    }, [autoRotate, isDragging, rotationSpeed]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        setRotation(prev => (prev + deltaX * 0.5) % 360);
        setStartX(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!allowZoom) return;
        
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    const currentProduct = products[selectedProduct];

    if (!features?.showcase?.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">360° Ürün Gösterimi</h3>
                            <p className="text-sm text-slate-500">Etkileşimli ürün inceleme deneyimi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
                            disabled={!allowZoom || zoom <= 0.5}
                            className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                            disabled={!allowZoom || zoom >= 3}
                            className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setRotation(0)}
                            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${isFullscreen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6 p-6`}>
                {/* 3D Product Viewer */}
                <div
                    ref={containerRef}
                    className={`relative ${isFullscreen ? 'h-[600px]' : 'h-[400px]'} bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                            transform: `scale(${zoom}) rotateY(${rotation}deg)`,
                            transition: isDragging ? 'none' : 'transform 0.3s ease'
                        }}
                    >
                        {/* Product Image Placeholder */}
                        <motion.div
                            animate={{ rotateY: rotation }}
                            style={{ transformStyle: 'preserve-3d' }}
                            className="relative"
                        >
                            <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/30 flex items-center justify-center">
                                <Package className="w-16 h-16 text-primary/50" />
                            </div>
                            
                            {/* Hotspots */}
                            {showHotspots && currentProduct.hotspots?.map((hotspot, index) => (
                                <motion.div
                                    key={index}
                                    className="absolute w-6 h-6 bg-primary rounded-full cursor-pointer flex items-center justify-center"
                                    style={{
                                        left: `${hotspot.x}%`,
                                        top: `${hotspot.y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    onClick={() => setActiveHotspot(activeHotspot === index ? null : index)}
                                >
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Hotspot Tooltip */}
                    <AnimatePresence>
                        {activeHotspot !== null && currentProduct.hotspots?.[activeHotspot] && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-2xl z-10"
                                style={{
                                    left: `${currentProduct.hotspots[activeHotspot].x}%`,
                                    top: `${currentProduct.hotspots[activeHotspot].y}%`,
                                    transform: 'translate(-50%, -120%)'
                                }}
                            >
                                <h4 className="font-bold text-foreground text-sm mb-1">
                                    {currentProduct.hotspots[activeHotspot].title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {currentProduct.hotspots[activeHotspot].description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Rotation Indicator */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-white text-xs">
                        <RotateCw className="w-3 h-3" />
                        {Math.round(rotation)}°
                    </div>

                    {/* Zoom Indicator */}
                    {allowZoom && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-white text-xs">
                            <ZoomIn className="w-3 h-3" />
                            {Math.round(zoom * 100)}%
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    {/* Product Selector */}
                    <div className="flex gap-2">
                        {products.map((product, index) => (
                            <button
                                key={product.id}
                                onClick={() => setSelectedProduct(index)}
                                className={`flex-1 p-3 rounded-xl border transition-all ${
                                    selectedProduct === index
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                            >
                                <div className="text-sm font-bold">{product.name}</div>
                                <div className="text-xs opacity-70">{product.category}</div>
                            </button>
                        ))}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h4 className="text-2xl font-black text-foreground mb-2">
                            {currentProduct.name}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {currentProduct.description}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < Math.floor(currentProduct.rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-bold">{currentProduct.rating}</span>
                            <span className="text-sm text-slate-500">({currentProduct.reviews} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-3xl font-black text-foreground">
                                ₺{currentProduct.price.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrendingUp className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600 font-bold">Stokta</span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-6">
                            <h5 className="text-sm font-bold text-foreground">Özellikler</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {currentProduct.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-lg text-xs"
                                    >
                                        <Sparkles className="w-3 h-3 text-primary" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
                                <ShoppingCart className="w-4 h-4" />
                                Sepete Ekle
                            </button>
                            <button className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                <Heart className="w-4 h-4" />
                            </button>
                            <button className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
