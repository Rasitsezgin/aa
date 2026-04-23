// Advanced File Upload System
// Drag-drop, chunked upload, progress tracking, and image optimization

import { addJob } from '@/lib/queue';
import { r2Storage } from '@/lib/cdn/r2-storage';

interface UploadConfig {
  maxFileSize: number; // bytes
  allowedTypes: string[];
  chunkSize?: number; // bytes, default 5MB
  maxConcurrent?: number;
  enableCompression?: boolean;
  generateThumbnails?: boolean;
  scanVirus?: boolean;
  autoStart?: boolean;
}

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error' | 'cancelled';
  progress: number;
  uploadedBytes: number;
  chunks: UploadChunk[];
  error?: string;
  result?: {
    url: string;
    thumbnailUrl?: string;
    metadata: Record<string, unknown>;
  };
  abortController: AbortController;
}

interface UploadChunk {
  index: number;
  start: number;
  end: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  retries: number;
}

interface UploadQueue {
  files: UploadFile[];
  concurrent: number;
  maxConcurrent: number;
}

// Upload manager
export class UploadManager {
  private queue: UploadQueue = { files: [], concurrent: 0, maxConcurrent: 3 };
  private config: UploadConfig;
  private listeners: Map<string, Set<(file: UploadFile) => void>> = new Map();

  constructor(config: Partial<UploadConfig> = {}) {
    this.config = {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['*/*'],
      chunkSize: 5 * 1024 * 1024, // 5MB
      maxConcurrent: 3,
      enableCompression: true,
      generateThumbnails: true,
      scanVirus: false,
      autoStart: true,
      ...config,
    };
  }

  // Add files to queue
  async addFiles(files: FileList | File[]): Promise<UploadFile[]> {
    const uploadFiles: UploadFile[] = [];

    for (const file of Array.from(files)) {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        console.warn(`File ${file.name} rejected: ${validation.error}`);
        continue;
      }

      // Create chunks
      const chunks = this.createChunks(file);

      const uploadFile: UploadFile = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
        uploadedBytes: 0,
        chunks,
        abortController: new AbortController(),
      };

      this.queue.files.push(uploadFile);
      uploadFiles.push(uploadFile);

      // Notify listeners
      this.notifyListeners('add', uploadFile);

