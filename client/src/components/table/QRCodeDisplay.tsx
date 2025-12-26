import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { Button } from "../common/Button";
import { tableService } from "../../services/tableService";
import type { Table, QRStatus } from "../../hooks/useTables";
import { saveAs } from "file-saver";

interface QRCodeDisplayProps {
  table: Table;
  onRegenerateQR: (tableId: string) => Promise<void>;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  table,
  onRegenerateQR,
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "pdf">("png");
  const printRef = useRef<HTMLDivElement>(null);

  const qrStatus: QRStatus = table.qrStatus || {
    status: table.qrToken ? "active" : "none",
    label: table.qrToken ? "Active" : "No QR Code",
    isActive: !!table.qrToken,
  };

  const getStatusIcon = () => {
    switch (qrStatus.status) {
      case "active":
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case "invalid":
        return <AlertCircleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (qrStatus.status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "invalid":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handleDownload = async (format: "png" | "pdf" = downloadFormat) => {
    if (!table.qrToken) return;

    setIsDownloading(true);
    try {
      const blob = await tableService.downloadQRCode(table.id, format);
      const extension = format;
      const filename = `table-${table.tableNumber}-qr-code.${extension}`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Failed to download QR code. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!table.qrCode) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print QR codes");
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
            <div class="table-location">${table.location || ""} ${table.capacity ? `• ${table.capacity} guests` : ""
      }</div>
            <div class="qr-container">
              <img class="qr-code" src="${table.qrCode
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
    if (
      !confirm(
        `Are you sure you want to regenerate the QR code for Table ${table.tableNumber}?\n\nThe old QR code will no longer work and customers will need to scan the new one.`
      )
    ) {
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerateQR(table.id);
    } catch (error) {
      console.error("Error regenerating QR code:", error);
      alert("Failed to regenerate QR code. Please try again.");
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
        <h3 className="text-lg font-semibold text-charcoal mb-2">
          No QR Code Available
        </h3>
        <p className="text-gray-600 mb-6">
          This table doesn't have a QR code yet. Generate one to allow customers
          to scan and order.
        </p>
        <Button onClick={handleRegenerate} disabled={isRegenerating}>
          {isRegenerating ? "Generating..." : "Generate QR Code"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-antiflash">
        {/* QR Status Banner */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between ${qrStatus.status === "active"
            ? "bg-green-50 border-green-100"
            : qrStatus.status === "invalid"
              ? "bg-red-50 border-red-100"
              : "bg-gray-50 border-gray-100"
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
              Expires in {qrStatus.daysUntilExpiry} days
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
                style={{ imageRendering: "pixelated" }}
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
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-charcoal">
              Table {table.tableNumber}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {table.location} • Capacity: {table.capacity} guests
            </p>
            {table.qrTokenCreatedAt && (
              <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Created: {new Date(table.qrTokenCreatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Download Format Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Download Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDownloadFormat("png")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${downloadFormat === "png"
                  ? "border-naples bg-naples/10 text-charcoal"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
              >
                <FileIcon className="w-4 h-4" />
                <span className="text-sm font-medium">PNG</span>
                <span className="text-xs text-gray-500">(Image)</span>
              </button>
              <button
                onClick={() => setDownloadFormat("pdf")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${downloadFormat === "pdf"
                  ? "border-naples bg-naples/10 text-charcoal"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
              >
                <FileTextIcon className="w-4 h-4" />
                <span className="text-sm font-medium">PDF</span>
                <span className="text-xs text-gray-500">(Print-Ready)</span>
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
                ? "Downloading..."
                : `Download ${downloadFormat.toUpperCase()}`}
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
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </Button>
          </div>

          {/* Info box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              How it works
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Place this QR code on the table for guests to scan</li>
              <li>• Customers can view the menu and place orders directly</li>
              <li>• Regenerating will invalidate the previous QR code</li>
              <li>• Download PDF for high-quality print output</li>
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
          <div className="relative max-w-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEnlarged(false)}
              className="absolute -top-12 right-0 p-2 bg-white text-charcoal rounded-full hover:bg-naples transition-colors"
              title="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <div className="bg-white rounded-xl p-8 border-4 border-naples shadow-2xl">
              <img
                src={table.qrCode}
                alt={`QR Code for Table ${table.tableNumber}`}
                className="w-full h-auto max-w-[450px]"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="text-center mt-6">
                <h3 className="text-3xl font-bold text-charcoal">
                  Table {table.tableNumber}
                </h3>
                <p className="text-gray-600 mt-1">{table.location}</p>
                <p className="text-lg font-medium text-naples mt-2">
                  Scan to Order
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
