/** Shared marketing / landing page design tokens (blog + entegrasyonlar reference). */

export const MARKETING_PAGE_BG = 'bg-[#FAFAF9] dark:bg-[#0B1120]';
export const MARKETING_PAGE_PT = 'pt-[calc(5.25rem+env(safe-area-inset-top,0px))]';
export const MARKETING_PAGE_SHELL = `min-h-screen relative overflow-x-hidden ${MARKETING_PAGE_BG} ${MARKETING_PAGE_PT}`;

export const MARKETING_CARD =
  'rounded-[1.75rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm';

export const MARKETING_CARD_HOVER =
  `${MARKETING_CARD} hover:border-orange-300/60 dark:hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10 transition-all`;

export const MARKETING_HERO_BADGE =
  'inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/80 dark:bg-white/5 text-orange-700 dark:text-orange-300 text-[11px] sm:text-xs font-bold border border-orange-200/60 dark:border-orange-500/20 shadow-sm backdrop-blur-sm';

export const MARKETING_GRADIENT_TEXT =
  'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500';

export const FORUM_PANEL =
  'bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm';
