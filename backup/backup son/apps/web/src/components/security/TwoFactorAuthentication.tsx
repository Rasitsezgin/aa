'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  QrCode,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';

// Types
interface TwoFactorDevice {
  id: string;
  name: string;
  type: 'authenticator' | 'email' | 'sms';
  lastUsedAt: Date;
  createdAt: Date;
  icon: any;
  color: string;
  isDefault: boolean;
}

interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

// Demo data
const devices: TwoFactorDevice[] = [
  {
    id: '1',
    name: 'Google Authenticator',
    type: 'authenticator',
    lastUsedAt: new Date(),
    createdAt: new Date('2025-01-15'),
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    isDefault: true,
  },
  {
    id: '2',
    name: 'E-posta (user@example.com)',
    type: 'email',
    lastUsedAt: new Date('2025-02-01'),
    createdAt: new Date('2025-01-20'),
    icon: Mail,
    color: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    isDefault: false,
  },
];

const backupCodes: BackupCode[] = [
  { code: 'XXXX-XXXX-XXXX', used: true, usedAt: new Date('2025-01-28') },
  { code: 'YYYY-YYYY-YYYY', used: false },
  { code: 'ZZZZ-ZZZZ-ZZZZ', used: false },
  { code: 'AAAA-AAAA-AAAA', used: false },
  { code: 'BBBB-BBBB-BBBB', used: false },
  { code: 'CCCC-CCCC-CCCC', used: false },
];

