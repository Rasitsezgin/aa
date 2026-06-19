"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { List } from 'lucide-react';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents() {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll('h2, h3'))
            .map((elem) => ({
                id: elem.id || elem.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
                text: elem.textContent || '',
                level: Number(elem.tagName.substring(1))
            }));

        // Add IDs to elements if they don't have them
        elements.forEach(item => {
            const elem = Array.from(document.querySelectorAll(`h${item.level}`)).find(e => e.textContent === item.text);
            if (elem && !elem.id) elem.id = item.id;
        });

        const timer = setTimeout(() => {
            setHeadings(elements);
        }, 0);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0px 0px -40% 0px' }
        );

        document.querySelectorAll('h2, h3').forEach((elem) => observer.observe(elem));

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    if (headings.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-32 p-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-white/10 hidden lg:block shadow-sm"
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50 dark:border-white/10">
                <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400">
                    <List size={18} />
                </div>
                <span className="font-bold text-sm tracking-wide uppercase text-slate-900 dark:text-white">İçindekiler</span>
            </div>
            <nav className="flex flex-col gap-1.5 relative">
                <div className="absolute left-[1px] top-0 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 rounded-full" />
                
                {headings.map((heading) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            document.querySelector(`#${heading.id}`)?.scrollIntoView({
                                behavior: 'smooth'
                            });
                            setActiveId(heading.id);
                        }}
                        className={`relative z-10 text-[13px] leading-relaxed transition-all duration-300 block py-1.5 pl-4 rounded-r-xl ${activeId === heading.id
                            ? 'text-orange-600 dark:text-orange-400 font-semibold bg-orange-50/50 dark:bg-orange-500/10'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                            } ${heading.level === 3 ? 'ml-3' : ''}`}
                    >
                        {/* Active Line Indicator */}
                        {activeId === heading.id && (
                            <motion.div 
                                layoutId="activeTOC"
                                className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500 rounded-full"
                            />
                        )}
                        {heading.text}
                    </a>
                ))}
            </nav>
        </motion.div>
    );
}
