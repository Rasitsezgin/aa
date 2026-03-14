"use client";

import React, { useState } from 'react';
import { Sparkles, Cpu, Zap, Settings, BarChart3, Lock } from 'lucide-react';

export default function AIModelsPage() {
    const [activeModel, setActiveModel] = useState('gpt4');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">AI Model Yönetimi</h1>
                    <p className="text-slate-600 dark:text-slate-500 font-medium">Sistem genelinde kullanılan yapay zeka modellerini yapılandırın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Model Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'gpt4', name: 'GPT-4 Turbo', provider: 'OpenAI', cost: '$$$', speed: 'Hızlı', bestFor: 'Karmaşık metin üretimi & Kodlama' },
                            { id: 'claude3', name: 'Claude 3 Opus', provider: 'Anthropic', cost: '$$$', speed: 'Orta', bestFor: 'Uzun bağlam & Analiz' },
                            { id: 'gemini', name: 'Gemini 1.5 Pro', provider: 'Google', cost: '$$', speed: 'Çok Hızlı', bestFor: 'Çoklu modal & Büyük veri' }
                        ].map((model) => (
                            <div
                                key={model.id}
                                onClick={() => setActiveModel(model.id)}
                                className={`relative p-6 rounded-3xl border cursor-pointer transition-all duration-300 group ${activeModel === model.id
                                        ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/20'
                                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                {activeModel === model.id && (
                                    <div className="absolute top-4 right-4 text-white">
                                        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
                                    </div>
                                )}
                                <div className={`mb-4 p-3 rounded-2xl w-fit ${activeModel === model.id ? 'bg-white/10' : 'bg-blue-500/10'}`}>
                                    <Sparkles size={20} className={activeModel === model.id ? 'text-white' : 'text-blue-500 dark:text-blue-400'} />
                                </div>
                                <h3 className={`text-xl font-black mb-1 ${activeModel === model.id ? 'text-white' : 'text-foreground'}`}>{model.name}</h3>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${activeModel === model.id ? 'text-blue-200' : 'text-slate-500'}`}>{model.provider}</p>

                                <div className="space-y-2">
                                    <div className={`flex justify-between text-xs font-medium ${activeModel === model.id ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                        <span>Maliyet</span>
                                        <span>{model.cost}</span>
                                    </div>
                                    <div className={`flex justify-between text-xs font-medium ${activeModel === model.id ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                        <span>Hız</span>
                                        <span>{model.speed}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Usage Stats Graph Placeholder */}
                    <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 min-h-[300px] flex flex-col shadow-sm dark:shadow-none">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Token Kullanımı</h3>
                            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Detaylı Rapor →</button>
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4">
                            {[30, 45, 60, 40, 70, 85, 90, 65, 50, 75, 80, 95, 60, 70].map((h, i) => (
                                <div key={i} className="flex-1 bg-slate-200 dark:bg-white/5 rounded-t-lg hover:bg-blue-500/50 transition-colors" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Settings Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Settings size={18} /> Yapılandırma
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Max Token Limiti</label>
                                <input type="text" defaultValue="4096" className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Temperature</label>
                                <div className="relative">
                                    <input type="range" className="w-full accent-blue-500" />
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1">
                                        <span>Yaratıcı</span>
                                        <span>Dengeli</span>
                                        <span>Kesin</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Prompt Cache</span>
                                    <div className="w-10 h-6 bg-green-500 rounded-full p-1 cursor-pointer flex justify-end"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-500 font-medium leading-relaxed">Sık kullanılan promptları önbelleğe alarak yanıt süresini %40 hızlandırır.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-[32px] border border-white/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">API Güvenliği</h3>
                            <p className="text-sm text-blue-100 font-medium mb-6">Anahtarlarınız şifreli olarak saklanır ve asla istemci tarafına gönderilmez.</p>
                            <button className="w-full py-3 bg-white text-blue-900 rounded-xl font-black text-sm hover:scale-[1.02] transition-transform">
                                Anahtarları Yönet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
