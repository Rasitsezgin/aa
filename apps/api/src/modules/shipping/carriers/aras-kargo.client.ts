import { BadRequestException } from '@nestjs/common';

const TEMPURI_NS = 'http://tempuri.org/';
const DEFAULT_PROD_URL =
  'https://customerws.araskargo.com.tr/arascargoservice.asmx';
const DEFAULT_TEST_URL =
  'https://customerservicestest.araskargo.com.tr/arascargoservice/arascargoservice.asmx';

export interface ArasKargoClientConfig {
  apiUrl?: string;
  apiUser: string;
  apiPassword: string;
  customerCode?: string;
}

export interface ArasSetOrderInput {
  integrationCode: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  receiverCity: string;
  receiverDistrict: string;
  weight: number;
  volumetricWeight?: number;
  description?: string;
  isCod?: boolean;
  codAmount?: number;
}

export interface ArasSetOrderResult {
  resultCode: string;
  resultMessage: string;
  invoiceKey: string;
  orgReceiverCustId: string;
}

export interface ArasTrackingEvent {
  date: Date;
  status: string;
  location?: string;
  description: string;
}

export interface ArasTrackingResult {
  trackingNumber: string;
  status:
    | 'preparing'
    | 'shipped'
    | 'in-transit'
    | 'out-for-delivery'
    | 'delivered'
    | 'returned'
    | 'exception';
  events: ArasTrackingEvent[];
  deliveredAt?: Date;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function resolveArasApiUrl(apiUrl?: string): string {
  const trimmed = apiUrl?.trim();
  if (trimmed) {
    return trimmed;
  }
  if (process.env.ARAS_API_URL?.trim()) {
    return process.env.ARAS_API_URL.trim();
  }
  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PROD_URL;
  }
  return DEFAULT_TEST_URL;
}

export function buildSetOrderSoapBody(
  config: ArasKargoClientConfig,
  order: ArasSetOrderInput,
): string {
  const orderUser = config.customerCode?.trim() || config.apiUser;
  const weight = Math.max(0.1, order.weight).toFixed(2);
  const volumetricWeight = Math.max(
    0.1,
    order.volumetricWeight ?? order.weight,
  ).toFixed(2);
  const codAmount =
    order.isCod && order.codAmount
      ? order.codAmount.toFixed(2)
      : '0';
  const isCod = order.isCod ? '1' : '0';

  return `<SetOrder xmlns="${TEMPURI_NS}">
  <orderInfo>
    <Order>
      <UserName>${escapeXml(orderUser)}</UserName>
      <Password>${escapeXml(config.apiPassword)}</Password>
      <TradingWaybillNumber>${escapeXml(order.integrationCode)}</TradingWaybillNumber>
      <InvoiceNumber>${escapeXml(order.integrationCode)}</InvoiceNumber>
      <ReceiverName>${escapeXml(order.receiverName)}</ReceiverName>
      <ReceiverAddress>${escapeXml(order.receiverAddress)}</ReceiverAddress>
      <ReceiverPhone1>${escapeXml(order.receiverPhone)}</ReceiverPhone1>
      <ReceiverCityName>${escapeXml(order.receiverCity)}</ReceiverCityName>
      <ReceiverTownName>${escapeXml(order.receiverDistrict)}</ReceiverTownName>
      <ReceiverDistrictName>${escapeXml(order.receiverDistrict)}</ReceiverDistrictName>
      <Weight>${weight}</Weight>
      <VolumetricWeight>${volumetricWeight}</VolumetricWeight>
      <PieceCount>1</PieceCount>
      <IntegrationCode>${escapeXml(order.integrationCode)}</IntegrationCode>
      <Description>${escapeXml(order.description || 'Pazaryonetimi gönderi')}</Description>
      <PayorTypeCode>1</PayorTypeCode>
      <IsWorldWide>0</IsWorldWide>
      <IsCod>${isCod}</IsCod>
      <CodAmount>${codAmount}</CodAmount>
      <Country>Türkiye</Country>
      <CountryCode>TR</CountryCode>
    </Order>
  </orderInfo>
  <userName>${escapeXml(config.apiUser)}</userName>
  <password>${escapeXml(config.apiPassword)}</password>
</SetOrder>`;
}

