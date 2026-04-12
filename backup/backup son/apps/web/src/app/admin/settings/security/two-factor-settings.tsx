'use client'

import { useState } from "react";
import { generateTwoFactorSecret, verifyTwoFactor, disableTwoFactor } from "@/actions/security";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Check, X, Loader2 } from "lucide-react";

export default function TwoFactorSettings({ defaultEnabled }: { defaultEnabled: boolean }) {
    const [enabled, setEnabled] = useState(defaultEnabled);
    const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'verify'>('idle');
    const [secretData, setSecretData] = useState<{ secret: string, otpauth: string } | null>(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleStartSetup = async () => {
        setLoading(true);
        const res = await generateTwoFactorSecret();
        if ('secret' in res && 'otpauth' in res && res.secret && res.otpauth) {
            setSecretData(res as { secret: string, otpauth: string });
            setSetupStep('qr');
        }
        setLoading(false);
    };

    const handleVerify = async () => {
        setLoading(true);
        setError("");
        const res = await verifyTwoFactor(code);
        if ('success' in res && res.success) {
            setEnabled(true);
            setSetupStep('idle');
            setSecretData(null);
        } else {
            setError(res.error || "Doğrulama başarısız");
        }
        setLoading(false);
    };

    const handleDisable = async () => {
        if (!confirm("2FA'yı devre dışı bırakmak istediğinize emin misiniz?")) return;
        setLoading(true);
        await disableTwoFactor();
        setEnabled(false);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${enabled ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 text-slate-500'}`}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">İki Faktörlü Doğrulama (2FA)</h4>
                        <p className="text-sm text-slate-500 font-medium">
                            {enabled
                                ? "Hesabınız şu anda güvende."
                                : "Hesap güvenliğinizi artırmak için etkinleştirin."}
                        </p>
                    </div>
                </div>

                {!enabled && setupStep === 'idle' && (
                    <button
                        onClick={handleStartSetup}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Kurulumu Başlat"}
                    </button>
                )}

                {enabled && (
                    <button
                        onClick={handleDisable}
                        disabled={loading}
                        className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Devre Dışı Bırak"}
                    </button>
                )}
            </div>

            {setupStep !== 'idle' && secretData && (
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-center">Kurulum Sihirbazı</h3>

                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                        <div className="p-4 bg-white rounded-xl shadow-sm">
                            <QRCodeSVG value={secretData.otpauth} size={180} />
                        </div>
                        <div className="space-y-4 max-w-sm">
                            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <li>Google Authenticator uygulamasını açın.</li>
                                <li>QR kodu taratın.</li>
                                <li>Üretilen 6 haneli kodu aşağıya girin.</li>
                            </ol>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="000 000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 h-12 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-center text-xl font-bold tracking-widest outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={loading || code.length !== 6}
                                    className="px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50"
                                >
                                    <Check />
                                </button>
                            </div>
                            {error && <p className="text-sm font-bold text-red-500">{error}</p>}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={() => setSetupStep('idle')} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                            İptal Et
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
