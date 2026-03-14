"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, X, ChevronRight, Info, AlertTriangle, CheckCircle,
    Gift, Wrench, RefreshCw, Pin, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Announcement {
    id: string;
    title: string;
    content: string;
    summary?: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'PROMOTION' | 'MAINTENANCE' | 'UPDATE';
    icon?: string;
    color?: string;
    actionUrl?: string;
    actionText?: string;
    isPinned?: boolean;
    isRead?: boolean;
    createdAt: Date;
}

const TYPE_CONFIG = {
    INFO: { icon: Info, color: 'blue', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', textClass: 'text-blue-400' },
    WARNING: { icon: AlertTriangle, color: 'yellow', bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/20', textClass: 'text-yellow-400' },
    SUCCESS: { icon: CheckCircle, color: 'green', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/20', textClass: 'text-green-400' },
    PROMOTION: { icon: Gift, color: 'purple', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/20', textClass: 'text-purple-400' },
    MAINTENANCE: { icon: Wrench, color: 'orange', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/20', textClass: 'text-orange-400' },
    UPDATE: { icon: RefreshCw, color: 'cyan', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/20', textClass: 'text-cyan-400' },
};

interface AnnouncementBannerProps {
    announcements?: Announcement[];
    onDismiss?: (id: string) => void;
    onRead?: (id: string) => void;
}

export function AnnouncementBanner({ announcements = [], onDismiss, onRead }: AnnouncementBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<string[]>([]);

    // Güvenli filter
    const safeAnnouncements = announcements || [];
    const visibleAnnouncements = safeAnnouncements.filter(a => !dismissed.includes(a.id));
    const current = visibleAnnouncements[currentIndex];

    if (!current || visibleAnnouncements.length === 0) return null;

    const config = TYPE_CONFIG[current.type];
    const IconComponent = config.icon;

    const handleDismiss = () => {
        setDismissed(prev => [...prev, current.id]);
        onDismiss?.(current.id);
        if (currentIndex >= visibleAnnouncements.length - 1) {
            setCurrentIndex(0);
        }
    };

    const nextAnnouncement = () => {
        setCurrentIndex(prev => (prev + 1) % visibleAnnouncements.length);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative ${config.bgClass} ${config.borderClass} border rounded-xl p-4 mb-6`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bgClass}`}>
                    <IconComponent size={20} className={config.textClass} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground">{current.title}</h4>
                        {current.isPinned && (
                            <Pin size={12} className="text-yellow-400" />
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {current.summary || current.content}
                    </p>
                    {current.actionUrl && current.actionText && (
                        <Link
                            href={current.actionUrl}
                            onClick={() => onRead?.(current.id)}
                            className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${config.textClass} hover:underline`}
                        >
                            {current.actionText}
                            <ExternalLink size={12} />
                        </Link>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {visibleAnnouncements.length > 1 && (
                        <button
                            onClick={nextAnnouncement}
                            className="p-1.5 text-slate-500 hover:text-foreground hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 text-slate-500 hover:text-foreground hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
            {visibleAnnouncements.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    {visibleAnnouncements.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? config.textClass.replace('text-', 'bg-') : 'bg-slate-600'
                                }`}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

interface AnnouncementDropdownProps {
    announcements?: Announcement[];
    unreadCount?: number;
    onRead?: (id: string) => void;
    onDismiss?: (id: string) => void;
}

export function AnnouncementDropdown({ announcements = [], unreadCount = 0, onRead, onDismiss }: AnnouncementDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Güvenli announcements
    const safeAnnouncements = announcements || [];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-foreground hover:bg-white/5 rounded-xl transition-colors"
            >
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-foreground">Duyurular</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                                            {unreadCount} yeni
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {safeAnnouncements.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <MessageSquare size={32} className="mx-auto mb-3 text-slate-600" />
                                        <p className="text-sm text-slate-500">Henüz duyuru yok</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {safeAnnouncements.map((announcement) => {
                                            const config = TYPE_CONFIG[announcement.type];
                                            const IconComponent = config.icon;

                                            return (
                                                <div
                                                    key={announcement.id}
                                                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!announcement.isRead ? 'bg-primary/5' : ''
                                                        }`}
                                                    onClick={() => {
                                                        onRead?.(announcement.id);
                                                        if (announcement.actionUrl) {
                                                            window.location.href = announcement.actionUrl;
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${config.bgClass}`}>
                                                            <IconComponent size={16} className={config.textClass} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium text-foreground text-sm line-clamp-1">
                                                                    {announcement.title}
                                                                </h4>
                                                                {!announcement.isRead && (
                                                                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                                                {announcement.summary || announcement.content}
                                                            </p>
                                                            <span className="text-[10px] text-slate-600 mt-1 block">
                                                                {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDismiss?.(announcement.id);
                                                            }}
                                                            className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-foreground transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {announcements.length > 0 && (
                                <div className="p-3 border-t border-border">
                                    <Link
                                        href="/dashboard/notifications"
                                        className="block text-center text-sm text-primary hover:text-primary/80 font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Tümünü Gör
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Compact inline announcement for dashboard
interface InlineAnnouncementProps {
    announcement?: Announcement | null;
    onDismiss?: () => void;
}

export function InlineAnnouncement({ announcement, onDismiss }: InlineAnnouncementProps) {
    if (!announcement) return null;

    const config = TYPE_CONFIG[announcement.type];
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center gap-3 px-4 py-3 ${config.bgClass} ${config.borderClass} border rounded-xl`}
        >
            <IconComponent size={18} className={config.textClass} />
            <p className="flex-1 text-sm text-foreground">{announcement.title}</p>
            {announcement.actionUrl && (
                <Link
                    href={announcement.actionUrl}
                    className={`text-sm font-medium ${config.textClass} hover:underline flex items-center gap-1`}
                >
                    {announcement.actionText || 'Görüntüle'}
                    <ChevronRight size={14} />
                </Link>
            )}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="p-1 text-slate-500 hover:text-foreground rounded transition-colors"
                >
                    <X size={14} />
                </button>
            )}
        </motion.div>
    );
}
