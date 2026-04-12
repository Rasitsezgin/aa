export default function GlobalLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#02040a]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                    Yükleniyor...
                </p>
            </div>
        </div>
    );
}
