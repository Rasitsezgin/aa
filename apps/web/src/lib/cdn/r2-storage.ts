// Cloudflare R2 / S3 Compatible Storage
// For image and file storage with CDN

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

interface StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

interface UploadOptions {
  folder?: string;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  optimize?: boolean;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  quality?: number;
}

interface UploadedFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
  variants?: Record<string, string>;
}

class R2Storage {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: StorageConfig) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucketName;
    this.publicUrl = config.publicUrl;
  }

  // Upload file with optional image processing
  async uploadFile(
    file: Buffer,
    filename: string,
    contentType: string,
    options: UploadOptions = {}
  ): Promise<UploadedFile> {
    const { folder = 'uploads', resize, optimize = false, format, quality = 80 } = options;
    
    let processedBuffer = file;
    let finalContentType = contentType;
    let variants: Record<string, string> = {};

    // Image processing
    if (contentType.startsWith('image/') && (resize || optimize || format)) {
      let pipeline = sharp(file);

      // Resize
      if (resize) {
        pipeline = pipeline.resize(resize.width, resize.height, {
          fit: resize.fit || 'cover',
          withoutEnlargement: true,
        });
      }

      // Convert format
      if (format) {
        switch (format) {
          case 'webp':
            pipeline = pipeline.webp({ quality });
            finalContentType = 'image/webp';
            break;
          case 'jpeg':
            pipeline = pipeline.jpeg({ quality, progressive: true });
            finalContentType = 'image/jpeg';
            break;
          case 'png':
            pipeline = pipeline.png({ quality });
            finalContentType = 'image/png';
            break;
          case 'avif':
            pipeline = pipeline.avif({ quality });
            finalContentType = 'image/avif';
            break;
        }
      }

      processedBuffer = await pipeline.toBuffer();

      // Generate responsive variants
      if (resize && (resize.width || 0) > 800) {
        const sizes = [
          { suffix: 'sm', width: 320 },
          { suffix: 'md', width: 640 },
          { suffix: 'lg', width: 1024 },
        ];

        for (const size of sizes) {
          if ((resize.width || 0) > size.width) {
            const variantBuffer = await sharp(file)
              .resize(size.width, null, { withoutEnlargement: true })
              .webp({ quality: 75 })
              .toBuffer();

            const variantKey = `${folder}/${size.suffix}/${filename}`;
            await this.uploadRaw(variantBuffer, variantKey, 'image/webp');
            variants[size.suffix] = `${this.publicUrl}/${variantKey}`;
          }
        }
      }
    }

    const key = `${folder}/${filename}`;
    await this.uploadRaw(processedBuffer, key, finalContentType);

    return {
      key,
      url: `${this.publicUrl}/${key}`,
      size: processedBuffer.length,
      contentType: finalContentType,
      variants: Object.keys(variants).length > 0 ? variants : undefined,
    };
  }

  // Raw upload without processing
  private async uploadRaw(buffer: Buffer, key: string, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await this.client.send(command);
  }

  // Get signed URL for temporary access
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  // Delete file
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  // List files in folder
  async listFiles(prefix: string): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const response = await this.client.send(command);
    
    return (response.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  }

  // Upload from URL (for imports)
  async uploadFromUrl(url: string, filename: string, folder: string = 'imports'): Promise<UploadedFile> {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return this.uploadFile(buffer, filename, contentType, { folder });
  }
}

// Image optimization service
export class ImageOptimizer {
  private storage: R2Storage;

  constructor(storage: R2Storage) {
    this.storage = storage;
  }

  // Optimize product image
  async optimizeProductImage(
    file: Buffer,
    productId: string,
    index: number
  ): Promise<UploadedFile> {
    const filename = `${productId}_${index}.webp`;

    // Create multiple variants
    const variants: Record<string, Buffer> = {
      thumb: await sharp(file)
        .resize(150, 150, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer(),
      small: await sharp(file)
        .resize(320, 320, { fit: 'inside' })
        .webp({ quality: 75 })
        .toBuffer(),
      medium: await sharp(file)
        .resize(640, 640, { fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer(),
      large: await sharp(file)
        .resize(1024, 1024, { fit: 'inside' })
        .webp({ quality: 85 })
        .toBuffer(),
    };

    // Upload all variants
    const results: Record<string, string> = {};
    for (const [size, buffer] of Object.entries(variants)) {
      const key = `products/${size}/${filename}`;
      await this.storage.uploadRaw(buffer, key, 'image/webp');
      results[size] = key;
    }

    return {
      key: `products/large/${filename}`,
      url: `${this.storage['publicUrl']}/products/large/${filename}`,
      size: variants.large.length,
      contentType: 'image/webp',
      variants: results,
    };
  }

  // Generate responsive srcset
  generateSrcSet(baseKey: string, variants: Record<string, string>): string {
    const sizes = {
      thumb: '150w',
      small: '320w',
      medium: '640w',
      large: '1024w',
    };

    return Object.entries(variants)
      .map(([size, key]) => `${key} ${sizes[size as keyof typeof sizes]}`)
      .join(', ');
  }
}

// Export singleton instance
let storageInstance: R2Storage | null = null;

export function getStorage(): R2Storage {
  if (!storageInstance) {
    storageInstance = new R2Storage({
      accountId: process.env.R2_ACCOUNT_ID || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      bucketName: process.env.R2_BUCKET_NAME || 'pazaryonetimi',
      publicUrl: process.env.R2_PUBLIC_URL || '',
    });
  }
  return storageInstance;
}

export { R2Storage, ImageOptimizer };
export type { StorageConfig, UploadOptions, UploadedFile };
