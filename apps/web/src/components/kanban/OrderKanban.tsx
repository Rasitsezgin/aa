'use client';

import React, { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  platform: string;
  totalAmount: number;
  items: number;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  status: string;
  icon: React.ReactNode;
  color: string;
  orders: Order[];
}

interface OrderKanbanProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: string) => void;
  onOrderClick?: (order: Order) => void;
}

const defaultColumns: Omit<Column, 'orders'>[] = [
  {
    id: 'pending',
    title: 'Bekliyor',
    status: 'PENDING',
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-yellow-500',
  },
  {
    id: 'confirmed',
    title: 'Onaylandı',
    status: 'CONFIRMED',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'bg-blue-500',
  },
  {
    id: 'processing',
    title: 'Hazırlanıyor',
    status: 'PROCESSING',
    icon: <Package className="w-5 h-5" />,
    color: 'bg-purple-500',
  },
  {
    id: 'shipped',
    title: 'Kargoda',
    status: 'SHIPPED',
    icon: <Truck className="w-5 h-5" />,
    color: 'bg-indigo-500',
  },
  {
    id: 'delivered',
    title: 'Teslim Edildi',
    status: 'DELIVERED',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'bg-green-500',
  },
  {
    id: 'cancelled',
    title: 'İptal',
    status: 'CANCELLED',
    icon: <XCircle className="w-5 h-5" />,
    color: 'bg-red-500',
  },
];

function OrderCard({
  order,
  onClick,
  isDragging,
}: {
  order: Order;
  onClick?: () => void;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: order.id,
    data: { order },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const priorityColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-red-100 text-red-600',
  };

  const platformColors: Record<string, string> = {
    TRENDYOL: 'bg-orange-500',
    HEPSIBURADA: 'bg-red-600',
    AMAZON: 'bg-yellow-500',
    N11: 'bg-red-500',
    CICEKSEPETI: 'bg-pink-500',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={style}
      className={`p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              platformColors[order.platform] || 'bg-slate-400'
            }`}
          />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            #{order.orderNumber}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${priorityColors[order.priority]}`}
        >
          {order.priority === 'high' ? 'Yüksek' : order.priority === 'medium' ? 'Orta' : 'Düşük'}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{order.customerName}</p>

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          ₺{order.totalAmount.toLocaleString()}
        </div>
        <div className="text-xs text-slate-500">{order.items} ürün</div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
        <MoreHorizontal className="w-4 h-4" />
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  onOrderClick,
}: {
  column: Column;
  onOrderClick?: (order: Order) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: { column },
  });

  return (
    <div className="flex flex-col w-80 min-w-80">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg text-white ${column.color}`}>{column.icon}</div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{column.title}</h3>
            <p className="text-xs text-slate-500">{column.orders.length} sipariş</p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 rounded-2xl transition-colors min-h-[200px] ${
          isOver ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-slate-50 dark:bg-slate-900/50'
        }`}
      >
        {column.orders.map((order) => (
          <OrderCard key={order.id} order={order} onClick={() => onOrderClick?.(order)} />
        ))}
      </div>
    </div>
  );
}

export function OrderKanban({ orders, onStatusChange, onOrderClick }: OrderKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Group orders by status
  const columns = useMemo(() => {
    return defaultColumns.map((col) => ({
      ...col,
      orders: orders.filter((o) => o.status === col.status),
    }));
  }, [orders]);

  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id);
    setActiveOrder(event.active.data.current?.order || null);
  }, []);

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      
      if (!over) return;

      const newStatus = over.data.current?.column?.status;
      if (newStatus && active.id !== over.id) {
        onStatusChange(active.id as string, newStatus);
      }

      setActiveId(null);
      setActiveOrder(null);
    },
    [onStatusChange]
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} onOrderClick={onOrderClick} />
        ))}
      </div>

      <DragOverlay>
        {activeOrder ? <OrderCard order={activeOrder} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default OrderKanban;
