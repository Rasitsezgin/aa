// AI Image Processing Service
// Background removal, enhancement, and automatic cropping

import { getStorage } from '@/lib/cdn/r2-storage';

interface ImageProcessingOptions {
  removeBackground?: boolean;
  enhance?: boolean;
  autoCrop?: boolean;
  targetSize?: { width: number; height: number };
  format?: 'webp' | 'png' | 'jpeg';
  quality?: number;
}

interface ProcessedImage {
  originalUrl: string;
  processedUrl: string;
  thumbnailUrl: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    backgroundRemoved?: boolean;
    enhanced?: boolean;
  };
}

// Main image processing function
export async function processProductImage(
  imageUrl: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    removeBackground = false,
    enhance = false,
    autoCrop = true,
    targetSize = { width: 800, height: 800 },
    format = 'webp',
    quality = 85,
  } = options;

  try {
    // Download image
    const response = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Process with Sharp
    let processedBuffer = imageBuffer;
    let metadata: any = {};

    // Step 1: Auto-crop to product (if enabled)
    if (autoCrop) {
      const cropResult = await autoCropProduct(imageBuffer);
      processedBuffer = cropResult.buffer;
      metadata.crop = cropResult.bounds;
    }

    // Step 2: Remove background (if enabled)
    if (removeBackground) {
      const bgRemoved = await removeImageBackground(processedBuffer);
      processedBuffer = bgRemoved;
      metadata.backgroundRemoved = true;
    }

    // Step 3: Enhance image quality (if enabled)
    if (enhance) {
      processedBuffer = await enhanceImage(processedBuffer);
      metadata.enhanced = true;
    }

    // Step 4: Resize to target dimensions
    processedBuffer = await resizeImage(processedBuffer, targetSize, format, quality);

    // Step 5: Generate thumbnail
    const thumbnailBuffer = await resizeImage(
      processedBuffer,
      { width: 200, height: 200 },
      format,
      75
    );

    // Upload to storage
    const storage = getStorage();
    const timestamp = Date.now();
    
    const [processedUpload, thumbnailUpload] = await Promise.all([
      storage.uploadFile(
        processedBuffer,
        `processed_${timestamp}.${format}`,
        `image/${format}`,
        { folder: 'products/processed', format }
      ),
      storage.uploadFile(
        thumbnailBuffer,
        `thumb_${timestamp}.${format}`,
        `image/${format}`,
        { folder: 'products/thumbnails', format }
      ),
    ]);

    return {
      originalUrl: imageUrl,
      processedUrl: processedUpload.url,
      thumbnailUrl: thumbnailUpload.url,
      metadata: {
        width: targetSize.width,
        height: targetSize.height,
        format,
        size: processedBuffer.length,
        backgroundRemoved: metadata.backgroundRemoved,
        enhanced: metadata.enhanced,
      },
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    throw new Error('Failed to process image');
  }
}

// Auto-crop product from image using simple edge detection
async function autoCropProduct(buffer: Buffer): Promise<{
  buffer: Buffer;
  bounds: { x: number; y: number; width: number; height: number };
}> {
  // This is a placeholder - in production, use a proper ML model
  // like rembg, remove.bg API, or a custom TensorFlow model
  
  const sharp = await import('sharp');
  
  // Get image metadata
  const metadata = await sharp.default(buffer).metadata();
  const width = metadata.width || 1000;
  const height = metadata.height || 1000;

  // Simple center crop with padding removal
  // In production, use object detection to find product bounds
  const padding = Math.min(width, height) * 0.1;
  const cropBounds = {
    x: Math.floor(padding),
    y: Math.floor(padding),
    width: Math.floor(width - padding * 2),
    height: Math.floor(height - padding * 2),
  };

  const cropped = await sharp.default(buffer)
    .extract(cropBounds)
    .toBuffer();

  return { buffer: cropped, bounds: cropBounds };
}

// Remove background using external API or ML model
async function removeImageBackground(buffer: Buffer): Promise<Buffer> {
  // Option 1: Use remove.bg API
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (apiKey) {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: createFormData(buffer),
    });

    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
  }

  // Option 2: Use local ML model (placeholder)
  // In production, integrate with rembg Python library via API
  
  // Fallback: return original with alpha channel
  const sharp = await import('sharp');
  return sharp.default(buffer)
    .ensureAlpha()
    .toBuffer();
}

// Enhance image quality
async function enhanceImage(buffer: Buffer): Promise<Buffer> {
  const sharp = await import('sharp');
  
  return sharp.default(buffer)
    // Sharpen
    .sharpen({
      sigma: 1,
      m1: 0.5,
      m2: 0.5,
    })
    // Adjust contrast and brightness
    .modulate({
      brightness: 1.05,
      saturation: 1.1,
    })
    // Normalize (stretch histogram)
    .normalize()
    .toBuffer();
}

// Resize image
async function resizeImage(
  buffer: Buffer,
  size: { width: number; height: number },
  format: string,
  quality: number
): Promise<Buffer> {
  const sharp = await import('sharp');
  
  let pipeline = sharp.default(buffer)
    .resize(size.width, size.height, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    });

  // Apply format
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
  }

  return pipeline.toBuffer();
}

// Batch process multiple images
export async function batchProcessImages(
  imageUrls: string[],
  options: ImageProcessingOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];
  const total = imageUrls.length;

  for (let i = 0; i < total; i++) {
    try {
      const result = await processProductImage(imageUrls[i], options);
      results.push(result);
      onProgress?.(i + 1, total);
    } catch (error) {
      console.error(`Failed to process image ${i}:`, error);
      // Continue with other images
    }
  }

  return results;
}

// Generate image variants for different platforms
export async function generatePlatformVariants(
  imageUrl: string,
  platforms: string[]
): Promise<Record<string, ProcessedImage>> {
  const platformSpecs: Record<string, { size: { width: number; height: number }; format: 'webp' | 'jpeg' | 'png' }> = {
    trendyol: { size: { width: 1200, height: 1200 }, format: 'webp' },
    hepsiburada: { size: { width: 1000, height: 1000 }, format: 'jpeg' },
    amazon: { size: { width: 2000, height: 2000 }, format: 'jpeg' },
    n11: { size: { width: 800, height: 800 }, format: 'webp' },
    ciceksepeti: { size: { width: 600, height: 600 }, format: 'jpeg' },
  };

  const variants: Record<string, ProcessedImage> = {};

  for (const platform of platforms) {
    const spec = platformSpecs[platform.toLowerCase()];
    if (spec) {
      variants[platform] = await processProductImage(imageUrl, {
        targetSize: spec.size,
        format: spec.format,
        quality: 90,
      });
    }
  }

  return variants;
}

// AI-powered image tagging
export async function generateImageTags(imageUrl: string): Promise<string[]> {
  // This would integrate with an image recognition API
  // like Google Vision AI, AWS Rekognition, or Azure Computer Vision
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this product image and provide 10 relevant tags for search and categorization. Return only a comma-separated list.' },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return content.split(',').map((tag: string) => tag.trim()).filter(Boolean);
  } catch (error) {
    console.error('Image tagging failed:', error);
    return [];
  }
}

// Helper to create FormData from buffer
function createFormData(buffer: Buffer): FormData {
  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append('image_file', blob, 'image.png');
  formData.append('size', 'auto');
  return formData;
}

// Export types
export type { ImageProcessingOptions, ProcessedImage };
