'use client';

import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { GripVertical, Plus, X } from 'lucide-react';

interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  initialColumns?: KanbanColumn[];
  onColumnUpdate?: (columns: KanbanColumn[]) => void;
}

const defaultColumns: KanbanColumn[] = [
  {
    id: 'pending',
    title: 'Beklemede',
    color: '#f59e0b',
    items: [
      { id: '1', title: 'Sipariş #1234', description: 'Yeni müşteri siparişi', priority: 'high' },
      { id: '2', title: 'Sipariş #1235', description: 'Toplu alım', priority: 'medium' },
    ],
  },
  {
    id: 'processing',
    title: 'İşleniyor',
    color: '#3b82f6',
    items: [
      { id: '3', title: 'Sipariş #1230', description: 'Hazırlanıyor', priority: 'high' },
    ],
  },
  {
    id: 'shipped',
    title: 'Kargoda',
    color: '#8b5cf6',
    items: [
      { id: '4', title: 'Sipariş #1225', description: 'Yolda', priority: 'low' },
    ],
  },
  {
    id: 'delivered',
    title: 'Teslim Edildi',
    color: '#10b981',
    items: [
      { id: '5', title: 'Sipariş #1220', description: 'Müşteri memnun', priority: 'medium' },
    ],
  },
];

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
};

export function KanbanBoard({ initialColumns = defaultColumns, onColumnUpdate }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleDragEnd = (columnId: string, newItems: KanbanItem[]) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, items: newItems } : col
    );
    setColumns(updatedColumns);
    onColumnUpdate?.(updatedColumns);
  };

  const moveItem = (itemId: string, fromColumnId: string, toColumnId: string) => {
    if (fromColumnId === toColumnId) return;

    const updatedColumns = columns.map((col) => {
      if (col.id === fromColumnId) {
        return { ...col, items: col.items.filter((item) => item.id !== itemId) };
      }
      if (col.id === toColumnId) {
        const item = columns.find((c) => c.id === fromColumnId)?.items.find((i) => i.id === itemId);
        if (item) return { ...col, items: [...col.items, item] };
      }
      return col;
    });

    setColumns(updatedColumns);
    onColumnUpdate?.(updatedColumns);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {columns.map((column) => (
        <motion.div
          key={column.id}
          className="flex-shrink-0 w-80 glass-panel rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Column Header */}
          <div
            className="p-4 border-b border-white/10 flex items-center justify-between"
            style={{ borderLeft: `4px solid ${column.color}` }}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{column.title}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">
                {column.items.length}
              </span>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            className="p-3 min-h-[200px] space-y-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const itemId = e.dataTransfer.getData('itemId');
              const fromColumnId = e.dataTransfer.getData('columnId');
              moveItem(itemId, fromColumnId, column.id);
            }}
          >
            <Reorder.Group
              axis="y"
              values={column.items}
              onReorder={(newItems) => handleDragEnd(column.id, newItems)}
              className="space-y-2"
            >
              <AnimatePresence>
                {column.items.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    dragListener={false}
                    className="relative"
                  >
                    <motion.div
                      layout
                      draggable
                      onDragStart={(e: any) => {
                        e.dataTransfer?.setData('itemId', item.id);
                        e.dataTransfer?.setData('columnId', column.id);
                        setActiveItem(item.id);
                      }}
                      onDragEnd={() => setActiveItem(null)}
                      className={`p-3 rounded-xl bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors ${
                        activeItem === item.id ? 'opacity-50' : ''
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {item.priority && (
                              <span className={`px-1.5 py-0.5 rounded text-xs ${priorityColors[item.priority]}`}>
                                {item.priority === 'high' ? 'Yüksek' : item.priority === 'medium' ? 'Orta' : 'Düşük'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>

            {/* Add Item Button */}
            <motion.button
              className="w-full py-2 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white/60 hover:border-white/30 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Yeni Ekle</span>
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
