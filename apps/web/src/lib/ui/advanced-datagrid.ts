// Advanced DataGrid Component Utilities
// High-performance data table with virtualization and advanced features

interface DataGridColumn {
  field: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'badge' | 'actions';
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  frozen?: 'left' | 'right';
  hidden?: boolean;
  formatter?: (value: unknown, row: unknown) => string;
  validator?: (value: unknown, row: unknown) => boolean | string;
}

interface DataGridConfig {
  columns: DataGridColumn[];
  rowHeight?: number;
  headerHeight?: number;
  virtualScroll?: boolean;
  pageSize?: number;
  selectionMode?: 'none' | 'single' | 'multiple';
  enableGrouping?: boolean;
  enablePivoting?: boolean;
  enableAggregation?: boolean;
  enableTreeView?: boolean;
  enableDetailView?: boolean;
  enableInlineEdit?: boolean;
  enableRowReorder?: boolean;
  enableColumnReorder?: boolean;
  enableColumnResize?: boolean;
  enableContextMenu?: boolean;
  enableKeyboardNav?: boolean;
}

interface DataGridState {
  rows: unknown[];
  totalCount: number;
  page: number;
  pageSize: number;
  sort: Array<{ field: string; direction: 'asc' | 'desc' }>;
  filters: Record<string, unknown>;
  selectedRows: Set<string>;
  expandedRows: Set<string>;
  groupBy?: string[];
  aggregatedData?: Record<string, unknown>;
}

// Virtual scrolling calculator
export class VirtualScrollCalculator {
  private rowHeight: number;
  private viewportHeight: number;
  private overscan: number;

  constructor(rowHeight: number, viewportHeight: number, overscan: number = 5) {
    this.rowHeight = rowHeight;
    this.viewportHeight = viewportHeight;
    this.overscan = overscan;
  }

  getVisibleRange(scrollTop: number, totalRows: number): {
    startIndex: number;
    endIndex: number;
    virtualHeight: number;
    offsetY: number;
  } {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.overscan);
    const visibleCount = Math.ceil(this.viewportHeight / this.rowHeight);
    const endIndex = Math.min(totalRows, startIndex + visibleCount + this.overscan * 2);
    
    return {
      startIndex,
      endIndex,
      virtualHeight: totalRows * this.rowHeight,
      offsetY: startIndex * this.rowHeight,
    };
  }
}

