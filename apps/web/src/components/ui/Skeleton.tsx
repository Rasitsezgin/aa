"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-slate-200 dark:bg-white/10 relative overflow-hidden",
                className
            )}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />
        </div>
    );
}

// Card Skeleton
export function CardSkeleton() {
    return (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
            <Skeleton className="h-48 w-full mb-4 rounded-xl" />
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
}

// Blog Card Skeleton
export function BlogCardSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
            <Skeleton className="h-48 w-full" />
            <div className="p-6">
                <Skeleton className="h-3 w-16 mb-3" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-3/4 mb-4" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-4" />
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-white/5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    );
}

// Stats Skeleton
export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                    <Skeleton className="h-8 w-8 rounded-lg mb-4" />
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

// Profile Skeleton
export function ProfileSkeleton() {
    return (
        <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}

// Navigation Skeleton
export function NavSkeleton() {
    return (
        <div className="flex items-center gap-8">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
            ))}
        </div>
    );
}

// Full Page Loading
export function PageLoadingSkeleton() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <Skeleton className="h-8 w-32 mx-auto mb-6 rounded-full" />
                    <Skeleton className="h-12 w-96 mx-auto mb-4" />
                    <Skeleton className="h-6 w-80 mx-auto" />
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
// Bento Grid Skeleton
export function BentoGridSkeleton() {
    return (
        <section className="py-20 sm:py-32 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16 sm:mb-24">
                    <Skeleton className="h-6 w-32 mx-auto mb-6 rounded-full" />
                    <Skeleton className="h-16 w-3/4 mx-auto mb-8" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 lg:gap-8 max-w-7xl mx-auto h-auto md:h-[900px]">
                    <div className="md:col-span-2 md:row-span-2 h-full">
                        <div className="h-full p-12 rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl">
                            <Skeleton className="h-16 w-16 rounded-2xl mb-8" />
                            <Skeleton className="h-12 w-2/3 mb-4" />
                            <Skeleton className="h-6 w-full mb-12" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32 rounded-xl" />
                                <Skeleton className="h-10 w-32 rounded-xl" />
                                <Skeleton className="h-10 w-32 rounded-xl" />
                            </div>
                            <div className="mt-16 h-80 w-full rounded-3xl bg-slate-100/50 dark:bg-[#0a0f1c]/50 flex items-center justify-center">
                                <Skeleton className="h-48 w-80 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                    <div className="h-full p-8 rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl">
                        <Skeleton className="h-14 w-14 rounded-xl mb-6" />
                        <Skeleton className="h-8 w-1/2 mb-3" />
                        <Skeleton className="h-4 w-full mb-8" />
                        <div className="flex justify-center gap-4 mt-8">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <Skeleton className="h-12 w-12 rounded-full" />
                        </div>
                    </div>
                    <div className="h-full p-8 rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl">
                        <Skeleton className="h-14 w-14 rounded-xl mb-6" />
                        <Skeleton className="h-8 w-1/2 mb-3" />
                        <Skeleton className="h-4 w-full mb-8" />
                        <div className="flex justify-center mt-6">
                            <Skeleton className="h-28 w-28 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Pricing Skeleton
export function PricingSkeleton() {
    return (
        <section className="py-20 sm:py-32 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16">
                    <Skeleton className="h-12 w-80 mx-auto mb-4" />
                    <Skeleton className="h-6 w-64 mx-auto" />
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                            <Skeleton className="h-6 w-24 mb-4" />
                            <Skeleton className="h-10 w-32 mb-6" />
                            <div className="space-y-4 mb-8">
                                {[...Array(5)].map((_, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
// Testimonials Skeleton
export function TestimonialsSkeleton() {
    return (
        <section className="py-20 bg-slate-50 dark:bg-white/5">
            <div className="container mx-auto px-6">
                <Skeleton className="h-10 w-64 mx-auto mb-12" />
                <div className="grid md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-4 mb-6">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// FAQ Skeleton
export function FAQSkeleton() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <Skeleton className="h-10 w-48 mx-auto mb-12" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
