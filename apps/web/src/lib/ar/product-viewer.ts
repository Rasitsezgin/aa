// AR Product Viewer
// Augmented Reality for product visualization

import { EventEmitter } from 'events';

interface ARModel {
  id: string;
  tenantId: string;
  productId: string;
  name: string;
  formats: {
    glb?: string;
    usdz?: string;
    gltf?: string;
    fbx?: string;
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'cm' | 'inch' | 'mm';
  };
  thumbnailUrl: string;
  fileSize: number;
  polygons: number;
  textures: string[];
  animations?: string[];
  hotspots?: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    label: string;
    description?: string;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    optimized: boolean;
  };
}

interface ARSession {
  id: string;
  userId: string;
  tenantId: string;
  modelId: string;
  platform: 'ios' | 'android' | 'web';
  status: 'starting' | 'active' | 'paused' | 'ended';
  startedAt: Date;
  endedAt?: Date;
  interactions: {
    rotations: number;
    zooms: number;
    measurements: number;
    screenshots: number;
  };
  cameraPosition?: {
    x: number;
    y: number;
    z: number;
  };
}

interface ARMeasurement {
  id: string;
  sessionId: string;
  type: 'point' | 'distance' | 'angle' | 'area' | 'volume';
  points: Array<{ x: number; y: number; z: number }>;
  value: number;
  unit: string;
  accuracy: number;
  timestamp: Date;
}

// AR Product Viewer Manager
export class ARProductViewer extends EventEmitter {
  private models: Map<string, ARModel> = new Map();
  private sessions: Map<string, ARSession> = new Map();
  private measurements: Map<string, ARMeasurement[]> = new Map();

  // Upload 3D model
  async uploadModel(
    tenantId: string,
    productId: string,
    file: Buffer,
    options: {
      name: string;
      format: 'glb' | 'usdz' | 'gltf' | 'fbx';
      autoOptimize?: boolean;
      generateThumbnail?: boolean;
    }
  ): Promise<ARModel> {
    const model: ARModel = {
      id: crypto.randomUUID(),
      tenantId,
      productId,
      name: options.name,
      formats: { [options.format]: 'uploaded-url' },
      dimensions: { width: 0, height: 0, depth: 0, unit: 'cm' },
      thumbnailUrl: '',
      fileSize: file.length,
      polygons: 0,
      textures: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        quality: 'medium',
        optimized: false,
      },
    };

    if (options.autoOptimize) {
      await this.optimizeModel(model);
    }

    if (options.generateThumbnail) {
      model.thumbnailUrl = await this.generateThumbnail(model);
    }

