import React, { useState, useRef } from 'react';
import {
  DownloadIcon,
  PrinterIcon,
  RefreshCwIcon,
  ZoomInIcon,
  XIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  FileTextIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { tableService } from '../../services/tableService';
import type { Table, QRStatus } from '../../hooks/useTables';
import { saveAs } from 'file-saver';

interface QRCodeDisplayProps {
  table: Table;
  onRegenerateQR: (tableId: string) => Promise<void>;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ table, onRegenerateQR }) => {
  const { t } = useTranslation(['tables', 'common']);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'pdf'>('png');
  const printRef = useRef<HTMLDivElement>(null);

  const qrStatus: QRStatus = table.qrStatus || {
    status: table.qrToken ? 'active' : 'none',
    label: table.qrToken ? t('tables:qr.status.active') : t('tables:qr.status.noQR'),
    isActive: !!table.qrToken,
  };

  const getStatusIcon = () => {
    switch (qrStatus.status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'invalid':
        return <AlertCircleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (qrStatus.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invalid':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleDownload = async (format: 'png' | 'pdf' = downloadFormat) => {
    if (!table.qrToken) return;

    setIsDownloading(true);
    try {
      const blob = await tableService.downloadQRCode(table.id, format);
      const extension = format;
      const filename = `table-${table.tableNumber}-qr-code.${extension}`;
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      // Error is logged, UI shows download button still available for retry
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!table.qrCode) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.warn('Print window blocked by browser');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${table.tableNumber} - QR Code</title>
          <style>
            @page {
              size: A5;
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              min-height: 100vh;
              background: white;
            }
            .print-container {
              width: 100%;
              max-width: 350px;
              padding: 20px;
              text-align: center;
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 8px;
            }
            .table-number {
              font-size: 36px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 4px;
            }
            .table-location {
              font-size: 14px;
              color: #666;
              margin-bottom: 24px;
            }
            .qr-container {
              border: 4px solid #ffdc64;
              padding: 16px;
              border-radius: 12px;
              background: white;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .qr-code {
              display: block;
              width: 280px;
              height: 280px;
              image-rendering: pixelated;
            }
            .scan-instruction {
              margin-top: 24px;
              font-size: 22px;
              font-weight: bold;
              color: #1a1a1a;
            }
            .scan-description {
              margin-top: 8px;
              font-size: 13px;
              color: #666;
              line-height: 1.5;
              max-width: 300px;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="restaurant-name">Smart Restaurant</div>
            <div class="table-number">Table ${table.tableNumber}</div>
            <div class="table-location">${table.location || ''} ${
              table.capacity ? `• ${table.capacity} guests` : ''
            }</div>
            <div class="qr-container">
              <img class="qr-code" src="${
                table.qrCode
              }" alt="QR Code for Table ${table.tableNumber}">
            </div>
            <div class="scan-instruction">Scan to Order</div>
            <div class="scan-description">
              Scan this QR code with your phone camera to view our menu, place orders, and request service.
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRegenerate = async () => {
    // Confirmation should be handled by parent or via a proper dialog
    setIsRegenerating(true);
    try {
      await onRegenerateQR(table.id);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!table.qrCode) {
    return (
      <div className="bg-white rounded-lg border border-antiflash p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-charcoal mb-2">{t('tables:qr.noCode')}</h3>
        <p className="text-gray-600 mb-6">{t('tables:qr.noCodeDescription')}</p>
        <Button onClick={handleRegenerate} disabled={isRegenerating}>
          {isRegenerating ? t('tables:qr.generating') : t('tables:qr.generateCode')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-antiflash">
        {/* QR Status Banner */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between ${
            qrStatus.status === 'active'
              ? 'bg-green-50 border-green-100'
              : qrStatus.status === 'invalid'
                ? 'bg-red-50 border-red-100'
                : 'bg-gray-50 border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full border ${getStatusColor()}`}
            >
              {qrStatus.label}
            </span>
          </div>
          {qrStatus.daysUntilExpiry && qrStatus.daysUntilExpiry < 30 && (
            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
              {t('tables:qr.status.expiresIn', { days: qrStatus.daysUntilExpiry })}
            </span>
          )}
        </div>

        <div className="p-6">
          {/* QR Code Image */}
          <div className="flex justify-center mb-6" ref={printRef}>
            <div className="relative border-4 border-naples rounded-xl p-4 bg-white shadow-lg">
              <img
                src={table.qrCode}
                alt={`QR Code for Table ${table.tableNumber}`}
                className="w-64 h-64 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsEnlarged(true)}
                style={{ imageRendering: 'pixelated' }}
              />
              <button
                onClick={() => setIsEnlarged(true)}
                className="absolute top-2 right-2 p-2 bg-charcoal/80 text-white rounded-full hover:bg-charcoal transition-colors"
                title={t('tables:qr.info.enlarge')}
              >
                <ZoomInIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Info */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-charcoal">
              {t('tables:list.table', { number: table.tableNumber })}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {table.location} • {t('tables:qr.info.capacity', { capacity: table.capacity })}
            </p>
            {table.qrTokenCreatedAt && (
              <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {t('tables:qr.info.created')} {new Date(table.qrTokenCreatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Download Format Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('tables:qr.download.format')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDownloadFormat('png')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  downloadFormat === 'png'
                    ? 'border-naples bg-naples/10 text-charcoal'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <FileIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{t('tables:qr.download.png')}</span>
                <span className="text-xs text-gray-500">
                  {t('tables:qr.download.pngDescription')}
                </span>
              </button>
              <button
                onClick={() => setDownloadFormat('pdf')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  downloadFormat === 'pdf'
                    ? 'border-naples bg-naples/10 text-charcoal'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <FileTextIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{t('tables:qr.download.pdf')}</span>
                <span className="text-xs text-gray-500">
                  {t('tables:qr.download.pdfDescription')}
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="secondary"
              icon={DownloadIcon}
              onClick={() => handleDownload()}
              disabled={isDownloading}
              className="w-full"
            >
              {isDownloading
                ? t('tables:qr.download.downloading')
                : t('tables:qr.download.button', { format: downloadFormat.toUpperCase() })}
            </Button>
            <Button variant="secondary" icon={PrinterIcon} onClick={handlePrint} className="w-full">
              {t('tables:qr.actions.print')}
            </Button>
            <Button
              variant="secondary"
              icon={RefreshCwIcon}
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="w-full"
            >
              {isRegenerating
                ? t('tables:qr.actions.regenerating')
                : t('tables:qr.actions.regenerate')}
            </Button>
          </div>

          {/* Info box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              {t('tables:qr.howItWorks.title')}
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• {t('tables:qr.howItWorks.point1')}</li>
              <li>• {t('tables:qr.howItWorks.point2')}</li>
              <li>• {t('tables:qr.howItWorks.point3')}</li>
              <li>• {t('tables:qr.howItWorks.point4')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Enlarged Modal */}
      {isEnlarged && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEnlarged(false)}
        >
          {/* Close button with fixed positioning to always stay visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEnlarged(false);
            }}
            className="fixed top-4 right-4 z-[60] p-3 bg-white text-charcoal rounded-full hover:bg-naples transition-colors shadow-lg"
            title={t('tables:qr.enlarged.close')}
          >
            <XIcon className="w-6 h-6" />
          </button>

          <div className="relative max-w-2xl w-full animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div
              className="bg-white rounded-xl p-8 border-4 border-naples shadow-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={table.qrCode}
                alt={`QR Code for Table ${table.tableNumber}`}
                className="w-full h-auto max-w-[450px] mx-auto"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="text-center mt-6">
                <h3 className="text-3xl font-bold text-charcoal">
                  {t('tables:list.table', { number: table.tableNumber })}
                </h3>
                <p className="text-gray-600 mt-1">{table.location}</p>
                <p className="text-lg font-medium text-naples mt-2">
                  {t('tables:qr.enlarged.scanToOrder')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
