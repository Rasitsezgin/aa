import { MARKETING_PAGE_BG } from '@/lib/marketing-theme';

export default function LandingLoading() {
  return (
    <div className={`min-h-screen flex items-center justify-center ${MARKETING_PAGE_BG}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-800" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-orange-600 animate-spin" />
        </div>
      </div>
    </div>
  );
}
