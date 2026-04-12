export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-[#0B1121] flex">
            {/* Sidebar skeleton */}
            <div className="hidden md:flex w-64 flex-col bg-[#0B1121] border-r border-white/5 p-4 gap-4">
                <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
                <div className="mt-6 space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
                        <div className="h-4 w-72 bg-slate-800/60 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-10 w-10 bg-slate-800 rounded-full animate-pulse" />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-800/50 rounded-2xl animate-pulse border border-white/5" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                </div>

                {/* Chart area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 h-72 bg-slate-800/50 rounded-2xl animate-pulse border border-white/5" />
                    <div className="h-72 bg-slate-800/50 rounded-2xl animate-pulse border border-white/5" />
                </div>

                {/* Table area */}
                <div className="h-64 bg-slate-800/50 rounded-2xl animate-pulse border border-white/5" />
            </div>
        </div>
    );
}
