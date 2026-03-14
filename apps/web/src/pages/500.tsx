import Head from 'next/head';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 | Sunucu Hatasi</title>
      </Head>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>500</h1>
          <p>Sunucu tarafinda bir hata olustu. Lutfen daha sonra tekrar deneyin.</p>
        </div>
      </main>
    </>
  );
}
