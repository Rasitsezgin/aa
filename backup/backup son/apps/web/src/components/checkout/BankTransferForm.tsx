'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  FileText,
  Upload,
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  bankLogo: string;
  accountName: string;
  iban: string;
  branch: string;
  accountNumber: string;
  color: string;
}

const bankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'Garanti BBVA',
    bankLogo: '🏦',
    accountName: 'Pazar Yönetimi A.Ş.',
    iban: 'TR12 0006 2000 0000 0006 2945 12',
    branch: 'İstanbul Şubesi',
    accountNumber: '6294512',
    color: 'from-green-500 to-green-700',
  },
  {
    id: '2',
    bankName: 'İş Bankası',
    bankLogo: '🏛️',
    accountName: 'Pazar Yönetimi A.Ş.',
    iban: 'TR34 0006 4000 0011 2345 6789 01',
    branch: 'Levent Şubesi',
    accountNumber: '1234567890',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: '3',
    bankName: 'Yapı Kredi',
    bankLogo: '💳',
    accountName: 'Pazar Yönetimi A.Ş.',
    iban: 'TR56 0006 7010 0000 0012 3456 78',
    branch: 'Maslak Şubesi',
    accountNumber: '12345678',
    color: 'from-indigo-500 to-purple-700',
  },
];

function BankCard({
  bank,
  isSelected,
  onSelect,
}: {
  bank: BankAccount;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-4 ring-orange-500' : ''}
      `}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${bank.color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{bank.bankLogo}</span>
            <div>
              <h4 className="font-bold text-lg">{bank.bankName}</h4>
              <p className="text-white/80 text-sm">{bank.branch}</p>
            </div>
          </div>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="bg-white dark:bg-gray-800 p-4 space-y-3">
        {/* Account Name */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Hesap Sahibi</p>
          <p className="font-semibold">{bank.accountName}</p>
        </div>

        {/* IBAN */}
        <div>
          <p className="text-xs text-gray-500 mb-1">IBAN</p>
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <code className="font-mono text-sm">{bank.iban}</code>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(bank.iban, `iban-${bank.id}`);
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {copiedField === `iban-${bank.id}` ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Account Number */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Hesap No</p>
            <div className="flex items-center gap-2">
              <code className="font-mono">{bank.accountNumber}</code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(bank.accountNumber, `account-${bank.id}`);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {copiedField === `account-${bank.id}` ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BankTransferForm() {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [transferNote, setTransferNote] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const transferReference = transferNote.trim();

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 flex items-start gap-3 border border-orange-200 dark:border-orange-500/30"
      >
        <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-orange-800 dark:text-orange-300">
            Önemli Bilgilendirme
          </p>
          <ul className="text-sm text-orange-700 dark:text-orange-400 mt-2 space-y-1">
            <li>• Açıklama kısmına <strong>sipariş numaranızı</strong> yazmayı unutmayın</li>
            <li>• Ödemeniz <strong>1-24 saat</strong> içinde admin tarafından kontrol edilecek</li>
            <li>• Onay sonrası e-posta ve SMS ile bilgilendirileceksiniz</li>
          </ul>
        </div>
      </motion.div>

      {/* Bank Selection */}
      <div>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Banka Hesabı Seçin
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankAccounts.map(bank => (
            <BankCard
              key={bank.id}
              bank={bank}
              isSelected={selectedBank === bank.id}
              onSelect={() => setSelectedBank(bank.id)}
            />
          ))}
        </div>
      </div>

      {/* Transfer Reference */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Transfer Açıklaması
        </h4>
        <input
          value={transferNote}
          onChange={e => setTransferNote(e.target.value)}
          placeholder="Sipariş numaranızı girin (örn: ORD-2025-000123)"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm"
        />
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 mb-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Transfer açıklamasına sipariş numaranızı birebir yazın:
          </p>
          <div className="mt-3 flex items-center gap-3">
            <code className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg font-mono text-lg font-bold text-center">
              {transferReference || 'Sipariş numarası bekleniyor'}
            </code>
            <button
              onClick={() => transferReference && navigator.clipboard.writeText(transferReference)}
              disabled={!transferReference}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Upload (Optional) */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Dekont Yükle (İsteğe Bağlı)
        </h4>
        <p className="text-sm text-gray-500 mb-3">
          Transfer dekontunu yüklerseniz onay süreciniz hızlanır.
        </p>

        <label className="block">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
            {receiptFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div className="text-left">
                  <p className="font-semibold">{receiptFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(receiptFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setReceiptFile(null);
                  }}
                  className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-medium">Dekont yüklemek için tıklayın</p>
                <p className="text-sm text-gray-500">PNG, JPG veya PDF - Max 5MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={e => setReceiptFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h4 className="font-semibold mb-4">📋 Süreç Nasıl İşler?</h4>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Sipariş Oluştur', desc: 'Siparişinizi tamamlayın', status: 'completed' },
            { step: 2, title: 'Havale/EFT Yap', desc: 'Banka hesabına transfer yapın', status: 'current' },
            { step: 3, title: 'Admin Onayı', desc: 'Ödemeniz kontrol edilecek', status: 'pending' },
            { step: 4, title: 'Sipariş Hazırlanır', desc: 'Ürünleriniz paketlenir', status: 'pending' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold
                ${item.status === 'completed' ? 'bg-green-500 text-white' :
                  item.status === 'current' ? 'bg-blue-500 text-white animate-pulse' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-500'}
              `}>
                {item.status === 'completed' ? <Check className="w-5 h-5" /> : item.step}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${item.status === 'pending' ? 'text-gray-400' : ''}`}>
                  {item.title}
                </p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              {item.status === 'current' && (
                <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BankTransferForm;
