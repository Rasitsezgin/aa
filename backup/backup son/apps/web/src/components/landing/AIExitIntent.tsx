'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, ArrowRight, Clock, Zap } from 'lucide-react';

interface AIExitIntentProps {
    features?: {
        exitIntent: {
            enabled: boolean;
            discountPercent: number;
            triggerDelay: number;
        };
    };
    onClose?: () => void;
}

export const AIExitIntent = ({ features, onClose }: AIExitIntentProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const discountPercent = features?.exitIntent.discountPercent || 20;
    const triggerDelay = features?.exitIntent.triggerDelay || 1000;

    useEffect(() => {
        if (!features?.exitIntent.enabled) return;

        let mouseLeft = false;
        let timeoutId: NodeJS.Timeout;

        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger when mouse leaves from top of the viewport
            if (e.clientY <= 0 && !mouseLeft) {
                mouseLeft = true;
                
                // Add delay before showing popup
                timeoutId = setTimeout(() => {
                    setIsVisible(true);
                }, triggerDelay);
            }
        };

        const handleMouseEnter = () => {
            mouseLeft = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [features?.exitIntent.enabled, triggerDelay]);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        
        // After 3 seconds, close the popup
        setTimeout(() => {
            handleClose();
        }, 3000);
    };

    if (!features?.exitIntent.enabled) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ 
                            opacity: 0, 
                            scale: 0.8, 
                            y: 100,
                            rotateX: 10
                        }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            rotateX: 0
                        }}
                        exit={{ 
                            opacity: 0, 
                            scale: 0.8, 
                            y: 100,
                            rotateX: 10
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30 
                        }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative p-6 bg-gradient-to-br from-primary to-primary/80">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-xl rounded-lg text-white hover:bg-white/30 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl">
                                        <Gift className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">Özel Teklif!</h3>
                                        <p className="text-sm text-white/80">Ayrılmadan önce bunu görün</p>
                                    </div>
                                </div>

                                {/* Discount Badge */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full"
                                >
                                    <Sparkles className="w-4 h-4 text-yellow-300" />
                                    <span className="text-lg font-black text-white">%{discountPercent} İNDİRİM</span>
                                </motion.div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {!isSubmitted ? (
                                    <>
                                        <div className="mb-6">
                                            <h4 className="text-lg font-bold text-foreground mb-2">
                                                Pazaryonetimi'yi denemeden gitmeyin!
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                E-posta adresinizi bırakın, ilk ayınızda %{discountPercent} indirim kazanın. 
                                                İstediğiniz zaman iptal edebilirsiniz.
                                            </p>
                                        </div>

                                        {/* Benefits */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Zap className="w-4 h-4 text-primary" />
                                                <span className="text-foreground">Hemen başlayın, kurulum yok</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span className="text-foreground">14 gün ücretsiz deneme</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Gift className="w-4 h-4 text-primary" />
                                                <span className="text-foreground">%{discountPercent} ilk ay indirim</span>
                                            </div>
                                        </div>

                                        {/* Form */}
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="E-posta adresiniz"
                                                    required
                                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                            >
                                                % {discountPercent} İndirim Kazan
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </form>

                                        {/* Trust indicators */}
                                        <div className="mt-4 text-center">
                                            <p className="text-xs text-slate-500">
                                                Spam göndermiyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    /* Success State */
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Gift className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h4 className="text-xl font-bold text-foreground mb-2">
                                            Teklifiniz Aktif!
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            %{discountPercent} indirim kodu e-posta adresinize gönderildi.
                                        </p>
                                        <div className="text-xs text-slate-500">
                                            Popup 3 saniye içinde kapanacak...
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-white/10">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>⚡ 1,247+ satıcı güveniyor</span>
                                    <span>🔒 Güvenli ödeme</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
