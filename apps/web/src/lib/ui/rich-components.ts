// Rich UI Components Library
// Advanced interactive components for modern UX

import { useState, useEffect, useCallback, useRef } from 'react';

// ==================== CALENDAR / SCHEDULER ====================

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
  attendees?: string[];
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'none';
  editable?: boolean;
  deletable?: boolean;
}

interface CalendarView {
  type: 'day' | 'week' | 'month' | 'agenda';
  date: Date;
}

// Calendar utilities
export class CalendarUtils {
  static getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add previous month days to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add next month days to complete last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }

  static getWeekDays(date: Date): Date[] {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const days: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), diff + i));
    }
    
    return days;
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static formatTime(date: Date): string {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  static getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
    return events.filter(event => this.isSameDay(event.start, date));
  }

  static sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  }
}

// ==================== TIMELINE / GANTT ====================

interface TimelineItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress: number;
  color?: string;
  dependencies?: string[];
  subtasks?: TimelineItem[];
  expanded?: boolean;
}

export class TimelineUtils {
  static calculatePosition(
    item: TimelineItem,
    viewStart: Date,
    viewEnd: Date,
    totalWidth: number
  ): { left: number; width: number } {
    const totalDuration = viewEnd.getTime() - viewStart.getTime();
    const itemStart = item.start.getTime() - viewStart.getTime();
    const itemDuration = item.end.getTime() - item.start.getTime();

    const left = (itemStart / totalDuration) * totalWidth;
    const width = (itemDuration / totalDuration) * totalWidth;

    return { left: Math.max(0, left), width: Math.max(20, width) };
  }

  static detectOverlaps(items: TimelineItem[]): Map<string, string[]> {
    const overlaps = new Map<string, string[]>();

    items.forEach((item, i) => {
      const overlapping: string[] = [];
      
      items.forEach((other, j) => {
        if (i !== j) {
          const hasOverlap = item.start < other.end && item.end > other.start;
          if (hasOverlap) {
            overlapping.push(other.id);
          }
        }
      });

      if (overlapping.length > 0) {
        overlaps.set(item.id, overlapping);
      }
    });

    return overlaps;
  }

  static getCriticalPath(items: TimelineItem[]): string[] {
    // Simplified critical path calculation
    const sorted = [...items].sort((a, b) => a.end.getTime() - b.end.getTime());
    const critical: string[] = [];
    let currentEnd = new Date(0);

    sorted.forEach(item => {
      if (item.start >= currentEnd) {
        critical.push(item.id);
        currentEnd = item.end;
      }
    });

    return critical;
  }
}

// ==================== TREEVIEW ====================

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  icon?: string;
  data?: unknown;
}

export class TreeUtils {
  static flattenTree(
    nodes: TreeNode[],
    expandedIds: Set<string>,
    level: number = 0
  ): Array<{ node: TreeNode; level: number; hasChildren: boolean }> {
    const result: Array<{ node: TreeNode; level: number; hasChildren: boolean }> = [];

    nodes.forEach(node => {
      const hasChildren = node.children && node.children.length > 0;
      result.push({ node, level, hasChildren });

      if (hasChildren && expandedIds.has(node.id)) {
        result.push(...this.flattenTree(node.children!, expandedIds, level + 1));
      }
    });

    return result;
  }

  static findNode(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  static getParentPath(nodes: TreeNode[], id: string): string[] {
    const path: string[] = [];
    
    const find = (currentNodes: TreeNode[], targetId: string): boolean => {
      for (const node of currentNodes) {
        if (node.id === targetId) {
          return true;
        }
        if (node.children) {
          path.push(node.id);
          if (find(node.children, targetId)) {
            return true;
          }
          path.pop();
        }
      }
      return false;
    };

    find(nodes, id);
    return path;
  }

  static getAllIds(nodes: TreeNode[]): string[] {
    const ids: string[] = [];
    
    const collect = (currentNodes: TreeNode[]) => {
      currentNodes.forEach(node => {
        ids.push(node.id);
        if (node.children) {
          collect(node.children);
        }
      });
    };

    collect(nodes);
    return ids;
  }

  static moveNode(
    nodes: TreeNode[],
    nodeId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ): TreeNode[] {
    // Clone and modify tree
    const newNodes = JSON.parse(JSON.stringify(nodes));
    
    // Find and remove node
    let movedNode: TreeNode | null = null;
    
    const remove = (currentNodes: TreeNode[]): boolean => {
      const index = currentNodes.findIndex(n => n.id === nodeId);
      if (index > -1) {
        movedNode = currentNodes[index];
        currentNodes.splice(index, 1);
        return true;
      }
      for (const node of currentNodes) {
        if (node.children && remove(node.children)) {
          return true;
        }
      }
      return false;
    };

    remove(newNodes);

    if (!movedNode) return nodes;

    // Insert at new position
    const insert = (currentNodes: TreeNode[]): boolean => {
      const index = currentNodes.findIndex(n => n.id === targetId);
      
      if (index > -1) {
        if (position === 'before') {
          currentNodes.splice(index, 0, movedNode!);
        } else if (position === 'after') {
          currentNodes.splice(index + 1, 0, movedNode!);
        } else if (position === 'inside') {
          if (!currentNodes[index].children) {
            currentNodes[index].children = [];
          }
          currentNodes[index].children!.push(movedNode!);
        }
        return true;
      }

      for (const node of currentNodes) {
        if (node.children && insert(node.children)) {
          return true;
        }
      }
      return false;
    };

    insert(newNodes);
    return newNodes;
  }
}

// ==================== INFINITE SCROLL ====================

interface InfiniteScrollConfig {
  threshold?: number;
  pageSize?: number;
  totalItems?: number;
}

export class InfiniteScrollManager {
  private loading = false;
  private hasMore = true;
  private page = 1;
  private loadedItems: unknown[] = [];

