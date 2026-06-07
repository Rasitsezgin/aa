"use client";

import React from 'react';
import { Check, Link2, Linkedin, Twitter } from 'lucide-react';

type BlogShareButtonsProps = {
  title: string;
  url: string;
};

export default function BlogShareButtons({ title, url }: BlogShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);

  const share = (platform: 'twitter' | 'linkedin') => {
    const encoded = encodeURIComponent(url);
    const text = encodeURIComponent(title);
    const target = platform === 'twitter'
      ? `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
    window.open(target, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Paylaş</span>
      <button
        type="button"
        onClick={() => share('twitter')}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-orange-300 hover:text-orange-600 transition-colors"
      >
        <Twitter size={15} /> X
      </button>
      <button
        type="button"
        onClick={() => share('linkedin')}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-orange-300 hover:text-orange-600 transition-colors"
      >
        <Linkedin size={15} /> LinkedIn
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-orange-300 hover:text-orange-600 transition-colors"
      >
        {copied ? <Check size={15} className="text-emerald-500" /> : <Link2 size={15} />}
        {copied ? 'Kopyalandı' : 'Link'}
      </button>
    </div>
  );
}
