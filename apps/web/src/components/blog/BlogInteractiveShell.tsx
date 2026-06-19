"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Headphones, Play, Pause, Square, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  content: string;
  sidebar?: React.ReactNode;
}

export default function BlogInteractiveShell({ children, content, sidebar }: Props) {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Clean Markdown syntax to make text-to-speech sound natural
  const getCleanText = () => {
    return content
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
      .replace(/[#*`_~>]/g, '') // Remove markdown symbols
      .replace(/-/g, ' ') // Replace dashes
      .trim();
  };

  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Tarayıcınız seslendirme özelliğini desteklemiyor.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    
    const cleanText = getCleanText();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  useEffect(() => {
    // Cleanup speech synthesis on unmount
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className={`transition-all duration-1000 ease-in-out ${isReadingMode ? 'bg-slate-50/50 dark:bg-slate-950 rounded-3xl p-4 sm:p-10 -mx-4 sm:-mx-10 shadow-2xl' : ''}`}>
      
      {/* Interactive Toolbar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-sm transition-all duration-500 ${isReadingMode ? 'sticky top-4 z-50 shadow-lg' : ''}`}>
        
        {/* Audio Player */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            {isPlaying ? (
               <Volume2 size={18} className="animate-pulse" />
            ) : (
               <Headphones size={18} />
            )}
          </div>
          <div className="flex-1">
             <div className="text-sm font-bold text-slate-900 dark:text-white">Yapay Zeka Seslendirme</div>
             <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Makaleyi dinleyin</div>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
            {!isPlaying ? (
              <button onClick={handlePlay} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Play size={16} fill="currentColor" />
              </button>
            ) : (
              <button onClick={handlePause} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm text-indigo-600 dark:text-indigo-400">
                <Pause size={16} fill="currentColor" />
              </button>
            )}
            <button onClick={handleStop} disabled={!isPlaying && !isPaused} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-red-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400">
              <Square size={16} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Reading Mode Toggle */}
        <button 
          onClick={() => setIsReadingMode(!isReadingMode)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto rounded-xl text-sm font-bold transition-all duration-300 ${isReadingMode ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/20 scale-105' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-105'}`}
        >
          <BookOpen size={18} />
          {isReadingMode ? 'Okuma Modunu Kapat' : 'Okuma Modunu Aç'}
        </button>
      </div>

      {/* Content Layout */}
      <div className={`grid grid-cols-1 transition-all duration-700 ${!isReadingMode && sidebar ? 'lg:grid-cols-[minmax(0,1fr)_280px] gap-10 lg:gap-14' : 'max-w-4xl mx-auto'}`}>
        <div className="min-w-0 transition-all duration-700">
          {children}
        </div>
        
        {/* Sidebar (Table of Contents) - Hides in reading mode */}
        <AnimatePresence>
          {!isReadingMode && sidebar && (
            <motion.aside 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="hidden lg:block overflow-hidden"
            >
              {sidebar}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