export function buildGetQueryJsonSoapBody(
  config: ArasKargoClientConfig,
  trackingNumber: string,
): string {
  const queryInfo = `<QueryInfo><QueryType>5</QueryType><TrackingNumber>${escapeXml(trackingNumber)}</TrackingNumber></QueryInfo>`;

  return `<GetQueryJSON xmlns="${TEMPURI_NS}">
  <loginInfo>
    <UserName>${escapeXml(config.apiUser)}</UserName>
    <Password>${escapeXml(config.apiPassword)}</Password>
  </loginInfo>
  <queryInfo>${escapeXml(queryInfo)}</queryInfo>
</GetQueryJSON>`;
}

export function buildCancelDispatchSoapBody(
  config: ArasKargoClientConfig,
  integrationCode: string,
): string {
  return `<CancelDispatch xmlns="${TEMPURI_NS}">
  <userName>${escapeXml(config.apiUser)}</userName>
  <password>${escapeXml(config.apiPassword)}</password>
  <integrationCode>${escapeXml(integrationCode)}</integrationCode>
</CancelDispatch>`;
}

export function buildGetCityListSoapBody(config: ArasKargoClientConfig): string {
  return `<GetCityList xmlns="${TEMPURI_NS}">
  <userName>${escapeXml(config.apiUser)}</userName>
  <password>${escapeXml(config.apiPassword)}</password>
</GetCityList>`;
}

