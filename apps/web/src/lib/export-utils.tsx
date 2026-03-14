'use client';

/**
 * Export utilities for PDF, Excel (CSV), and JSON formats
 * No additional dependencies needed - uses native browser APIs
 */

// ─── CSV Export ───────────────────────────────────────
export function exportToCSV(data: Record<string, any>[], filename: string, headers?: Record<string, string>) {
  if (!data.length) return;

  const keys = Object.keys(headers || data[0]);
  const headerRow = headers ? Object.values(headers) : keys;

  const csvRows = [
    // BOM for Turkish characters in Excel
    '\uFEFF' + headerRow.join(';'),
    ...data.map((row) =>
      keys
        .map((key) => {
          const val = row[key];
          if (val === null || val === undefined) return '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(';')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// ─── JSON Export ──────────────────────────────────────
export function exportToJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

// ─── HTML Report (printable as PDF) ───────────────────
export function exportToPDF(
  title: string,
  data: Record<string, any>[],
  headers?: Record<string, string>,
  options?: { subtitle?: string; companyName?: string; dateRange?: string }
) {
  if (!data.length) return;

  const keys = Object.keys(headers || data[0]);
  const headerLabels = headers ? Object.values(headers) : keys;

  const now = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>${title} - Pazaryönetimi Rapor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 900; color: #1e293b; }
    .logo span { color: #3b82f6; }
    .meta { text-align: right; font-size: 12px; color: #64748b; }
    h1 { font-size: 20px; color: #1e293b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f1f5f9; color: #475569; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tr:hover td { background: #f8fafc; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
    .stats { display: flex; gap: 24px; margin-bottom: 24px; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; flex: 1; }
    .stat-value { font-size: 24px; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 11px; color: #64748b; margin-top: 4px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Pazar<span>yönetimi</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">E-ticaret Yönetim Platformu</div>
    </div>
    <div class="meta">
      <div><strong>${options?.companyName || 'Pazaryönetimi'}</strong></div>
      <div>${now}</div>
      ${options?.dateRange ? `<div>${options.dateRange}</div>` : ''}
    </div>
  </div>

  <h1>${title}</h1>
  ${options?.subtitle ? `<div class="subtitle">${options.subtitle}</div>` : '<div style="margin-bottom:24px"></div>'}

  <div class="stats">
    <div class="stat-card">
      <div class="stat-value">${data.length}</div>
      <div class="stat-label">Toplam Kayıt</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>${headerLabels.map((h) => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data
        .map(
          (row) =>
            `<tr>${keys
              .map((key) => {
                const val = row[key];
                if (val === null || val === undefined) return '<td>-</td>';
                return `<td>${formatCellValue(val)}</td>`;
              })
              .join('')}</tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    Bu rapor Pazaryönetimi platformu tarafından otomatik oluşturulmuştur. • ${now}
  </div>

  <div class="no-print" style="margin-top:24px; text-align:center;">
    <button onclick="window.print()" style="padding:12px 32px; background:#3b82f6; color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:14px;">
      PDF Olarak Kaydet (Ctrl+P)
    </button>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

// ─── Helpers ──────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatCellValue(val: any): string {
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return val.toLocaleString('tr-TR');
    return val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (val instanceof Date) {
    return val.toLocaleDateString('tr-TR');
  }
  if (typeof val === 'boolean') {
    return val ? 'Evet' : 'Hayır';
  }
  return String(val);
}

// ─── Export Button Component ──────────────────────────
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, FileJson, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  data: Record<string, any>[];
  filename: string;
  title: string;
  headers?: Record<string, string>;
  subtitle?: string;
  className?: string;
}

export function ExportButton({ data, filename, title, headers, subtitle, className }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exports = [
    {
      label: 'Excel (CSV)',
      icon: FileSpreadsheet,
      color: 'text-emerald-400',
      onClick: () => exportToCSV(data, filename, headers),
    },
    {
      label: 'PDF Rapor',
      icon: FileText,
      color: 'text-red-400',
      onClick: () => exportToPDF(title, data, headers, { subtitle }),
    },
    {
      label: 'JSON',
      icon: FileJson,
      color: 'text-blue-400',
      onClick: () => exportToJSON(data, filename),
    },
  ];

  return (
    <div className={`relative ${className || ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 transition-colors"
      >
        <Download size={16} />
        Dışa Aktar
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[180px]"
            >
              {exports.map((exp) => (
                <button
                  key={exp.label}
                  onClick={() => {
                    exp.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <exp.icon size={16} className={exp.color} />
                  <span className="text-sm text-slate-300">{exp.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
