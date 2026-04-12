'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

interface AnimatedAreaChartProps {
  data: { name: string; value: number; value2?: number }[];
  colors?: string[];
}

export function AnimatedAreaChart({ data, colors = ['#3b82f6', '#8b5cf6'] }: AnimatedAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[1]} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={colors[1]} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(2, 2, 4, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'white' }}
          itemStyle={{ color: 'white' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={colors[0]}
          fillOpacity={1}
          fill="url(#colorValue1)"
          animationDuration={1500}
        />
        {data[0]?.value2 !== undefined && (
          <Area
            type="monotone"
            dataKey="value2"
            stroke={colors[1]}
            fillOpacity={1}
            fill="url(#colorValue2)"
            animationDuration={1500}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface AnimatedBarChartProps {
  data: { name: string; value: number }[];
}

export function AnimatedBarChart({ data }: AnimatedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{
            backgroundColor: 'rgba(2, 2, 4, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'white' }}
          itemStyle={{ color: 'white' }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1500}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface AnimatedPieChartProps {
  data: { name: string; value: number }[];
}

export function AnimatedPieChart({ data }: AnimatedPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          animationDuration={1500}
          animationBegin={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(2, 2, 4, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'white' }}
          itemStyle={{ color: 'white' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface AnimatedRadarChartProps {
  data: { subject: string; A: number; B?: number; fullMark: number }[];
}

export function AnimatedRadarChart({ data }: AnimatedRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
        <Radar
          name="A"
          dataKey="A"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
          animationDuration={1500}
        />
        {data[0]?.B !== undefined && (
          <Radar
            name="B"
            dataKey="B"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
            animationDuration={1500}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(2, 2, 4, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'white' }}
          itemStyle={{ color: 'white' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Stat Card with mini chart
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  data: number[];
  color?: string;
}

export function StatCardWithSparkline({ title, value, change, data, color = '#3b82f6' }: StatCardProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <motion.div
      className="glass-panel rounded-xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm text-white/60">{title}</p>
      <div className="flex items-end justify-between mt-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {change !== undefined && (
          <span className={`text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      
      {/* Sparkline */}
      <svg className="w-full h-12 mt-3" viewBox={`0 0 ${data.length - 1} 50`} preserveAspectRatio="none">
        <motion.path
          d={`M0,${50 - ((data[0] - min) / range) * 50} ${data
            .slice(1)
            .map((d, i) => `L${i + 1},${50 - ((d - min) / range) * 50}`)
            .join(' ')}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <motion.path
          d={`M0,${50 - ((data[0] - min) / range) * 50} ${data
            .slice(1)
            .map((d, i) => `L${i + 1},${50 - ((d - min) / range) * 50}`)
            .join(' ')} L${data.length - 1},50 L0,50 Z`}
          fill={color}
          fillOpacity="0.1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
      </svg>
    </motion.div>
  );
}
