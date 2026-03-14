'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  acceptedFormats?: string[];
}

export function BarcodeScanner({ onScan, onClose, acceptedFormats = ['ean_13', 'ean_8', 'code_128', 'qr_code'] }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanner = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Flash kontrolü
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      setHasFlash(!!capabilities.torch);

      // BarcodeDetector API (Chrome/Edge)
      if ('BarcodeDetector' in window) {
        scanWithBarcodeDetector();
      } else {
        // Fallback: Manuel tarama uyarısı
        setError('Barkod algılama desteklenmiyor. Lütfen barkodu manuel girin.');
      }
    } catch (err) {
      console.error('Kamera erişim hatası:', err);
      setError('Kamera erişimi sağlanamadı. Lütfen izinleri kontrol edin.');
      setIsScanning(false);
    }
  }, []);

  const scanWithBarcodeDetector = async () => {
    // @ts-ignore - BarcodeDetector henüz tüm tarayıcılarda tanımlı değil
    const barcodeDetector = new window.BarcodeDetector({
      formats: acceptedFormats,
    });

    const detectLoop = async () => {
      if (!videoRef.current || !isScanning) return;

      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);

        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          if (barcode.rawValue !== lastScanned) {
            setLastScanned(barcode.rawValue);

            // Başarı titreşimi
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }

            onScan(barcode.rawValue);
          }
        }
      } catch (err) {
        console.error('Barkod algılama hatası:', err);
      }

      if (isScanning) {
        requestAnimationFrame(detectLoop);
      }
    };

    detectLoop();
  };

  const stopScanner = useCallback(() => {
    setIsScanning(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    const newFlashState = !flashOn;

    try {
      await track.applyConstraints({
        // @ts-ignore
        advanced: [{ torch: newFlashState }],
      });
      setFlashOn(newFlashState);
    } catch (err) {
      console.error('Flash toggle hatası:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      if (!mounted) return;
      try {
        setError(null);
        setIsScanning(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Flash kontrolü
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
        setHasFlash(!!capabilities.torch);

        // BarcodeDetector API (Chrome/Edge)
        if ('BarcodeDetector' in window) {
          scanWithBarcodeDetector();
        } else {
          // Fallback: Manuel tarama uyarısı
          setError('Barkod algılama desteklenmiyor. Lütfen barkodu manuel girin.');
        }
      } catch (err) {
        console.error('Kamera erişim hatası:', err);
        setError('Kamera erişimi sağlanamadı. Lütfen izinleri kontrol edin.');
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, []);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <span className="text-white font-medium">Barkod Tara</span>

        <div className="flex gap-2">
          {hasFlash && (
            <button
              onClick={toggleFlash}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
            >
              {flashOn ? (
                <FlashlightOff className="w-6 h-6 text-white" />
              ) : (
                <Flashlight className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          <button
            onClick={() => { stopScanner(); startScanner(); }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Tarama alanı göstergesi */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-48 border-2 border-white/50 rounded-lg relative">
          {/* Köşe çizgileri */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />

          {/* Tarama çizgisi animasyonu */}
          {isScanning && (
            <div className="absolute inset-x-0 h-0.5 bg-primary-500 animate-scan" />
          )}
        </div>
      </div>

      {/* Alt bilgi */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
        {error ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-white text-sm">{error}</p>
          </div>
        ) : lastScanned ? (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-white text-sm">Tespit edildi:</p>
            <p className="text-white font-mono font-bold text-lg">{lastScanned}</p>
          </div>
        ) : (
          <p className="text-white/80 text-center text-sm">
            Barkodu çerçeve içine getirin
          </p>
        )}
      </div>

      {/* CSS for scan animation */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Barkod tarama butonu bileşeni
export function BarcodeScanButton({ onScan }: { onScan: (barcode: string) => void }) {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (barcode: string) => {
    onScan(barcode);
    setShowScanner(false);
  };

  return (
    <>
      <button
        onClick={() => setShowScanner(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Camera className="w-5 h-5" />
        <span>Barkod Tara</span>
      </button>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
