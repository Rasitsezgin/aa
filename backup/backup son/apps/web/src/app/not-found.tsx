import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-white text-slate-900">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-5xl font-black">404</h1>
        <p className="text-slate-600">Aradiginiz sayfa bulunamadi.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
        >
          Ana Sayfaya Don
        </Link>
      </div>
    </main>
  );
}
