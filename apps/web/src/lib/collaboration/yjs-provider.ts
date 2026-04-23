// Real-time Collaboration using Yjs
// For multi-user editing of products, orders, and notes

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Awareness } from 'y-protocols/awareness';

interface CollaborationConfig {
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  wsUrl: string;
}

interface UserAwareness {
  userId: string;
  userName: string;
  userColor: string;
  cursor?: {
    x: number;
    y: number;
  };
  selection?: string;
  lastActive: number;
}

class CollaborationProvider {
  private doc: Y.Doc;
  private provider: WebsocketProvider | null = null;
  private awareness: Awareness | null = null;
  private config: CollaborationConfig;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(config: CollaborationConfig) {
    this.config = config;
    this.doc = new Y.Doc();
    this.setupProvider();
  }

  private setupProvider(): void {
    this.provider = new WebsocketProvider(
      this.config.wsUrl,
      this.config.roomId,
      this.doc,
      { connect: false }
    );

    this.awareness = this.provider.awareness;

    // Set local user state
    this.awareness.setLocalStateField('user', {
      userId: this.config.userId,
      userName: this.config.userName,
      userColor: this.config.userColor,
      lastActive: Date.now(),
    });

    // Listen for awareness changes
    this.awareness.on('change', () => {
      const users = this.getActiveUsers();
      this.emit('users', users);
    });

    // Connect
    this.provider.connect();
  }

  // Get shared text
  getText(name: string): Y.Text {
    return this.doc.getText(name);
  }

  // Get shared array
  getArray<T>(name: string): Y.Array<T> {
    return this.doc.getArray<T>(name);
  }

  // Get shared map
  getMap<T>(name: string): Y.Map<T> {
    return this.doc.getMap<T>(name);
  }

  // Update cursor position
  updateCursor(x: number, y: number): void {
    if (!this.awareness) return;
    
    this.awareness.setLocalStateField('cursor', { x, y });
    this.awareness.setLocalStateField('lastActive', Date.now());
  }

  // Update selection
  updateSelection(selection: string): void {
    if (!this.awareness) return;
    
    this.awareness.setLocalStateField('selection', selection);
  }

  // Get active users
  getActiveUsers(): UserAwareness[] {
    if (!this.awareness) return [];

    const users: UserAwareness[] = [];
    const now = Date.now();
    const timeout = 30000; // 30 seconds

    this.awareness.getStates().forEach((state: any, clientId: number) => {
      if (state.user && clientId !== this.awareness!.clientID) {
        const lastActive = state.lastActive || 0;
        if (now - lastActive < timeout) {
          users.push({
            userId: state.user.userId,
            userName: state.user.userName,
            userColor: state.user.userColor,
            cursor: state.cursor,
            selection: state.selection,
            lastActive,
          });
        }
      }
    });

    return users;
  }

  // Subscribe to events
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  // Unsubscribe from events
  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  // Emit events
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in collaboration event handler:', error);
      }
    });
  }

  // Disconnect
  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
    this.awareness = null;
  }

  // Sync state
  sync(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.provider) {
        resolve();
        return;
      }

      if (this.provider.synced) {
        resolve();
      } else {
        this.provider.once('sync', resolve);
      }
    });
  }
}

// Product collaboration manager
export class ProductCollaboration {
  private provider: CollaborationProvider;
  private productMap: Y.Map<any>;

  constructor(config: CollaborationConfig) {
    this.provider = new CollaborationProvider(config);
    this.productMap = this.provider.getMap('products');
  }

  // Start editing product
  startEditing(productId: string, userId: string): void {
    const currentEditors = this.productMap.get(productId) || [];
    if (!currentEditors.includes(userId)) {
      this.productMap.set(productId, [...currentEditors, userId]);
    }
  }

  // Stop editing product
  stopEditing(productId: string, userId: string): void {
    const currentEditors = this.productMap.get(productId) || [];
    this.productMap.set(
      productId,
      currentEditors.filter((id: string) => id !== userId)
    );
  }

  // Get editors for product
  getEditors(productId: string): string[] {
    return this.productMap.get(productId) || [];
  }

  // Subscribe to editor changes
  onEditorChange(callback: (productId: string, editors: string[]) => void): void {
    this.productMap.observe(() => {
      this.productMap.forEach((editors, productId) => {
        callback(productId as string, editors || []);
      });
    });
  }

  disconnect(): void {
    this.provider.disconnect();
  }
}

// Shared notes/annotations
export class SharedNotes {
  private provider: CollaborationProvider;
  private notes: Y.Array<any>;

  constructor(config: CollaborationConfig) {
    this.provider = new CollaborationProvider({
      ...config,
      roomId: `notes-${config.roomId}`,
    });
    this.notes = this.provider.getArray('notes');
  }

  // Add note
  addNote(content: string, x: number, y: number, userId: string): string {
    const note = {
      id: crypto.randomUUID(),
      content,
      x,
      y,
      userId,
      createdAt: Date.now(),
      resolved: false,
    };
    this.notes.push([note]);
    return note.id;
  }

  // Update note
  updateNote(noteId: string, updates: Partial<any>): void {
    const index = this.notes.toArray().findIndex((n) => n.id === noteId);
    if (index >= 0) {
      const note = this.notes.get(index);
      Object.assign(note, updates, { updatedAt: Date.now() });
      this.notes.delete(index, 1);
      this.notes.insert(index, [note]);
    }
  }

  // Delete note
  deleteNote(noteId: string): void {
    const index = this.notes.toArray().findIndex((n) => n.id === noteId);
    if (index >= 0) {
      this.notes.delete(index, 1);
    }
  }

  // Get all notes
  getNotes(): any[] {
    return this.notes.toArray();
  }

  // Subscribe to note changes
  onNotesChange(callback: (notes: any[]) => void): void {
    this.notes.observe(() => {
      callback(this.notes.toArray());
    });
  }

  disconnect(): void {
    this.provider.disconnect();
  }
}

// Presence indicator component helper
export function getUserColor(userId: string): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#f43f5e', // rose
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// Cursor position tracking
export class CursorTracker {
  private callbacks: Set<(users: UserAwareness[]) => void> = new Set();
  private interval: NodeJS.Timeout | null = null;
  private provider: CollaborationProvider;

  constructor(provider: CollaborationProvider) {
    this.provider = provider;
    this.startTracking();
  }

  private startTracking(): void {
    this.interval = setInterval(() => {
      const users = this.provider.getActiveUsers();
      this.callbacks.forEach((cb) => cb(users));
    }, 100);
  }

  onCursorMove(callback: (users: UserAwareness[]) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  destroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export { CollaborationProvider };
export type { CollaborationConfig, UserAwareness };
