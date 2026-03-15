'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface HeatmapData {
  date: string;
  value: number;
}

interface HeatmapCalendarProps {
  data: HeatmapData[];
  year?: number;
  title?: string;
}

const getIntensity = (value: number, max: number): number => {
  if (value === 0) return 0;
  const ratio = value / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
};

const colors = {
  0: 'bg-transparent border-white/5',
  1: 'bg-emerald-500/20 border-emerald-500/30',
  2: 'bg-emerald-500/40 border-emerald-500/50',
  3: 'bg-emerald-500/60 border-emerald-500/70',
  4: 'bg-emerald-500/80 border-emerald-500',
};

export function HeatmapCalendar({ data, year = new Date().getFullYear(), title }: HeatmapCalendarProps) {
  const { days, months, maxValue } = useMemo(() => {
    const days: { date: Date; value: number; dayOfWeek: number; week: number }[] = [];
    const months: string[] = [];
    
    const startDate = new Date(year, 0, 1);
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(year, 11, 31);
    const dataMap = new Map(data.map(d => [d.date, d.value]));
    
    let currentDate = new Date(firstSunday);
    let week = 0;
    
    while (currentDate <= endDate || currentDate.getDay() !== 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const value = dataMap.get(dateStr) || 0;
      const dayOfWeek = currentDate.getDay();
      
      if (dayOfWeek === 0 && days.length > 0) week++;
      
      days.push({
        date: new Date(currentDate),
        value,
        dayOfWeek,
        week,
      });
      
      if (currentDate.getDate() === 15) {
        months.push(currentDate.toLocaleString('tr-TR', { month: 'short' }));
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return { days, months, maxValue };
  }, [data, year]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6"
    >
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 text-xs text-white/50 w-8">
              <span>Pzt</span>
              <span>Sal</span>
              <span>Çar</span>
              <span>Per</span>
              <span>Cum</span>
              <span>Cmt</span>
              <span>Paz</span>
            </div>
            
            <div className="flex-1">
              <div className="flex gap-1 mb-2">
                {months.map((month, i) => (
                  <span key={i} className="text-xs text-white/50 w-[52px]">{month}</span>
                ))}
              </div>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.max(...days.map(d => d.week)) + 1 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const day = days.find(d => d.week === weekIndex && d.dayOfWeek === dayIndex);
                      if (!day || day.date.getFullYear() !== year) {
                        return <div key={dayIndex} className="w-3 h-3" />;
                      }
                      
                      const intensity = getIntensity(day.value, maxValue);
                      const dateStr = day.date.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                      });
                      
                      return (
                        <motion.div
                          key={dayIndex}
                          className={`w-3 h-3 rounded-sm border ${colors[intensity as keyof typeof colors]} cursor-pointer transition-all hover:scale-125`}
                          title={`${dateStr}: ${day.value} aktivite`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: weekIndex * 0.002 + dayIndex * 0.01 }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-xs text-white/50 justify-end">
            <span>Az</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm border ${colors[level as keyof typeof colors]}`} />
            ))}
            <span>Çok</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