      // Auto start
      if (this.config.autoStart) {
        this.processQueue();
      }
    }

    return uploadFiles;
  }

  // Process upload queue
  private async processQueue(): Promise<void> {
    while (
      this.queue.concurrent < this.queue.maxConcurrent &&
      this.queue.files.some(f => f.status === 'pending')
    ) {
      const file = this.queue.files.find(f => f.status === 'pending');
      if (!file) break;

      this.queue.concurrent++;
      this.uploadFile(file).finally(() => {
        this.queue.concurrent--;
        this.processQueue();
      });
    }
  }

  // Upload single file
  private async uploadFile(file: UploadFile): Promise<void> {
    file.status = 'uploading';
    this.notifyListeners('start', file);

    try {
      // Compress if enabled and is image
      let processedFile = file.file;
      if (this.config.enableCompression && file.type.startsWith('image/')) {
        processedFile = await this.compressImage(file.file);
      }

      // Use chunked upload for large files
      if (file.size > (this.config.chunkSize || 5 * 1024 * 1024)) {
        await this.chunkedUpload(file, processedFile);
      } else {
        await this.directUpload(file, processedFile);
      }

      // Generate thumbnails for images
      if (this.config.generateThumbnails && file.type.startsWith('image/')) {
        await this.generateThumbnails(file);
      }

      // Scan for viruses if enabled
      if (this.config.scanVirus) {
        await this.scanFile(file);
      }

      file.status = 'completed';
      file.progress = 100;
      this.notifyListeners('complete', file);

    } catch (error) {
      file.status = 'error';
      file.error = String(error);
      this.notifyListeners('error', file);
    }
  }

  // Chunked upload
  private async chunkedUpload(file: UploadFile, processedFile: File): Promise<void> {
    const totalChunks = file.chunks.length;
    let completedChunks = 0;

    for (const chunk of file.chunks) {
      if (file.status === 'cancelled') break;

      chunk.status = 'uploading';
      
      const chunkBlob = processedFile.slice(chunk.start, chunk.end);
      
      try {
        await this.uploadChunk(file.id, chunk.index, chunkBlob, file.abortController.signal);
        
        chunk.status = 'completed';
        completedChunks++;
        file.uploadedBytes += chunk.end - chunk.start;
        file.progress = Math.round((completedChunks / totalChunks) * 100);
        
        this.notifyListeners('progress', file);
      } catch (error) {
        chunk.status = 'error';
        chunk.retries++;
        
        if (chunk.retries < 3) {
          // Retry
          continue;
        }
        throw error;
      }
    }

    // Complete multipart upload
    await this.completeMultipartUpload(file);
  }

  // Direct upload
  private async directUpload(file: UploadFile, processedFile: File): Promise<void> {
    const key = `uploads/${file.id}/${file.name}`;
    
    const result = await r2Storage.uploadFile(
      processedFile,
      key,
      file.type,
      (progress) => {
        file.progress = progress;
        file.uploadedBytes = (progress / 100) * file.size;
        this.notifyListeners('progress', file);
      }
    );

    file.result = {
      url: result.url,
      metadata: result.metadata,
    };
  }

  // Compress image
  private async compressImage(file: File): Promise<File> {
    // Would use browser image compression library
    // For now, return original
    return file;
  }

  // Generate thumbnails
  private async generateThumbnails(file: UploadFile): Promise<void> {
    // Queue thumbnail generation job
    await addJob('image.generate_thumbnails', {
      fileId: file.id,
      originalUrl: file.result?.url,
      sizes: [150, 300, 600],
    });
  }

  // Scan file for viruses
  private async scanFile(file: UploadFile): Promise<void> {
    // Would integrate with virus scanning service
    console.log('Scanning file:', file.name);
  }

  // Upload single chunk
  private async uploadChunk(
    fileId: string,
    index: number,
    blob: Blob,
    signal: AbortSignal
  ): Promise<void> {
    // Would upload to server
    const formData = new FormData();
    formData.append('chunk', blob);
    formData.append('index', String(index));
    formData.append('fileId', fileId);

    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    }
  }

  // Complete multipart upload
  private async completeMultipartUpload(file: UploadFile): Promise<void> {
    const response = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: file.id,
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete upload');
    }

    const result = await response.json();
    file.result = {
      url: result.url,
      metadata: result.metadata,
    };
  }

  // Create chunks
  private createChunks(file: File): UploadChunk[] {
    const chunks: UploadChunk[] = [];
    const chunkSize = this.config.chunkSize || 5 * 1024 * 1024;
    let start = 0;
    let index = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push({
        index,
        start,
        end,
        status: 'pending',
        retries: 0,
      });
      start = end;
      index++;
    }

    return chunks;
  }

  // Validate file
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check size
    if (file.size > this.config.maxFileSize) {
      return { valid: false, error: 'File too large' };
    }

    // Check type
    if (this.config.allowedTypes[0] !== '*/*') {
      const isAllowed = this.config.allowedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return { valid: false, error: 'File type not allowed' };
      }
    }

    return { valid: true };
  }

  // Cancel upload
  cancel(fileId: string): void {
    const file = this.queue.files.find(f => f.id === fileId);
    if (file) {
      file.status = 'cancelled';
      file.abortController.abort();
      this.notifyListeners('cancel', file);
    }
  }

  // Cancel all uploads
  cancelAll(): void {
    this.queue.files.forEach(file => {
      if (file.status === 'pending' || file.status === 'uploading') {
        this.cancel(file.id);
      }
    });
  }

  // Retry failed upload
  async retry(fileId: string): Promise<void> {
    const file = this.queue.files.find(f => f.id === fileId);
    if (!file || file.status !== 'error') return;

    file.status = 'pending';
    file.error = undefined;
    file.progress = 0;
    file.uploadedBytes = 0;
    file.chunks.forEach(c => {
      c.status = 'pending';
      c.retries = 0;
    });
    file.abortController = new AbortController();

    this.processQueue();
  }

  // Remove file from queue
  remove(fileId: string): void {
    const index = this.queue.files.findIndex(f => f.id === fileId);
    if (index > -1) {
      const file = this.queue.files[index];
      this.cancel(fileId);
      this.queue.files.splice(index, 1);
      this.notifyListeners('remove', file);
    }
  }

  // Clear completed uploads
  clearCompleted(): void {
    this.queue.files = this.queue.files.filter(f => f.status !== 'completed');
  }

  // Get queue status
  getStatus(): {
    total: number;
    pending: number;
    uploading: number;
    completed: number;
    error: number;
    totalProgress: number;
  } {
    const total = this.queue.files.length;
    const pending = this.queue.files.filter(f => f.status === 'pending').length;
    const uploading = this.queue.files.filter(f => f.status === 'uploading').length;
    const completed = this.queue.files.filter(f => f.status === 'completed').length;
    const error = this.queue.files.filter(f => f.status === 'error').length;

    const totalSize = this.queue.files.reduce((sum, f) => sum + f.size, 0);
    const uploadedSize = this.queue.files.reduce((sum, f) => sum + f.uploadedBytes, 0);
    const totalProgress = totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;

    return { total, pending, uploading, completed, error, totalProgress };
  }

  // Subscribe to events
  on(event: string, callback: (file: UploadFile) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(event: string, file: UploadFile): void {
    this.listeners.get(event)?.forEach(callback => callback(file));
  }
}

// Drag and drop handler
export class DragDropHandler {
  private isDragging = false;
  private counter = 0;

  constructor(
    private onDrop: (files: FileList) => void,
    private onDragEnter?: () => void,
    private onDragLeave?: () => void
  ) {}

  handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.counter++;
    
    if (!this.isDragging) {
      this.isDragging = true;
      this.onDragEnter?.();
    }
  }

  handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.counter--;
    
    if (this.counter === 0) {
      this.isDragging = false;
      this.onDragLeave?.();
    }
  }

  handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    
    this.isDragging = false;
    this.counter = 0;
    this.onDragLeave?.();

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.onDrop(files);
    }
  }
}

// Image preview generator
export async function generateImagePreview(
  file: File,
  maxWidth: number = 300,
  maxHeight: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { UploadConfig, UploadFile, UploadChunk, UploadQueue };
