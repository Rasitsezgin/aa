// IoT Device Manager
// Manage IoT devices for smart inventory, smart stores

import { EventEmitter } from 'events';

type DeviceType = 'sensor' | 'camera' | 'display' | 'printer' | 'scanner' | 'lock' | 'beacon';
type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance' | 'inactive';

interface IoTDevice {
  id: string;
  tenantId: string;
  name: string;
  type: DeviceType;
  model: string;
  manufacturer: string;
  serialNumber: string;
  firmware: string;
  location: {
    warehouseId?: string;
    storeId?: string;
    zone?: string;
    coordinates?: { lat: number; lng: number };
  };
  status: DeviceStatus;
  connectivity: {
    protocol: 'wifi' | 'ethernet' | 'cellular' | 'lora' | 'zigbee';
    ipAddress?: string;
    macAddress: string;
    lastSeen: Date;
    signalStrength?: number;
  };
  sensors?: Array<{
    type: string;
    unit: string;
    lastReading?: number;
    threshold?: { min: number; max: number };
  }>;
  config: Record<string, unknown>;
  metadata: {
    installedAt: Date;
    warrantyExpiry?: Date;
    purchaseDate?: Date;
    notes?: string;
  };
  actions: string[]; // Available actions
}

interface DeviceReading {
  id: string;
  deviceId: string;
  tenantId: string;
  timestamp: Date;
  sensor: string;
  value: number;
  unit: string;
  quality: 'good' | 'uncertain' | 'bad';
}

interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  params: Record<string, unknown>;
  status: 'pending' | 'sent' | 'executing' | 'completed' | 'failed';
  sentAt?: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
}

// IoT Device Manager
export class IoTDeviceManager extends EventEmitter {
  private devices: Map<string, IoTDevice> = new Map();
  private readings: Map<string, DeviceReading[]> = new Map();
  private commands: Map<string, DeviceCommand[]> = new Map();

  // Register device
  register(device: Omit<IoTDevice, 'id' | 'status' | 'connectivity'> & { connectivity: Omit<IoTDevice['connectivity'], 'lastSeen'> }): IoTDevice {
    const fullDevice: IoTDevice = {
      ...device,
      id: crypto.randomUUID(),
      status: 'offline',
      connectivity: {
        ...device.connectivity,
        lastSeen: new Date(),
      },
    };

    this.devices.set(fullDevice.id, fullDevice);
    this.emit('deviceRegistered', fullDevice);
    
    // Start heartbeat monitoring
    this.startHeartbeat(fullDevice.id);
    
    return fullDevice;
  }

  // Device heartbeat
  heartbeat(deviceId: string, data: {
    signalStrength?: number;
    readings?: Array<{ sensor: string; value: number; unit: string }>;
  }): IoTDevice {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');

    device.connectivity.lastSeen = new Date();
    device.status = 'online';

    if (data.signalStrength !== undefined) {
      device.connectivity.signalStrength = data.signalStrength;
    }

    // Store readings
    if (data.readings) {
      for (const reading of data.readings) {
        this.addReading(deviceId, reading.sensor, reading.value, reading.unit);
      }
    }

    this.emit('heartbeat', device);
    return device;
  }

  // Add sensor reading
  addReading(
    deviceId: string,
    sensor: string,
    value: number,
    unit: string
  ): DeviceReading {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');

    const reading: DeviceReading = {
      id: crypto.randomUUID(),
      deviceId,
      tenantId: device.tenantId,
      timestamp: new Date(),
      sensor,
      value,
      unit,
      quality: 'good',
    };

    const readings = this.readings.get(deviceId) || [];
    readings.push(reading);
    this.readings.set(deviceId, readings.slice(-10000)); // Keep last 10k

    // Check thresholds
    this.checkThresholds(device, sensor, value);

    this.emit('reading', reading);
    return reading;
  }

  // Send command to device
  async sendCommand(
    deviceId: string,
    command: string,
    params: Record<string, unknown> = {}
  ): Promise<DeviceCommand> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');
    if (device.status !== 'online') throw new Error('Device is offline');

    const cmd: DeviceCommand = {
      id: crypto.randomUUID(),
      deviceId,
      command,
      params,
      status: 'pending',
    };

    const commands = this.commands.get(deviceId) || [];
    commands.push(cmd);
    this.commands.set(deviceId, commands);