    this.models.set(model.id, model);
    this.emit('modelUploaded', model);
    return model;
  }

  // Start AR session
  startSession(
    userId: string,
    tenantId: string,
    modelId: string,
    platform: ARSession['platform']
  ): ARSession {
    const session: ARSession = {
      id: crypto.randomUUID(),
      userId,
      tenantId,
      modelId,
      platform,
      status: 'starting',
      startedAt: new Date(),
      interactions: {
        rotations: 0,
        zooms: 0,
        measurements: 0,
        screenshots: 0,
      },
    };

    this.sessions.set(session.id, session);

    // Auto-start after init
    setTimeout(() => {
      session.status = 'active';
      this.emit('sessionStarted', session);
    }, 1000);

    return session;
  }

  // Get AR embed code for web
  getWebEmbedCode(modelId: string, options: {
    width?: number;
    height?: number;
    autoRotate?: boolean;
    cameraControls?: boolean;
  } = {}): string {
    const model = this.models.get(modelId);
    if (!model) throw new Error('Model not found');

    const width = options.width || 500;
    const height = options.height || 500;

    return `
<model-viewer
  src="${model.formats.glb || model.formats.gltf}"
  ios-src="${model.formats.usdz}"
  poster="${model.thumbnailUrl}"
  alt="${model.name}"
  width="${width}"
  height="${height}"
  ${options.autoRotate ? 'auto-rotate' : ''}
  ${options.cameraControls ? 'camera-controls' : ''}
  ar
  ar-modes="webxr scene-viewer quick-look"
  shadow-intensity="1"
  exposure="0.8"
  camera-orbit="0deg 75deg 2m"
></model-viewer>
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    `.trim();
  }

  // Get iOS AR Quick Look URL
  getIOSQuickLookUrl(modelId: string): string {
    const model = this.models.get(modelId);
    if (!model) throw new Error('Model not found');
    return model.formats.usdz || '';
  }

  // Get Android Scene Viewer URL
  getAndroidSceneViewerUrl(modelId: string): string {
    const model = this.models.get(modelId);
    if (!model) throw new Error('Model not found');
    
    const glbUrl = model.formats.glb || model.formats.gltf || '';
    return `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(glbUrl)};end;`;
  }

  // Record interaction
  recordInteraction(
    sessionId: string,
    type: 'rotation' | 'zoom' | 'measurement' | 'screenshot'
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.interactions[type === 'rotation' ? 'rotations' : type === 'zoom' ? 'zooms' : type === 'measurement' ? 'measurements' : 'screenshots']++;
  }

  // Add measurement
  addMeasurement(
    sessionId: string,
    measurement: Omit<ARMeasurement, 'id' | 'sessionId' | 'timestamp'>
  ): ARMeasurement {
    const fullMeasurement: ARMeasurement = {
      ...measurement,
      id: crypto.randomUUID(),
      sessionId,
      timestamp: new Date(),
    };

    const measurements = this.measurements.get(sessionId) || [];
    measurements.push(fullMeasurement);
    this.measurements.set(sessionId, measurements);

    this.recordInteraction(sessionId, 'measurement');
    return fullMeasurement;
  }

  // End session
  endSession(sessionId: string): ARSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'ended';
    session.endedAt = new Date();

    this.emit('sessionEnded', session);
    return session;
  }

  // Get analytics
  getAnalytics(tenantId: string, period: { from: Date; to: Date }): {
    totalSessions: number;
    totalInteractions: number;
    byPlatform: Record<string, number>;
    avgSessionDuration: number;
    topModels: Array<{ modelId: string; sessions: number }>;
  } {
    const sessions = Array.from(this.sessions.values()).filter(
      s => s.tenantId === tenantId && s.startedAt >= period.from && s.startedAt <= period.to
    );

    const byPlatform: Record<string, number> = {};
    const modelSessions: Record<string, number> = {};
    let totalDuration = 0;

    for (const session of sessions) {
      byPlatform[session.platform] = (byPlatform[session.platform] || 0) + 1;
      modelSessions[session.modelId] = (modelSessions[session.modelId] || 0) + 1;

      if (session.endedAt) {
        totalDuration += session.endedAt.getTime() - session.startedAt.getTime();
      }
    }

    const totalInteractions = sessions.reduce(
      (sum, s) => sum + s.interactions.rotations + s.interactions.zooms + s.interactions.measurements + s.interactions.screenshots,
      0
    );

    const topModels = Object.entries(modelSessions)
      .map(([modelId, sessions]) => ({ modelId, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    return {
      totalSessions: sessions.length,
      totalInteractions,
      byPlatform,
      avgSessionDuration: sessions.length > 0 ? totalDuration / sessions.length / 1000 : 0,
      topModels,
    };
  }

  // Optimize model for web/mobile
  private async optimizeModel(model: ARModel): Promise<void> {
    // In production:
    // - Reduce polygon count
    // - Compress textures
    // - Generate LODs (Level of Detail)
    // - Draco compression for glb

    await new Promise(resolve => setTimeout(resolve, 2000));
    model.metadata.optimized = true;
  }

  // Generate thumbnail
  private async generateThumbnail(model: ARModel): Promise<string> {
    // In production: Render model and capture thumbnail
    return `https://cdn.example.com/thumbnails/${model.id}.jpg`;
  }
}

// Export singleton
export const arProductViewer = new ARProductViewer();

export { ARModel, ARSession, ARMeasurement };
