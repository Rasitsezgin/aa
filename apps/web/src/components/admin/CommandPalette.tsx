"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    LayoutDashboard,
    Users,
    Settings,
    Package,
    ShoppingCart,
    FileText,
    Building2,
    LineChart,
    Moon,
    Sun,
    LogOut,
    Command as CommandIcon,
} from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Klavye kısayolu (Cmd+K / Ctrl+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    const navItems = [
        { name: "Dashboard", url: "/admin", icon: LayoutDashboard, group: "Genel" },
        { name: "Siparişler", url: "/admin/orders", icon: ShoppingCart, group: "Operasyon" },
        { name: "Ürünler", url: "/admin/products", icon: Package, group: "Operasyon" },
        { name: "Kullanıcılar", url: "/admin/users", icon: Users, group: "Yönetim" },
        { name: "Kiracılar (Tenants)", url: "/admin/tenants", icon: Building2, group: "Yönetim" },
        { name: "Raporlar & Analiz", url: "/admin/reports", icon: LineChart, group: "Raporlama" },
        { name: "Sayfalar", url: "/admin/pages", icon: FileText, group: "İçerik" },
        { name: "Ayarlar", url: "/admin/settings", icon: Settings, group: "Yönetim" },
    ];

    return (
        <>
            {/* Global tetikleyici butonu (header'a koyulacak aslında ama yedek olarak burada) */}
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-foreground bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
                <Search size={14} />
                <span>Hızlı Ara...</span>
                <kbd className="inline-flex items-center gap-1 font-mono text-[10px] font-medium opacity-50 ml-4">
                    <CommandIcon size={10} />
                    K
                </kbd>
            </button>

            <AnimatePresence>
                {open && (
                    <Command.Dialog
                        open={open}
                        onOpenChange={setOpen}
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-0"
                        label="Global Command Palette"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm -z-10"
                            onClick={() => setOpen(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                        >
                            <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-white/10">
                                <Search className="w-5 h-5 text-slate-400 mr-3" />
                                <Command.Input
                                    autoFocus
                                    placeholder="Panelde ara veya bir komut yazın..."
                                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-slate-500 font-medium"
                                />
                                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
                                    ESC ile çık
                                </kbd>
                            </div>

                            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                <Command.Empty className="py-12 text-center text-sm text-slate-500">
                                    Sonuç bulunamadı.
                                </Command.Empty>

                                <Command.Group heading="Sayfalar" className="text-xs font-semibold text-slate-400 p-2">
                                    {navItems.map((item) => (
                                        <Command.Item
                                            key={item.url}
                                            onSelect={() => runCommand(() => router.push(item.url))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                            <span className="ml-auto text-[10px] opacity-50">{item.group}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Separator className="h-px bg-slate-200 dark:bg-white/10 my-2" />

                                <Command.Group heading="Hızlı İşlemler" className="text-xs font-semibold text-slate-400 p-2">
                                    <Command.Item
                                        onSelect={() => runCommand(() => {
                                            document.documentElement.classList.add('dark');
                                            localStorage.setItem('theme', 'dark');
                                            // Notify AdminLayout if needed, but typically layout reads from localStorage on mount. To be fully reactive, a CustomEvent can be dispatched.
                                            window.dispatchEvent(new Event('theme-change'));
                                        })}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-blue-500/10 aria-selected:text-blue-600"
                                    >
                                        <Moon className="w-4 h-4" />
                                        Karanlık Moda Geç
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => {
                                            document.documentElement.classList.remove('dark');
                                            localStorage.setItem('theme', 'light');
                                            window.dispatchEvent(new Event('theme-change'));
                                        })}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-amber-500/10 aria-selected:text-amber-600"
                                    >
                                        <Sun className="w-4 h-4" />
                                        Aydınlık Moda Geç
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => console.log('Logout'))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-red-500/10 aria-selected:text-red-600"
                                    >
                                        <LogOut className="w-4 h-4 text-red-500" />
                                        Oturumu Kapat
                                    </Command.Item>
                                </Command.Group>
                            </Command.List>

                            <div className="px-4 py-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500">
                                    <span className="flex items-center gap-1"><kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">↑↓</kbd> Gezin</span>
                                    <span className="flex items-center gap-1"><kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">↵</kbd> Seç</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    PazarYönetimi OS
                                </div>
                            </div>
                        </motion.div>
                    </Command.Dialog>
                )}
            </AnimatePresence>
        </>
    );
}
