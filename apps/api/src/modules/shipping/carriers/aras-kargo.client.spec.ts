import {
  buildSetOrderSoapBody,
  escapeXml,
  isArasSuccessCode,
  mapArasStatusToTrackingStatus,
  parseGetQueryJsonResponse,
  parseSetOrderResponse,
  resolveArasApiUrl,
} from './aras-kargo.client';

describe('aras-kargo.client', () => {
  it('escapes XML entities', () => {
    expect(escapeXml(`a&b<c>"'`)).toBe('a&amp;b&lt;c&gt;&quot;&apos;');
  });

  it('builds SetOrder SOAP body with required fields', () => {
    const body = buildSetOrderSoapBody(
      { apiUser: 'user1', apiPassword: 'pass1', customerCode: 'CUST01' },
      {
        integrationCode: 'ORD-1',
        receiverName: 'Ali Yılmaz',
        receiverAddress: 'Atatürk Cad. No:5',
        receiverPhone: '05551234567',
        receiverCity: 'Ankara',
        receiverDistrict: 'Çankaya',
        weight: 2,
        description: 'Test',
      },
    );

    expect(body).toContain('<UserName>CUST01</UserName>');
    expect(body).toContain('<IntegrationCode>ORD-1</IntegrationCode>');
    expect(body).toContain('<ReceiverCityName>Ankara</ReceiverCityName>');
    expect(body).toContain('<userName>user1</userName>');
  });

  it('parses successful SetOrder response', () => {
    const xml = `
      <SetOrderResponse xmlns="http://tempuri.org/">
        <SetOrderResult>
          <OrderResultInfo>
            <ResultCode>0</ResultCode>
            <ResultMessage>OK</ResultMessage>
            <InvoiceKey>AR123456</InvoiceKey>
            <OrgReceiverCustId>999</OrgReceiverCustId>
          </OrderResultInfo>
        </SetOrderResult>
      </SetOrderResponse>
    `;

    const result = parseSetOrderResponse(xml);
    expect(result.resultCode).toBe('0');
    expect(result.invoiceKey).toBe('AR123456');
    expect(isArasSuccessCode(result.resultCode)).toBe(true);
  });

  it('maps Aras status text to tracking status', () => {
    expect(mapArasStatusToTrackingStatus('Kargo teslim edildi')).toBe(
      'delivered',
    );
    expect(mapArasStatusToTrackingStatus('Dağıtımda')).toBe('out-for-delivery');
    expect(mapArasStatusToTrackingStatus('Aktarma merkezinde')).toBe(
      'in-transit',
    );
  });

  it('parses GetQueryJSON response payload', () => {
    const xml = `
      <GetQueryJSONResponse xmlns="http://tempuri.org/">
        <GetQueryJSONResult>{"DURUM_ACIKLAMA":"Kargo teslim edildi","SUBE":"Ankara"}</GetQueryJSONResult>
      </GetQueryJSONResponse>
    `;

    const tracking = parseGetQueryJsonResponse(xml, 'AR123456');
    expect(tracking.trackingNumber).toBe('AR123456');
    expect(tracking.status).toBe('delivered');
    expect(tracking.events[0].description).toContain('teslim');
  });

  it('uses production endpoint by default in production', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    delete process.env.ARAS_API_URL;

    expect(resolveArasApiUrl()).toContain('customerws.araskargo.com.tr');

    process.env.NODE_ENV = previous;
  });
});
