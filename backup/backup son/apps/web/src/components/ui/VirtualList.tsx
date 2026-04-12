'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerHeight?: number | string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
  containerHeight = '100vh',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightValue, setContainerHeightValue] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeightValue(containerRef.current.clientHeight);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeightValue / itemHeight) + overscan * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <motion.div
              key={startIndex + index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Optimized product list wrapper
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

export function VirtualProductList({ products }: { products: Product[] }) {
  return (
    <VirtualList
      items={products}
      itemHeight={80}
      containerHeight="calc(100vh - 200px)"
      className="rounded-xl"
      renderItem={(product) => (
        <div className="glass-panel border-b border-white/5 px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-xs text-white/40">No IMG</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{product.name}</p>
            <p className="text-xs text-white/50">{product.price.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            product.stock > 10 ? 'bg-emerald-500/20 text-emerald-400' :
            product.stock > 0 ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          )}>
            {product.stock} adet
          </div>
        </div>
      )}
    />
  );
}
