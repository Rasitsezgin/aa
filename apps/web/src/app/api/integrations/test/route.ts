import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!(session?.user as any)?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { platform, credentials } = body;

        if (!platform || !credentials) {
            return NextResponse.json({ error: "Platform and credentials are required" }, { status: 400 });
        }

        let connectionSuccess = false;
        let message = "Bağlantı başarılı!";

        try {
            switch (platform.toLowerCase()) {
                case 'trendyol':
                    // Trendyol API connection test
                    const { supplierId, apiKey, apiSecret } = credentials;
                    if (!supplierId || !apiKey || !apiSecret) {
                        return NextResponse.json({ error: "Eksik Trendyol bilgileri" }, { status: 400 });
                    }

                    const trendyolAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

                    const trendyolRes = await fetch(`https://api.trendyol.com/sapigw/suppliers/${supplierId}/v2/products?size=1`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Basic ${trendyolAuth}`,
                            "User-Agent": "PazarYonetimi/1.0",
                        },
                    });

                    if (trendyolRes.ok) {
                        connectionSuccess = true;
                        message = "Trendyol API bağlantısı başarılı! Satıcı ID doğrulandı.";
                    } else {
                        const errText = await trendyolRes.text();
                        console.error("Trendyol API Error:", trendyolRes.status, errText);
                        message = `Trendyol API Hatası: Geçersiz yetkilendirme bilgileri (HTTP ${trendyolRes.status}). Lütfen kontrol edip tekrar deneyin.`;
                        connectionSuccess = false;
                    }
                    break;

                case 'hepsiburada':
                    // Hepsiburada API connection test 
                    const hbUsername = credentials.username;
                    const hbPassword = credentials.password;
                    const merchantId = credentials.merchantId;

                    if (!hbUsername || !hbPassword || !merchantId) {
                        return NextResponse.json({ error: "Eksik Hepsiburada bilgileri" }, { status: 400 });
                    }

                    const hbAuth = Buffer.from(`${hbUsername}:${hbPassword}`).toString("base64");

                    const hbRes = await fetch(`https://oms-api.hepsiburada.com/merchants/${merchantId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Basic ${hbAuth}`,
                            "Accept": "application/json",
                            "User-Agent": "PazarYonetimi/1.0",
                        }
                    });

                    if (hbRes.ok) {
                        connectionSuccess = true;
                        message = "Hepsiburada API bağlantısı başarılı!";
                    } else if (hbRes.status === 401 || hbRes.status === 403) {
                        message = "Hepsiburada API Hatası: Yetkisiz erişim. Bilgilerinizi kontrol edin.";
                        connectionSuccess = false;
                    } else {
                        connectionSuccess = false;
                        message = `Hepsiburada Hatası: HTTP ${hbRes.status}`;
                    }
                    break;

                default:
                    connectionSuccess = false;
                    message = `${platform} için API bağlantı testi henüz uygulanmadı.`;
                    break;
            }
        } catch (apiError: any) {
            console.error("API Fetch Error:", apiError);
            message = `Bağlantı sırasında bir hata oluştu: ${apiError.message || 'Bilinmeyen hata'}. API sunucuları yanıt vermiyor olabilir.`;
            connectionSuccess = false;
        }

        if (connectionSuccess) {
            return NextResponse.json({ success: true, message });
        } else {
            return NextResponse.json({ error: message, success: false }, { status: 400 });
        }

    } catch (error) {
        console.error("Error testing integration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