// Device Card
function DeviceCard({
  device,
  onRemove,
  onSetDefault,
}: {
  device: TwoFactorDevice;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  const Icon = device.icon;
  
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${device.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{device.name}</h4>
          <p className="text-xs text-gray-500 mt-1">
            Oluşturuldu: {device.createdAt.toLocaleDateString('tr-TR')}
          </p>
          {device.isDefault && (
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
              Varsayılan
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-600 dark:text-gray-400">Son Kullanım</span>
        <span className="font-medium">
          {device.lastUsedAt.toLocaleDateString('tr-TR')}
        </span>
      </div>
      
      <div className="flex gap-2">
        {!device.isDefault && (
          <button
            onClick={() => onSetDefault(device.id)}
            className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 text-sm font-medium"
          >
            Varsayılan Yap
          </button>
        )}
        <button
          onClick={() => onRemove(device.id)}
          className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 text-sm"
        >
          <Trash2 className="w-4 h-4 inline mr-1" />
          Sil
        </button>
      </div>
    </motion.div>
  );
}

// Setup Modal
function SetupModal({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<'method' | 'setup' | 'verify' | 'backup'>('method');
  const [method, setMethod] = useState<'authenticator' | 'email' | 'sms'>('authenticator');
  const [code, setCode] = useState('');
  const [showQR, setShowQR] = useState(true);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">2FA Kurulumu</h3>
            <p className="text-blue-100 text-sm mt-1">Adım {step === 'method' ? 1 : step === 'setup' ? 2 : step === 'verify' ? 3 : 4}/4</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {step === 'method' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                İki faktörlü kimlik doğrulama yöntemi seçin
              </p>
              
              {[
                { value: 'authenticator', icon: Smartphone, label: 'Authenticator Uygulaması', desc: 'Google Authenticator, Authy' },
                { value: 'email', icon: Mail, label: 'E-posta', desc: 'Doğrulama kodu e-postayla gönderilir' },
                { value: 'sms', icon: Key, label: 'SMS', desc: 'Doğrulama kodu SMS ile gönderilir' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    name="method"
                    value={opt.value}
                    checked={method === opt.value}
                    onChange={e => setMethod(e.target.value as any)}
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
              
              <button
                onClick={() => setStep('setup')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Devam Et
              </button>
            </>
          )}
          
          {step === 'setup' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                QR kodunu tarayın veya manuel anahtarı girin
              </p>
              
              {method === 'authenticator' && (
                <>
                  {showQR ? (
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center h-40">
                      <QrCode className="w-24 h-24 text-gray-400" />
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-center font-mono text-sm text-gray-900 dark:text-white break-all">
                        JBSWY3DPEBLW64TMMQ======
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-full px-4 py-2 text-blue-600 dark:text-blue-400 text-sm font-medium"
                  >
                    {showQR ? 'Manuel Anahtarı Göster' : 'QR Kodunu Göster'}
                  </button>
                </>
              )}
              
              {method !== 'authenticator' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                  Verification code will be sent to your {method === 'email' ? 'email address' : 'phone number'}
                </div>
              )}
              
              <button
                onClick={() => setStep('verify')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Devam Et
              </button>
            </>
          )}
          
          {step === 'verify' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Doğrulama kodunu girin
              </p>
              
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-2 text-center text-2xl tracking-widest font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
              
              <button
                onClick={() => setStep('backup')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Doğrula
              </button>
            </>
          )}
          
          {step === 'backup' && (
            <>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
                <p className="flex items-center gap-2 font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  Yedek Kodları Kaydedin
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Bu kodları güvenli bir yerde saklayın. Telefonunuza erişemiyorsanız bu kodları kullanabilirsiniz.
                </p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                {['XXXX-XXXX-1', 'XXXX-XXXX-2', 'XXXX-XXXX-3', 'XXXX-XXXX-4'].map((code, i) => (
                  <div key={i} className="flex items-center justify-between text-sm font-mono text-gray-900 dark:text-white">
                    <span>{code}</span>
                    <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                ))}
              </div>
              
              <button
                onClick={onComplete}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Kurulumu Tamamla
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Component
export function TwoFactorAuthentication() {
  const [localDevices, setLocalDevices] = useState(devices);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [enabled2FA, setEnabled2FA] = useState(true);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            İki Faktörlü Kimlik Doğrulama
          </h2>
          <p className="text-gray-500 mt-1">Hesabınızı ek güvenlik katmanıyla koruyun</p>
        </div>
        
        <label className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
          <input
            type="checkbox"
            checked={enabled2FA}
            onChange={e => setEnabled2FA(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-medium text-blue-700 dark:text-blue-400">Etkinleştirildi</span>
        </label>
      </div>
      
      {/* Status */}
      {enabled2FA && (
        <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-4 border border-green-200 dark:border-green-500/30 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800 dark:text-green-300">
            <p className="font-semibold">İki faktörlü kimlik doğrulama aktif</p>
            <p className="mt-1">Hesabınız ekstra güvenlik katmanıyla korunmaktadır.</p>
          </div>
        </div>
      )}
      
      {/* Devices Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Bağlı Cihazlar</h3>
          <button
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Cihaz Ekle
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localDevices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onRemove={(id) => setLocalDevices(prev => prev.filter(d => d.id !== id))}
              onSetDefault={(id) => setLocalDevices(prev => prev.map(d => ({ ...d, isDefault: d.id === id })))}
            />
          ))}
        </div>
      </div>
      
      {/* Backup Codes Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-600" />
            Yedek Kodları
          </h3>
          <button className="flex items-center gap-2 px-3 py-1 text-sm bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-500/30">
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Telefonunuza erişemiyorsanız, bu kodları kullanarak hesabınıza giriş yapabilirsiniz. Her kod sadece bir kez kullanılabilir.
        </p>
        
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {backupCodes.map((backup, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                backup.used
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  : 'bg-blue-50 dark:bg-blue-500/10'
              }`}
            >
              <span className="font-mono text-sm">{backup.code}</span>
              <div className="flex items-center gap-2">
                {backup.used && (
                  <span className="text-xs text-gray-500">
                    {backup.usedAt?.toLocaleDateString('tr-TR')}
                  </span>
                )}
                {backup.used ? (
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                ) : (
                  <Copy className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-700" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-gray-500">
          Kalan: {backupCodes.filter(c => !c.used).length} / {backupCodes.length}
        </p>
      </div>
      
      {/* Security Tips */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-6 border border-blue-200 dark:border-blue-500/30">
        <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-300">Güvenlik İpuçları</h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li>✓ Yedek kodlarınızı güvenli bir yerde saklay ın</li>
          <li>✓ Cihazlarınızda ekran kilidi etkinleştirin</li>
          <li>✓ Düzenli olarak e-posta ve telefon numaranızı güncelleyin</li>
          <li>✓ Güvenilir cihazlar listesini düzenli kontrol edin</li>
        </ul>
      </div>
      
      {/* Setup Modal */}
      {showSetupModal && (
        <SetupModal
          onClose={() => setShowSetupModal(false)}
          onComplete={() => {
            setShowSetupModal(false);
            setLocalDevices([...localDevices, {
              id: Date.now().toString(),
              name: 'Yeni Cihaz',
              type: 'authenticator',
              lastUsedAt: new Date(),
              createdAt: new Date(),
              icon: Smartphone,
              color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
              isDefault: false,
            }]);
          }}
        />
      )}
    </div>
  );
}

export default TwoFactorAuthentication;
