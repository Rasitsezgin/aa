'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

interface Product3D {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating?: number;
}

interface ProductCard3DProps {
  product: Product3D;
  onAddToCart?: (id: string) => void;
  onQuickView?: (id: string) => void;
}

export function ProductCard3D({ product, onAddToCart, onQuickView }: ProductCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-10, 10]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden glass-panel border border-white/10"
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Glare Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: useTransform(
              [x, y],
              ([latestX, latestY]) =>
                `radial-gradient(circle at ${(latestX as number) * 100}% ${(latestY as number) * 100}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            ),
          }}
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-full bg-primary text-white text-xs font-medium">
            {product.badge}
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="absolute top-3 right-3 z-20 flex flex-col gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            onClick={() => onQuickView?.(product.id)}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(20px)' }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Content */}
        <div className="p-4" style={{ transform: 'translateZ(30px)' }}>
          <h3 className="font-semibold text-white truncate">{product.name}</h3>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-primary">{product.price.toLocaleString('tr-TR')} ₺</span>
            {product.originalPrice && (
              <span className="text-sm text-white/40 line-through">
                {product.originalPrice.toLocaleString('tr-TR')} ₺
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            className="w-full mt-3 py-2.5 rounded-xl bg-primary text-white font-medium flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart?.(product.id)}
          >
            <ShoppingCart className="w-4 h-4" />
            Sepete Ekle
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Grid of 3D cards
export function ProductGrid3D({ products }: { products: Product3D[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProductCard3D product={product} />
        </motion.div>
      ))}
    </div>
  );
}