function buildSoapEnvelope(body: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`;
}

export function extractXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? '';
}

export function parseSetOrderResponse(xml: string): ArasSetOrderResult {
  const fault = extractXmlTag(xml, 'faultstring');
  if (fault) {
    throw new BadRequestException(`Aras SetOrder hatası: ${fault}`);
  }

  const resultCode = extractXmlTag(xml, 'ResultCode');
  const resultMessage = extractXmlTag(xml, 'ResultMessage');
  const invoiceKey = extractXmlTag(xml, 'InvoiceKey');
  const orgReceiverCustId = extractXmlTag(xml, 'OrgReceiverCustId');

  if (!resultCode) {
    throw new BadRequestException('Aras SetOrder yanıtı okunamadı');
  }

  return {
    resultCode,
    resultMessage,
    invoiceKey,
    orgReceiverCustId,
  };
}

export function isArasSuccessCode(resultCode: string): boolean {
  return resultCode === '0' || resultCode === '00';
}

function decodeJsonPayload(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return (parsed[0] as Record<string, unknown>) ?? null;
    }
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
}

export function mapArasStatusToTrackingStatus(
  statusText: string,
): ArasTrackingResult['status'] {
  const normalized = statusText.toLowerCase();

  if (
    normalized.includes('teslim') &&
    !normalized.includes('teslim edilemedi')
  ) {
    return 'delivered';
  }
  if (normalized.includes('dağıtım') || normalized.includes('dagitim')) {
    return 'out-for-delivery';
  }
  if (normalized.includes('iade') || normalized.includes('return')) {
    return 'returned';
  }
  if (
    normalized.includes('hazırl') ||
    normalized.includes('hazir') ||
    normalized.includes('kabul')
  ) {
    return 'preparing';
  }
  if (normalized.includes('çıkış') || normalized.includes('cikis')) {
    return 'shipped';
  }
  if (normalized.includes('sorun') || normalized.includes('exception')) {
    return 'exception';
  }

  return 'in-transit';
}

export function parseGetQueryJsonResponse(
  xml: string,
  trackingNumber: string,
): ArasTrackingResult {
  const fault = extractXmlTag(xml, 'faultstring');
  if (fault) {
    throw new BadRequestException(`Aras takip hatası: ${fault}`);
  }

  const rawResult =
    extractXmlTag(xml, 'GetQueryJSONResult') ||
    extractXmlTag(xml, 'GetQueryXMLResult');

  const jsonPayload = decodeJsonPayload(rawResult);
  const statusText = String(
    jsonPayload?.DURUM_ACIKLAMA ||
      jsonPayload?.DURUM ||
      jsonPayload?.status ||
      jsonPayload?.Status ||
      extractXmlTag(rawResult, 'DURUM_ACIKLAMA') ||
      'Kargo yolda',
  );

  const eventDateRaw = String(
    jsonPayload?.TARIH ||
      jsonPayload?.ISLEM_TARIHI ||
      jsonPayload?.date ||
      '',
  );
  const eventDate = eventDateRaw ? new Date(eventDateRaw) : new Date();
  const location = String(
    jsonPayload?.SUBE ||
      jsonPayload?.CIKIS_SUBESI ||
      jsonPayload?.VARIS_SUBESI ||
      '',
  );
  const mappedStatus = mapArasStatusToTrackingStatus(statusText);

  return {
    trackingNumber,
    status: mappedStatus,
    events: [
      {
        date: Number.isNaN(eventDate.getTime()) ? new Date() : eventDate,
        status: mappedStatus,
        location: location || undefined,
        description: statusText,
      },
    ],
    deliveredAt: mappedStatus === 'delivered' ? new Date() : undefined,
  };
}

export function parseCancelDispatchResponse(xml: string): boolean {
  const fault = extractXmlTag(xml, 'faultstring');
  if (fault) {
    throw new BadRequestException(`Aras iptal hatası: ${fault}`);
  }

  const resultCode =
    extractXmlTag(xml, 'ResultCode') || extractXmlTag(xml, 'resultCode');
  if (resultCode) {
    return isArasSuccessCode(resultCode);
  }

  return !xml.toLowerCase().includes('fault');
}

export class ArasKargoClient {
  private readonly apiUrl: string;

  constructor(private readonly config: ArasKargoClientConfig) {
    if (!config.apiUser?.trim() || !config.apiPassword?.trim()) {
      throw new BadRequestException('Aras Kargo kullanıcı adı ve şifre zorunlu');
    }
    this.apiUrl = resolveArasApiUrl(config.apiUrl);
  }

  private async postSoap(action: string, body: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `"${TEMPURI_NS}${action}"`,
      },
      body: buildSoapEnvelope(body),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new BadRequestException(
        `Aras Kargo API HTTP ${response.status}: ${text.slice(0, 200)}`,
      );
    }

    return text;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const xml = await this.postSoap(
        'GetCityList',
        buildGetCityListSoapBody(this.config),
      );
      const fault = extractXmlTag(xml, 'faultstring');
      if (fault) {
        return { success: false, message: fault };
      }
      return {
        success: true,
        message: 'Aras Kargo API bağlantısı doğrulandı',
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  async setOrder(order: ArasSetOrderInput): Promise<ArasSetOrderResult> {
    const xml = await this.postSoap(
      'SetOrder',
      buildSetOrderSoapBody(this.config, order),
    );
    const result = parseSetOrderResponse(xml);

    if (!isArasSuccessCode(result.resultCode)) {
      throw new BadRequestException(
        `Aras gönderi reddedildi (${result.resultCode}): ${result.resultMessage || 'Bilinmeyen hata'}`,
      );
    }

    return result;
  }

  async trackShipment(trackingNumber: string): Promise<ArasTrackingResult> {
    const xml = await this.postSoap(
      'GetQueryJSON',
      buildGetQueryJsonSoapBody(this.config, trackingNumber),
    );
    return parseGetQueryJsonResponse(xml, trackingNumber);
  }

  async cancelDispatch(integrationCode: string): Promise<boolean> {
    const xml = await this.postSoap(
      'CancelDispatch',
      buildCancelDispatchSoapBody(this.config, integrationCode),
    );
    return parseCancelDispatchResponse(xml);
  }
}
