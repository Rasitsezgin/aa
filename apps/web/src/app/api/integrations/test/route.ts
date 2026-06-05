export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string })?.tenantId;
    const accessToken = (session?.user as { accessToken?: string })?.accessToken;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, credentials } = body;

    if (!platform || !credentials) {
      return NextResponse.json(
        { error: "Platform and credentials are required" },
        { status: 400 },
      );
    }

    let connectionSuccess = false;
    let message = "Bağlantı başarılı!";

    try {
      switch (platform.toLowerCase()) {
        case "trendyol": {
          const { supplierId, apiKey, apiSecret, isTestMode } = credentials;
          if (!supplierId || !apiKey || !apiSecret) {
            return NextResponse.json(
              { error: "Eksik Trendyol bilgileri" },
              { status: 400 },
            );
          }

          const trendyolAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString(
            "base64",
          );
          const baseUrl =
            isTestMode === "true" || isTestMode === true
              ? "https://stageapi.trendyol.com/sapigw"
              : "https://api.trendyol.com/sapigw";

          const trendyolRes = await fetch(
            `${baseUrl}/suppliers/${encodeURIComponent(supplierId)}/products?page=0&size=1`,
            {
              method: "GET",
              headers: {
                Authorization: `Basic ${trendyolAuth}`,
                Accept: "application/json",
                "User-Agent": "PazarYonetimi/1.0",
              },
            },
          );

          if (trendyolRes.ok) {
            connectionSuccess = true;
            message = "Trendyol API bağlantısı doğrulandı.";
          } else {
            message = `Trendyol API Hatası: HTTP ${trendyolRes.status}`;
          }
          break;
        }

        case "hepsiburada": {
          const { apiKey, merchantId } = credentials;
          if (!apiKey || !merchantId) {
            return NextResponse.json(
              { error: "Eksik Hepsiburada bilgileri" },
              { status: 400 },
            );
          }

          const endpoints = [
            `https://listing-external-sit.hepsiburada.com/ListingExternalService/v1/Listings/merchantid/${encodeURIComponent(merchantId)}?page=1&size=1`,
            `https://listing-external-sit.hepsiburada.com/ListingExternalService/v1/Listings?merchantId=${encodeURIComponent(merchantId)}&page=1&size=1`,
          ];

          for (const url of endpoints) {
            const hbRes = await fetch(url, {
              headers: {
                Authorization: `Basic ${apiKey}`,
                Accept: "application/json",
                "User-Agent": "PazarYonetimi/1.0",
              },
            });

            if (hbRes.ok) {
              connectionSuccess = true;
              message = "Hepsiburada API bağlantısı doğrulandı.";
              break;
            }

            if (hbRes.status === 401 || hbRes.status === 403) {
              message = "Hepsiburada API kimlik bilgileri geçersiz.";
              break;
            }
          }

          if (!connectionSuccess && message === "Bağlantı başarılı!") {
            message = "Hepsiburada API testi başarısız.";
          }
          break;
        }

        case "n11": {
          const { apiKey, apiSecret } = credentials;
          if (!apiKey || !apiSecret) {
            return NextResponse.json(
              { error: "Eksik N11 bilgileri" },
              { status: 400 },
            );
          }

          const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://www.n11.com/ws/schemas">
  <soapenv:Header>
    <sch:Authentication>
      <appKey>${escapeXml(apiKey)}</appKey>
      <appSecret>${escapeXml(apiSecret)}</appSecret>
    </sch:Authentication>
  </soapenv:Header>
  <soapenv:Body>
    <sch:GetProductListRequest>
      <pagingData>
        <currentPage>0</currentPage>
        <pageSize>1</pageSize>
      </pagingData>
    </sch:GetProductListRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

          const n11Res = await fetch("https://api.n11.com/ws/ProductService/", {
            method: "POST",
            headers: {
              "Content-Type": "text/xml; charset=utf-8",
              SOAPAction: "",
            },
            body: soapBody,
          });

          if (n11Res.ok) {
            const text = await n11Res.text();
            const status = text
              .match(/<status>([^<]*)<\/status>/i)?.[1]
              ?.toLowerCase();
            if (!status || status === "success") {
              connectionSuccess = true;
              message = "N11 API bağlantısı doğrulandı.";
            } else {
              message =
                text.match(/<errorMessage>([^<]*)<\/errorMessage>/i)?.[1] ||
                "N11 API kimlik bilgileri geçersiz.";
            }
          } else {
            message = `N11 API Hatası: HTTP ${n11Res.status}`;
          }
          break;
        }

        case "ciceksepeti": {
          const { apiKey } = credentials;
          if (!apiKey) {
            return NextResponse.json(
              { error: "Eksik Çiçeksepeti API anahtarı" },
              { status: 400 },
            );
          }

          const csRes = await fetch(
            "https://apis.ciceksepeti.com/api/v1/Products",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
              },
              body: JSON.stringify({ pageSize: 1, page: 1 }),
            },
          );

          if (csRes.ok) {
            connectionSuccess = true;
            message = "Çiçeksepeti API bağlantısı doğrulandı.";
          } else if (csRes.status === 401 || csRes.status === 403) {
            message = "Çiçeksepeti API anahtarı geçersiz.";
          } else {
            message = `Çiçeksepeti API Hatası: HTTP ${csRes.status}`;
          }
          break;
        }

        case "amazon-tr":
        case "amazon-us":
        case "amazon-uk":
        case "amazon-de":
          connectionSuccess = true;
          message =
            "Kimlik bilgileri kaydedildi. Amazon sipariş/stok sync için SP-API entegrasyonu gereklidir.";
          break;

        default:
          connectionSuccess = false;
          message = `${platform} için bağlantı testi henüz desteklenmiyor.`;
          break;
      }
    } catch (apiError: unknown) {
      const err = apiError as Error;
      message = `Bağlantı sırasında hata: ${err.message || "Bilinmeyen hata"}`;
      connectionSuccess = false;
    }

    if (connectionSuccess) {
      return NextResponse.json({ success: true, message });
    }

    return NextResponse.json(
      { error: message, success: false },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error testing integration:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
