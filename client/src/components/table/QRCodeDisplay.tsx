import React, { useState } from 'react';
import { DownloadIcon, PrinterIcon, RefreshCwIcon, ZoomInIcon, XIcon } from 'lucide-react';
import { Button } from '../common/Button';
import type { Table } from '../../hooks/useTables';

interface QRCodeDisplayProps {
  table: Table;
  onRegenerateQR: (tableId: string) => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ table, onRegenerateQR }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDownload = () => {
    if (!table.qrCode) return;

    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = table.qrCode;
    link.download = `table-${table.tableNumber}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`QR code for Table ${table.tableNumber} downloaded successfully!`);
  };

  const handlePrint = () => {
    if (!table.qrCode) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print QR codes');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${table.tableNumber} - QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            h1 {
              margin: 0;
              font-size: 32px;
              color: #242424;
            }
            .subtitle {
              margin: 10px 0;
              font-size: 18px;
              color: #666;
            }
            .qr-container {
              border: 3px solid #ffdc64;
              padding: 20px;
              border-radius: 12px;
              background: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            img {
              display: block;
              width: 300px;
              height: 300px;
              image-rendering: pixelated;
            }
            .instructions {
              margin-top: 30px;
              text-align: center;
              max-width: 400px;
              color: #666;
              font-size: 14px;
              line-height: 1.6;
            }
            @media print {
              body {
                padding: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Table ${table.tableNumber}</h1>
            <div class="subtitle">${table.location} • Capacity: ${table.capacity} guests</div>
          </div>
          <div class="qr-container">
            <img src="${table.qrCode}" alt="QR Code for Table ${table.tableNumber}">
          </div>
          <div class="instructions">
            <p><strong>Scan this QR code to:</strong></p>
            <p>View our menu, place orders, and request service directly from your table.</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRegenerate = async () => {
    if (!confirm(`Are you sure you want to regenerate the QR code for Table ${table.tableNumber}? The old QR code will no longer work.`)) {
      return;
    }

    setIsRegenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onRegenerateQR(table.id);
      setIsRegenerating(false);
      alert(`QR code for Table ${table.tableNumber} has been regenerated successfully!`);
    }, 500);
  };

  if (!table.qrCode) {
    return (
      <div className="bg-white rounded-lg border border-antiflash p-6 text-center">
        <p className="text-gray-600 mb-4">No QR code available for this table</p>
        <Button onClick={handleRegenerate} disabled={isRegenerating}>
          {isRegenerating ? 'Generating...' : 'Generate QR Code'}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-antiflash p-6">
        {/* QR Code Image */}
        <div className="flex justify-center mb-4">
          <div className="relative border-4 border-naples rounded-lg p-4 bg-white shadow-md">
            <img
              src={table.qrCode}
              alt={`QR Code for Table ${table.tableNumber}`}
              className="w-64 h-64 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsEnlarged(true)}
              style={{ imageRendering: 'pixelated' }}
            />
            <button
              onClick={() => setIsEnlarged(true)}
              className="absolute top-2 right-2 p-2 bg-charcoal/80 text-white rounded-full hover:bg-charcoal transition-colors"
              title="Enlarge QR code"
            >
              <ZoomInIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Info */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-charcoal">Table {table.tableNumber}</h3>
          <p className="text-sm text-gray-600">
            {table.location} • Capacity: {table.capacity} guests
          </p>
          {table.qrTokenCreatedAt && (
            <p className="text-xs text-gray-500 mt-1">
              QR Code generated: {new Date(table.qrTokenCreatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="secondary"
            icon={DownloadIcon}
            onClick={handleDownload}
            className="w-full"
          >
            Download
          </Button>
          <Button
            variant="secondary"
            icon={PrinterIcon}
            onClick={handlePrint}
            className="w-full"
          >
            Print
          </Button>
          <Button
            variant="secondary"
            icon={RefreshCwIcon}
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="w-full"
          >
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> Place this QR code on the table so guests can scan it to access the menu and order.
            Regenerating will invalidate the previous QR code.
          </p>
        </div>
      </div>

      {/* Enlarged Modal */}
      {isEnlarged && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEnlarged(false)}
        >
          <div className="relative max-w-2xl">
            <button
              onClick={() => setIsEnlarged(false)}
              className="absolute -top-12 right-0 p-2 bg-white text-charcoal rounded-full hover:bg-naples transition-colors"
              title="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <div className="bg-white rounded-lg p-8 border-4 border-naples">
              <img
                src={table.qrCode}
                alt={`QR Code for Table ${table.tableNumber}`}
                className="w-full h-auto"
                style={{ imageRendering: 'pixelated', maxWidth: '500px' }}
              />
              <div className="text-center mt-4">
                <h3 className="text-2xl font-bold text-charcoal">Table {table.tableNumber}</h3>
                <p className="text-gray-600">{table.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
