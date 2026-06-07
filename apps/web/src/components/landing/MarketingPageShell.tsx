import React from 'react';
import { MARKETING_PAGE_BG, MARKETING_PAGE_PT } from '@/lib/marketing-theme';

type ShellTag = 'main' | 'section' | 'article' | 'div';

type MarketingPageShellProps = {
  children: React.ReactNode;
  as?: ShellTag;
  className?: string;
  contentClassName?: string;
  withAmbient?: boolean;
  padded?: boolean;
};

export function MarketingAmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/40 via-transparent to-transparent dark:from-orange-950/20" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 85%)',
        }}
      />
      <div className="absolute top-20 right-0 w-[600px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-amber-400/8 rounded-full blur-[100px]" />
    </div>
  );
}

export default function MarketingPageShell({
  children,
  as: Tag = 'div',
  className = '',
  contentClassName = '',
  withAmbient = true,
  padded = true,
}: MarketingPageShellProps) {
  return (
    <Tag
      className={`min-h-screen relative overflow-x-hidden ${MARKETING_PAGE_BG} ${MARKETING_PAGE_PT} ${padded ? 'pb-20' : ''} ${className}`}
    >
      {withAmbient && <MarketingAmbientBackground />}
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </Tag>
  );
}
