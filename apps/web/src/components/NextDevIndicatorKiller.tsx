"use client";

import { useEffect } from 'react';

/**
 * Next.js 15 Dev Indicator Killer
 * This component aggressively removes the Next.js development indicators
 * from the DOM if they appear, bypassing config/CSS limitations.
 */
export default function NextDevIndicatorKiller() {
    useEffect(() => {
        // Only run in development
        if (process.env.NODE_ENV !== 'development') return;

        const kill = () => {
            // Common selectors for Next.js 15 indicators and portals
            const selectors = [
                'nextjs-portal',
                '[data-nextjs-indicator]',
                '[data-nextjs-portal]',
                '.__next-static-indicator',
                '#nextjs-static-indicator'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // Hide it first for immediate effect
                    (el as HTMLElement).style.display = 'none';
                    (el as HTMLElement).style.opacity = '0';
                    (el as HTMLElement).style.pointerEvents = 'none';
                    // Then try to remove it
                    try {
                        el.remove();
                    } catch (e) {
                        // Fallback if remove fails
                    }
                });
            });
        };

        // Run execution immediately
        kill();

        // Set up a mutation observer to catch it if it's re-injected
        const observer = new MutationObserver((mutations) => {
            kill();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });

        // Also run on a short interval as a last resort
        const interval = setInterval(kill, 1000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
