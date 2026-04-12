
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Pazaryonetimi.com Blog';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
    // Gerçek uygulamada burada blog post verisini fetch edebilirsiniz.
    // Şimdilik slug'dan başlık üretiyoruz.
    const post = {
        title: 'E-ticarette Yapay Zeka Devrimi ve Geleceğin Teknolojileri', // Default Title
        author: 'Erdem Kaya',
    };

    // Mock data lookup (Basit bir örnek)
    if (params.slug === '1') post.title = "E-ticarette Yapay Zeka Devrimi: 2024 ve Ötesi";
    if (params.slug === '2') post.title = "Pazaryeri Entegrasyonlarında Dikkat Edilmesi Gerekenler";
    if (params.slug === '3') post.title = "Stok Yönetiminde Otomasyonun Gücü";

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#02040a',
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'linear-gradient(to bottom right, #2563eb 0%, transparent 40%, transparent 60%, #9333ea 100%)',
                        opacity: 0.2,
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '40px 80px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        {/* Logo Placeholder */}
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa', letterSpacing: '-0.05em' }}>
                            PAZARYONETIMI.COM
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: 60,
                            fontStyle: 'normal',
                            fontWeight: 900,
                            lineHeight: 1.2,
                            marginBottom: '40px',
                            textShadow: '0 0 40px rgba(59, 130, 246, 0.5)',
                            background: 'linear-gradient(to right, #fff, #94a3b8)',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        {post.title}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                        }}
                    >
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 20,
                                fontWeight: 'bold',
                            }}
                        >
                            EK
                        </div>
                        <div style={{ fontSize: 24, color: '#94a3b8' }}>
                            {post.author}
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