// Column grouping and aggregation
export class DataGridAggregator {
  groupBy<T>(
    data: T[],
    fields: string[],
    aggregations: Array<{ field: string; type: 'sum' | 'avg' | 'count' | 'min' | 'max' }>
  ): Array<{ groupKey: string; items: T[]; aggregates: Record<string, number> }> {
    const groups = new Map<string, T[]>();

    // Group data
    data.forEach(item => {
      const key = fields.map(f => this.getValue(item, f)).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // Calculate aggregations
    return Array.from(groups.entries()).map(([groupKey, items]) => {
      const aggregates: Record<string, number> = {};
      
      aggregations.forEach(agg => {
        const values = items.map(item => Number(this.getValue(item, agg.field)) || 0);
        
        switch (agg.type) {
          case 'sum':
            aggregates[agg.field] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregates[agg.field] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'count':
            aggregates[agg.field] = values.length;
            break;
          case 'min':
            aggregates[agg.field] = Math.min(...values);
            break;
          case 'max':
            aggregates[agg.field] = Math.max(...values);
            break;
        }
      });

      return { groupKey, items, aggregates };
    });
  }

  private getValue(obj: any, path: string): unknown {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
}

// Export grid data
export async function exportGridData(
  rows: unknown[],
  columns: DataGridColumn[],
  format: 'csv' | 'excel' | 'pdf'
): Promise<Blob> {
  switch (format) {
    case 'csv':
      return exportToCSV(rows, columns);
    case 'excel':
      return exportToExcel(rows, columns);
    case 'pdf':
      return exportToPDF(rows, columns);
    default:
      throw new Error('Unsupported format');
  }
}

async function exportToCSV(rows: unknown[], columns: DataGridColumn[]): Promise<Blob> {
  const headers = columns.map(c => c.header).join(',');
  const data = rows.map(row => 
    columns.map(col => {
      const value = (row as any)[col.field];
      const formatted = col.formatter ? col.formatter(value, row) : String(value ?? '');
      // Escape CSV
      if (formatted.includes(',') || formatted.includes('\n') || formatted.includes('"')) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted;
    }).join(',')
  ).join('\n');

  const csv = `${headers}\n${data}`;
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

async function exportToExcel(rows: unknown[], columns: DataGridColumn[]): Promise<Blob> {
  // Would use xlsx library
  return new Blob([], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function exportToPDF(rows: unknown[], columns: DataGridColumn[]): Promise<Blob> {
  // Would use pdf generation library
  return new Blob([], { type: 'application/pdf' });
}

// Keyboard navigation handler
export class GridKeyboardNav {
  private focusedRow: number = 0;
  private focusedCol: number = 0;
  private rows: number;
  private cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
  }

  handleKeyDown(event: KeyboardEvent): {
    row: number;
    col: number;
    action?: 'edit' | 'select' | 'expand' | 'collapse';
  } | null {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedRow = Math.min(this.rows - 1, this.focusedRow + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedRow = Math.max(0, this.focusedRow - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusedCol = Math.min(this.cols - 1, this.focusedCol + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusedCol = Math.max(0, this.focusedCol - 1);
        break;
      case 'Enter':
        return { row: this.focusedRow, col: this.focusedCol, action: 'edit' };
      case ' ': // Space
        event.preventDefault();
        return { row: this.focusedRow, col: this.focusedCol, action: 'select' };
      case 'Home':
        event.preventDefault();
        this.focusedCol = 0;
        break;
      case 'End':
        event.preventDefault();
        this.focusedCol = this.cols - 1;
        break;
      case 'PageDown':
        event.preventDefault();
        this.focusedRow = Math.min(this.rows - 1, this.focusedRow + 10);
        break;
      case 'PageUp':
        event.preventDefault();
        this.focusedRow = Math.max(0, this.focusedRow - 10);
        break;
      default:
        return null;
    }

    return { row: this.focusedRow, col: this.focusedCol };
  }
}

// Row selection manager
export class RowSelectionManager {
  private selectedRows: Set<string> = new Set();
  private selectionMode: 'none' | 'single' | 'multiple';

  constructor(mode: 'none' | 'single' | 'multiple' = 'multiple') {
    this.selectionMode = mode;
  }

  toggleRow(id: string): Set<string> {
    if (this.selectionMode === 'none') return this.selectedRows;
    
    if (this.selectionMode === 'single') {
      this.selectedRows.clear();
      this.selectedRows.add(id);
    } else {
      if (this.selectedRows.has(id)) {
        this.selectedRows.delete(id);
      } else {
        this.selectedRows.add(id);
      }
    }
    
    return new Set(this.selectedRows);
  }

  selectRange(ids: string[]): Set<string> {
    if (this.selectionMode !== 'multiple') return this.selectedRows;
    
    ids.forEach(id => this.selectedRows.add(id));
    return new Set(this.selectedRows);
  }

  clear(): Set<string> {
    this.selectedRows.clear();
    return new Set();
  }

  selectAll(ids: string[]): Set<string> {
    if (this.selectionMode === 'none') return this.selectedRows;
    
    ids.forEach(id => this.selectedRows.add(id));
    return new Set(this.selectedRows);
  }

  getSelected(): string[] {
    return Array.from(this.selectedRows);
  }
}

// Column state manager (widths, order, visibility)
export class ColumnStateManager {
  private columnState: Map<string, {
    width?: number;
    order: number;
    visible: boolean;
  }> = new Map();

  init(columns: DataGridColumn[]): void {
    columns.forEach((col, index) => {
      this.columnState.set(col.field, {
        width: col.width,
        order: index,
        visible: !col.hidden,
      });
    });
  }

  resizeColumn(field: string, width: number): void {
    const state = this.columnState.get(field);
    if (state) {
      state.width = width;
    }
  }

  reorderColumns(newOrder: string[]): void {
    newOrder.forEach((field, index) => {
      const state = this.columnState.get(field);
      if (state) {
        state.order = index;
      }
    });
  }

  toggleVisibility(field: string): void {
    const state = this.columnState.get(field);
    if (state) {
      state.visible = !state.visible;
    }
  }

  getOrderedColumns(): string[] {
    return Array.from(this.columnState.entries())
      .filter(([, state]) => state.visible)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([field]) => field);
  }

  saveState(): string {
    return JSON.stringify(Object.fromEntries(this.columnState));
  }

  loadState(saved: string): void {
    const parsed = JSON.parse(saved);
    this.columnState = new Map(Object.entries(parsed));
  }
}

// Tree data handler
export class TreeDataHandler<T> {
  private flattenCache: Map<string, { item: T; level: number; hasChildren: boolean }> = new Map();

  flatten(
    data: T[],
    getId: (item: T) => string,
    getChildren: (item: T) => T[] | undefined,
    expandedIds: Set<string>,
    level: number = 0
  ): Array<{ item: T; level: number; hasChildren: boolean }> {
    const result: Array<{ item: T; level: number; hasChildren: boolean }> = [];

    data.forEach(item => {
      const id = getId(item);
      const children = getChildren(item);
      const hasChildren = children && children.length > 0;

      result.push({ item, level, hasChildren });

      if (hasChildren && expandedIds.has(id)) {
        result.push(...this.flatten(children!, getId, getChildren, expandedIds, level + 1));
      }
    });

    return result;
  }
}

export { DataGridColumn, DataGridConfig, DataGridState };