  constructor(
    private loadMore: (page: number, pageSize: number) => Promise<unknown[]>,
    private config: InfiniteScrollConfig = {}
  ) {}

  async loadNext(): Promise<unknown[]> {
    if (this.loading || !this.hasMore) return this.loadedItems;

    this.loading = true;
    
    try {
      const items = await this.loadMore(
        this.page,
        this.config.pageSize || 20
      );

      if (items.length === 0) {
        this.hasMore = false;
      } else {
        this.loadedItems.push(...items);
        this.page++;

        // Check if we've loaded all items
        if (this.config.totalItems && this.loadedItems.length >= this.config.totalItems) {
          this.hasMore = false;
        }
      }

      return this.loadedItems;
    } finally {
      this.loading = false;
    }
  }

  reset(): void {
    this.page = 1;
    this.hasMore = true;
    this.loadedItems = [];
    this.loading = false;
  }

  isLoading(): boolean {
    return this.loading;
  }

  hasMoreItems(): boolean {
    return this.hasMore;
  }

  getLoadedItems(): unknown[] {
    return this.loadedItems;
  }
}

// ==================== AUTOCOMPLETE / SEARCH ====================

interface AutocompleteOption {
  id: string;
  label: string;
  value: unknown;
  group?: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

export class AutocompleteUtils {
  static filterOptions(
    options: AutocompleteOption[],
    query: string,
    maxResults: number = 10
  ): AutocompleteOption[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return options
      .filter(opt => 
        !opt.disabled && 
        opt.label.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        // Exact match first
        const aExact = a.label.toLowerCase() === normalizedQuery;
        const bExact = b.label.toLowerCase() === normalizedQuery;
        if (aExact && !bExact) return -1;
        if (bExact && !aExact) return 1;

        // Starts with query next
        const aStarts = a.label.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.label.toLowerCase().startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;

        // Alphabetical
        return a.label.localeCompare(b.label);
      })
      .slice(0, maxResults);
  }

  static highlightMatch(text: string, query: string): string {
    if (!query) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static groupOptions(options: AutocompleteOption[]): Map<string, AutocompleteOption[]> {
    const groups = new Map<string, AutocompleteOption[]>();
    
    options.forEach(opt => {
      const group = opt.group || 'Other';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(opt);
    });

    return groups;
  }
}

// ==================== COMMAND PALETTE ====================

interface Command {
  id: string;
  title: string;
  shortcut?: string;
  icon?: string;
  group: string;
  action: () => void;
  disabled?: boolean;
}

export class CommandPalette {
  private commands: Command[] = [];
  private recentCommands: string[] = [];
  private maxRecent = 5;

  register(command: Command): void {
    this.commands.push(command);
  }

  unregister(id: string): void {
    this.commands = this.commands.filter(c => c.id !== id);
  }

  search(query: string): Command[] {
    const normalized = query.toLowerCase();
    
    return this.commands
      .filter(cmd => !cmd.disabled)
      .filter(cmd => 
        cmd.title.toLowerCase().includes(normalized) ||
        cmd.group.toLowerCase().includes(normalized)
      )
      .sort((a, b) => {
        // Recent commands first
        const aRecent = this.recentCommands.indexOf(a.id);
        const bRecent = this.recentCommands.indexOf(b.id);
        
        if (aRecent > -1 && bRecent === -1) return -1;
        if (bRecent > -1 && aRecent === -1) return 1;
        if (aRecent > -1 && bRecent > -1) return aRecent - bRecent;

        return a.title.localeCompare(b.title);
      });
  }

  execute(id: string): void {
    const command = this.commands.find(c => c.id === id);
    if (command && !command.disabled) {
      // Add to recent
      this.recentCommands = [id, ...this.recentCommands.filter(c => c !== id)].slice(0, this.maxRecent);
      command.action();
    }
  }

  getRecent(): Command[] {
    return this.recentCommands
      .map(id => this.commands.find(c => c.id === id))
      .filter((c): c is Command => c !== undefined && !c.disabled);
  }

  getByGroup(): Map<string, Command[]> {
    const groups = new Map<string, Command[]>();
    
    this.commands
      .filter(c => !c.disabled)
      .forEach(cmd => {
        if (!groups.has(cmd.group)) {
          groups.set(cmd.group, []);
        }
        groups.get(cmd.group)!.push(cmd);
      });

    return groups;
  }
}

// ==================== TOAST NOTIFICATIONS ====================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  show(toast: Omit<Toast, 'id'>): string {
    const id = crypto.randomUUID();
    const newToast: Toast = { ...toast, id };
    
    this.toasts.push(newToast);
    this.notifyListeners();

    // Auto dismiss
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, toast.duration || 5000);
      this.timers.set(id, timer);
    }

    return id;
  }

  success(title: string, message?: string): string {
    return this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string): string {
    return this.show({ type: 'error', title, message, duration: 0 });
  }

  warning(title: string, message?: string): string {
    return this.show({ type: 'warning', title, message });
  }

  info(title: string, message?: string): string {
    return this.show({ type: 'info', title, message });
  }

  dismiss(id: string): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
      
      // Clear timer
      const timer = this.timers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(id);
      }
      
      this.notifyListeners();
    }
  }

  dismissAll(): void {
    this.toasts = [];
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.notifyListeners();
  }

  subscribe(callback: (toasts: Toast[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb([...this.toasts]));
  }
}

// Export singleton
export const toast = new ToastManager();

export { CalendarEvent, CalendarView, TimelineItem, TreeNode, Command, Toast };
