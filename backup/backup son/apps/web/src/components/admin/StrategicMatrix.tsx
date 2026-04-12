'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MatrixNode {
    id: string;
    name: string;
    risk: number; // 0-100
    opportunity: number; // 0-100
    type: 'product' | 'category';
    status: 'critical' | 'warning' | 'optimal';
}

interface StrategicMatrixProps {
    nodes: MatrixNode[];
}

export const StrategicMatrix: React.FC<StrategicMatrixProps> = ({ nodes }) => {
    return (
        <div className="relative w-full h-[400px] border border-white/10 rounded-xl bg-black/40 backdrop-blur-md overflow-hidden p-8">
            {/* Background Grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-20 pointer-events-none">
                <div className="border-r border-b border-white/20 flex items-center justify-center">
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest -rotate-45">Risk Bölgesi</span>
                </div>
                <div className="border-b border-white/20 flex items-center justify-center opacity-40">
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Gözlem Alanı</span>
                </div>
                <div className="border-r border-white/20 flex items-center justify-center opacity-40">
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Stabil Alan</span>
                </div>
                <div className="flex items-center justify-center">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest rotate-45">Fırsat Alanı</span>
                </div>
            </div>

            {/* Axis Labels */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-white/40 font-medium tracking-tighter">
                HAREKETLİLİK (RİSK)
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-medium tracking-tighter uppercase font-bold">
                POTANSİYEL (FIRSAT)
            </div>

            {/* Nodes */}
            <div className="relative w-full h-full">
                {nodes.map((node) => (
                    <motion.div
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            left: `${node.opportunity}%`,
                            bottom: `${node.risk}%`
                        }}
                        whileHover={{ scale: 1.5, zIndex: 50 }}
                        className={`absolute w-3 h-3 rounded-full cursor-help shadow-lg shadow-current group -translate-x-1/2 translate-y-1/2
              ${node.status === 'critical' ? 'bg-red-500 shadow-red-500/50' :
                                node.status === 'warning' ? 'bg-yellow-500 shadow-yellow-500/50' :
                                    'bg-emerald-500 shadow-emerald-500/50'}`}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 hidden group-hover:block bg-black/90 border border-white/20 rounded p-2 text-white z-50">
                            <p className="text-[10px] font-bold truncate">{node.name}</p>
                            <div className="flex justify-between mt-1 text-[8px] opacity-70">
                                <span>R: %{node.risk}</span>
                                <span>F: %{node.opportunity}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Scanner Effect */}
            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none"
            />
        </div>
    );
};