    // Simulate command sending
    cmd.status = 'sent';
    cmd.sentAt = new Date();

    this.emit('commandSent', cmd);
    return cmd;
  }

  // Update command status
  updateCommandStatus(
    commandId: string,
    status: DeviceCommand['status'],
    result?: unknown,
    error?: string
  ): DeviceCommand {
    for (const [deviceId, commands] of this.commands) {
      const cmd = commands.find(c => c.id === commandId);
      if (cmd) {
        cmd.status = status;
        if (status === 'completed' || status === 'failed') {
          cmd.completedAt = new Date();
        }
        cmd.result = result;
        cmd.error = error;

        this.emit('commandUpdated', cmd);
        return cmd;
      }
    }
    throw new Error('Command not found');
  }

  // Get device readings
  getReadings(
    deviceId: string,
    options: {
      sensor?: string;
      from?: Date;
      to?: Date;
      limit?: number;
    } = {}
  ): DeviceReading[] {
    let readings = this.readings.get(deviceId) || [];

    if (options.sensor) {
      readings = readings.filter(r => r.sensor === options.sensor);
    }

    if (options.from) {
      readings = readings.filter(r => r.timestamp >= options.from!);
    }

    if (options.to) {
      readings = readings.filter(r => r.timestamp <= options.to!);
    }

    readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return readings.slice(0, options.limit || 100);
  }

  // Get device stats
  getDeviceStats(deviceId: string): {
    totalReadings: number;
    uptime: number;
    last24hReadings: number;
    alerts: number;
  } | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const readings = this.readings.get(deviceId) || [];
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return {
      totalReadings: readings.length,
      uptime: device.status === 'online' ? 99.5 : 0,
      last24hReadings: readings.filter(r => r.timestamp > last24h).length,
      alerts: 0,
    };
  }

  // List devices for tenant
  listDevices(tenantId: string, options: {
    type?: DeviceType;
    status?: DeviceStatus;
    location?: { warehouseId?: string; storeId?: string };
  } = {}): IoTDevice[] {
    let devices = Array.from(this.devices.values()).filter(d => d.tenantId === tenantId);

    if (options.type) {
      devices = devices.filter(d => d.type === options.type);
    }

    if (options.status) {
      devices = devices.filter(d => d.status === options.status);
    }

    if (options.location?.warehouseId) {
      devices = devices.filter(d => d.location.warehouseId === options.location!.warehouseId);
    }

    if (options.location?.storeId) {
      devices = devices.filter(d => d.location.storeId === options.location!.storeId);
    }

    return devices;
  }

  // Get fleet health
  getFleetHealth(tenantId: string): {
    total: number;
    online: number;
    offline: number;
    error: number;
    byType: Record<DeviceType, number>;
  } {
    const devices = this.listDevices(tenantId);
    
    const byType: Record<DeviceType, number> = {
      sensor: 0, camera: 0, display: 0, printer: 0, scanner: 0, lock: 0, beacon: 0,
    };

    for (const d of devices) {
      byType[d.type]++;
    }

    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      error: devices.filter(d => d.status === 'error').length,
      byType,
    };
  }

  // Private methods
  private startHeartbeat(deviceId: string): void {
    // Check if device misses heartbeats
    setInterval(() => {
      const device = this.devices.get(deviceId);
      if (!device) return;

      const lastSeen = device.connectivity.lastSeen.getTime();
      const now = Date.now();

      // Mark offline if no heartbeat for 5 minutes
      if (now - lastSeen > 5 * 60 * 1000 && device.status === 'online') {
        device.status = 'offline';
        this.emit('deviceOffline', device);
      }
    }, 60000);
  }

  private checkThresholds(device: IoTDevice, sensor: string, value: number): void {
    const sensorConfig = device.sensors?.find(s => s.type === sensor);
    if (!sensorConfig?.threshold) return;

    const { min, max } = sensorConfig.threshold;
    
    if (value < min || value > max) {
      this.emit('thresholdAlert', {
        deviceId: device.id,
        sensor,
        value,
        threshold: sensorConfig.threshold,
      });
    }
  }
}

// Export singleton
export const ioTDeviceManager = new IoTDeviceManager();

export { IoTDevice, DeviceReading, DeviceCommand, DeviceType, DeviceStatus };
