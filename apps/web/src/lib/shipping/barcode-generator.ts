// Shipping Barcode Generator
// Supports multiple carriers: Aras, Yurtiçi, MNG, PTT, UPS, DHL

import { createCanvas } from 'canvas';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export type Carrier = 'aras' | 'yurtici' | 'mng' | 'ptt' | 'ups' | 'dhl' | 'fedex';

interface BarcodeOptions {
  carrier: Carrier;
  trackingNumber: string;
  format?: 'CODE128' | 'EAN13' | 'CODE39' | 'QR';
  width?: number;
  height?: number;
  showText?: boolean;
}

interface ShippingLabel {
  sender: {
    company: string;
    name: string;
    address: string;
    city: string;
    district: string;
    phone: string;
  };
  recipient: {
    name: string;
    address: string;
    city: string;
    district: string;
    phone: string;
  };
  shipment: {
    trackingNumber: string;
    weight: number;
    pieceCount: number;
    description: string;
    barcode: string;
    barcodeFormat: string;
  };
  orderInfo: {
    orderId: string;
    platform: string;
    date: string;
  };
}

// Generate barcode as data URL
export async function generateBarcode(options: BarcodeOptions): Promise<string> {
  const { carrier, trackingNumber, format = 'CODE128', width = 2, height = 100, showText = true } = options;

  if (format === 'QR') {
    return QRCode.toDataURL(trackingNumber, {
      width: 200,
      margin: 2,
    });
  }

  const canvas = createCanvas(300, 150);
  
  try {
    JsBarcode(canvas, trackingNumber, {
      format,
      width,
      height,
      displayValue: showText,
      fontSize: 14,
      margin: 10,
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Barcode generation failed:', error);
    throw new Error('Failed to generate barcode');
  }
}

// Generate carrier-specific tracking number
export function generateTrackingNumber(carrier: Carrier): string {
  const prefix = getCarrierPrefix(carrier);
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase();
  
  return `${prefix}${random}${timestamp}`;
}

function getCarrierPrefix(carrier: Carrier): string {
  const prefixes: Record<Carrier, string> = {
    aras: 'ARS',
    yurtici: 'YTC',
    mng: 'MNG',
    ptt: 'PTT',
    ups: 'UPS',
    dhl: 'DHL',
    fedex: 'FDX',
  };
  return prefixes[carrier] || 'TRK';
}

// Validate tracking number format
export function validateTrackingNumber(carrier: Carrier, trackingNumber: string): boolean {
  const patterns: Record<Carrier, RegExp> = {
    aras: /^ARS[A-Z0-9]{10,}$/,
    yurtici: /^YTC[A-Z0-9]{10,}$/,
    mng: /^MNG[A-Z0-9]{10,}$/,
    ptt: /^PTT[A-Z0-9]{10,}$/,
    ups: /^1Z[A-Z0-9]{16}$/i,
    dhl: /^[0-9]{10,11}$/,
    fedex: /^[0-9]{12}$/,
  };
  
  return patterns[carrier]?.test(trackingNumber) ?? false;
}

// Generate shipping label as HTML
export function generateShippingLabelHTML(label: ShippingLabel): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: 100mm 150mm; margin: 0; }
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 8mm;
      font-size: 9pt;
      width: 84mm;
      height: 134mm;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #000; 
      padding-bottom: 3mm;
      margin-bottom: 3mm;
    }
    .logo { 
      font-size: 14pt; 
      font-weight: bold;
      color: #2563eb;
    }
    .barcode { 
      text-align: center; 
      margin: 4mm 0;
      padding: 3mm;
      border: 1px solid #000;
    }
    .barcode img {
      max-width: 100%;
      height: auto;
    }
    .tracking-number {
      font-size: 11pt;
      font-weight: bold;
      letter-spacing: 1px;
      margin-top: 2mm;
    }
    .section {
      margin: 3mm 0;
      padding: 2mm;
      border: 1px solid #ccc;
    }
    .section-title {
      font-weight: bold;
      font-size: 8pt;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 1mm;
    }
    .recipient {
      font-size: 11pt;
      font-weight: bold;
    }
    .address {
      font-size: 9pt;
      line-height: 1.3;
    }
    .info-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 2mm;
    }
    .info-item {
      text-align: center;
    }
    .info-label {
      font-size: 7pt;
      color: #666;
    }
    .info-value {
      font-size: 9pt;
      font-weight: bold;
    }
    .footer {
      position: absolute;
      bottom: 8mm;
      left: 8mm;
      right: 8mm;
      font-size: 7pt;
      color: #666;
      text-align: center;
    }
    .platform-badge {
      display: inline-block;
      padding: 1mm 2mm;
      background: #2563eb;
      color: white;
      font-size: 7pt;
      border-radius: 1mm;
      margin-top: 1mm;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${label.orderInfo.platform.toUpperCase()}</div>
    <div style="font-size: 8pt; margin-top: 1mm;">${label.orderInfo.date}</div>
  </div>
  
  <div class="barcode">
    <img src="${label.shipment.barcode}" alt="Barcode" />
    <div class="tracking-number">${label.shipment.trackingNumber}</div>
  </div>
  
  <div class="section">
    <div class="section-title">Gönderen</div>
    <div style="font-weight: bold;">${label.sender.company}</div>
    <div class="address">
      ${label.sender.address}<br>
      ${label.sender.district}, ${label.sender.city}<br>
      Tel: ${label.sender.phone}
    </div>
  </div>
  
  <div class="section" style="border: 2px solid #000;">
    <div class="section-title">Alıcı</div>
    <div class="recipient">${label.recipient.name}</div>
    <div class="address">
      ${label.recipient.address}<br>
      ${label.recipient.district}, ${label.recipient.city}<br>
      Tel: ${label.recipient.phone}
    </div>
  </div>
  
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Ağırlık</div>
      <div class="info-value">${label.shipment.weight} kg</div>
    </div>
    <div class="info-item">
      <div class="info-label">Parça</div>
      <div class="info-value">${label.shipment.pieceCount}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Sipariş</div>
      <div class="info-value">#${label.orderInfo.orderId.slice(-6)}</div>
    </div>
  </div>
  
  <div class="footer">
    <div class="platform-badge">${label.orderInfo.platform}</div>
    <div style="margin-top: 2mm;">${label.shipment.description}</div>
  </div>
</body>
</html>
  `;
}

// Calculate shipping cost
export function calculateShippingCost(
  carrier: Carrier,
  weight: number,
  destinationCity: string,
  isDomestic: boolean = true
): number {
  // Base rates by carrier (simplified)
  const baseRates: Record<Carrier, number> = {
    aras: 35,
    yurtici: 32,
    mng: 30,
    ptt: 25,
    ups: 150,
    dhl: 200,
    fedex: 180,
  };

  const baseRate = baseRates[carrier] || 35;
  
  // Weight calculation (per kg after first kg)
  const weightCost = Math.max(0, weight - 1) * (baseRate * 0.3);
  
  // Domestic vs international
  const domesticMultiplier = isDomestic ? 1 : 5;
  
  // Calculate total
  const total = (baseRate + weightCost) * domesticMultiplier;
  
  return Math.round(total * 100) / 100;
}

// Carrier integration status
export const carrierIntegrations: Record<Carrier, {
  name: string;
  hasApi: boolean;
  apiStatus: 'active' | 'beta' | 'planned';
  features: string[];
}> = {
  aras: {
    name: 'Aras Kargo',
    hasApi: true,
    apiStatus: 'active',
    features: ['create_shipment', 'print_label', 'track_package', 'cancel_shipment'],
  },
  yurtici: {
    name: 'Yurtiçi Kargo',
    hasApi: true,
    apiStatus: 'active',
    features: ['create_shipment', 'print_label', 'track_package'],
  },
  mng: {
    name: 'MNG Kargo',
    hasApi: true,
    apiStatus: 'active',
    features: ['create_shipment', 'print_label', 'track_package'],
  },
  ptt: {
    name: 'PTT Kargo',
    hasApi: true,
    apiStatus: 'beta',
    features: ['create_shipment', 'print_label'],
  },
  ups: {
    name: 'UPS',
    hasApi: true,
    apiStatus: 'active',
    features: ['create_shipment', 'print_label', 'track_package', 'international'],
  },
  dhl: {
    name: 'DHL',
    hasApi: true,
    apiStatus: 'active',
    features: ['create_shipment', 'print_label', 'track_package', 'international'],
  },
  fedex: {
    name: 'FedEx',
    hasApi: true,
    apiStatus: 'planned',
    features: ['create_shipment', 'print_label', 'track_package'],
  },
};

// Export shipping data to CSV
export function exportShippingData(shipments: ShippingLabel[]): string {
  const headers = [
    'Takip No',
    'Alıcı',
    'Şehir',
    'Ağırlık',
    'Parça',
    'Sipariş No',
    'Platform',
    'Tarih',
  ];
  
  const rows = shipments.map(s => [
    s.shipment.trackingNumber,
    s.recipient.name,
    s.recipient.city,
    s.shipment.weight,
    s.shipment.pieceCount,
    s.orderInfo.orderId,
    s.orderInfo.platform,
    s.orderInfo.date,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export { createCanvas };
