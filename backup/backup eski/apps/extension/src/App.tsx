import { LayoutDashboard, Zap, ExternalLink, Settings, History } from 'lucide-react'
import './App.css'

function App() {
  return (
    <div className="w-80 bg-white dark:bg-slate-900 min-h-[400px] flex flex-col font-sans">
      {/* Header */}
      <div className="p-6 bg-orange-600 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} />
            <span className="font-black text-sm uppercase tracking-wider">Asistan Panel</span>
          </div>
          <button className="p-1.5 hover:bg-orange-500 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
        </div>
        <h1 className="text-xl font-black">Pazaryönetimi.com</h1>
      </div>

      {/* Quick Actions */}
      <div className="p-6 space-y-6 flex-1">
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hızlı Erişim</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all gap-2 group">
              <Zap size={24} className="text-slate-500 group-hover:text-orange-500" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Canlı Analiz</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all gap-2 group">
              <History size={24} className="text-slate-500 group-hover:text-orange-500" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Geçmiş Sorular</span>
            </button>
          </div>
        </div>

        <div className="p-5 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase">Durum</span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black rounded-full border border-green-500/20">BAĞLI</span>
          </div>
          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
            Platform verileriyle senkronize durumdasınız. Marketplace sayfalarında asistan butonu aktif.
          </p>
        </div>

        <button
          onClick={() => window.open('http://localhost:3000/dashboard', '_blank')}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black shadow-xl hover:scale-[1.02] transition-all"
        >
          <ExternalLink size={16} /> Dashboard'u Aç
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-400">v1.0.0 • AI-Native Marketplace Suite</span>
      </div>
    </div>
  )
}

export default App
