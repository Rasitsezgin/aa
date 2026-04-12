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
            className="sticky top-32 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hidden lg:block"
        >
            <div className="flex items-center gap-2 mb-4 font-bold text-slate-900 dark:text-white">
                <List size={20} className="text-blue-600" />
                İçindekiler
            </div>
            <nav className="flex flex-col gap-2">
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
                        className={`text-sm transition-all hover:text-blue-600 dark:hover:text-blue-400 block py-1 border-l-2 pl-4 ${activeId === heading.id
                            ? 'text-blue-600 dark:text-blue-400 border-blue-600 font-medium'
                            : 'text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-white/20'
                            } ${heading.level === 3 ? 'ml-4' : ''}`}
                    >
                        {heading.text}
                    </a>
                ))}
            </nav>
        </motion.div>
    );
}
