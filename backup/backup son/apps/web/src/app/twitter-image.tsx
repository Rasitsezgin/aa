import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Pazaryonetimi — AI Destekli E-ticaret Yönetim Platformu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        opacity: 0.15,
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: 'white',
                        }}
                    >
                        P
                    </div>
                    <span
                        style={{
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: 'white',
                        }}
                    >
                        pazaryonetimi
                    </span>
                </div>
                <div
                    style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        maxWidth: '900px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <span>AI Destekli E-ticaret</span>
                    <span
                        style={{
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Yönetim Platformu
                    </span>
                </div>
                <p
                    style={{
                        fontSize: '20px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        maxWidth: '700px',
                        marginTop: '16px',
                    }}
                >
                    Trendyol, Hepsiburada, Amazon, N11 — Tüm pazaryerlerinizi tek platformdan yönetin
                </p>
                <p
                    style={{
                        position: 'absolute',
                        bottom: '24px',
                        fontSize: '16px',
                        color: '#64748b',
                    }}
                >
                    pazaryonetimi.com
                </p>
            </div>
        ),
        { ...size }
    );
}
