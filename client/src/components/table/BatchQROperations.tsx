import React, { useState } from "react";
import {
  DownloadIcon,
  RefreshCwIcon,
  FileArchiveIcon,
  FileTextIcon,
  PrinterIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LayoutGridIcon,
  LayoutIcon,
} from "lucide-react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { Table } from "../../hooks/useTables";
import {
  tableService,
  type BatchDownloadOptions,
  type BulkRegenerateResult,
} from "../../services/tableService";
import { saveAs } from "file-saver";

interface BatchQROperationsProps {
  tables: Table[];
  selectedTableIds: string[];
  onBulkRegenerateComplete: () => void;
}

export const BatchQROperations: React.FC<BatchQROperationsProps> = ({
  tables,
  selectedTableIds,
  onBulkRegenerateComplete,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [regenerateResult, setRegenerateResult] =
    useState<BulkRegenerateResult | null>(null);
  const [downloadOptions, setDownloadOptions] = useState<{
    format: "zip" | "pdf";
    layout: "single" | "multiple";
    includeWifi: boolean;
    wifiName: string;
    wifiPassword: string;
    restaurantName: string;
  }>({
    format: "zip",
    layout: "single",
    includeWifi: false,
    wifiName: "",
    wifiPassword: "",
    restaurantName: "Smart Restaurant",
  });

  const selectedTables = tables.filter((t) => selectedTableIds.includes(t.id));
  const hasSelection = selectedTableIds.length > 0;
  const tablesWithQR = (hasSelection ? selectedTables : tables).filter(
    (t) => t.qrToken
  );

  const handleBatchDownload = async () => {
    if (tablesWithQR.length === 0) {
      alert("No tables with QR codes to download");
      return;
    }

    setIsDownloading(true);
    try {
      const options: BatchDownloadOptions = {
        tableIds: hasSelection ? selectedTableIds : undefined,
        format: downloadOptions.format,
        layout: downloadOptions.layout,
        restaurantName: downloadOptions.restaurantName,
        includeWifi: downloadOptions.includeWifi,
        wifiName: downloadOptions.wifiName,
        wifiPassword: downloadOptions.wifiPassword,
      };

      const blob = await tableService.downloadBatchQR(options);
      const extension = downloadOptions.format;
      const filename = `qr-codes-${
        hasSelection ? "selected" : "all"
      }-tables.${extension}`;
      saveAs(blob, filename);
      setShowDownloadOptions(false);
    } catch (error) {
      console.error("Error downloading batch QR codes:", error);
      alert("Failed to download QR codes. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const tableIds = hasSelection ? selectedTableIds : undefined;
      const result = await tableService.bulkRegenerateQR(tableIds);
      setRegenerateResult(result);
      setShowRegenerateConfirm(false);
      onBulkRegenerateComplete();
    } catch (error) {
      console.error("Error bulk regenerating QR codes:", error);
      alert("Failed to regenerate QR codes. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePrintAll = () => {
    if (tablesWithQR.length === 0) {
      alert("No tables with QR codes to print");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print QR codes");
      return;
    }

    const tablesHtml = tablesWithQR
      .map(
        (table) => `
        <div class="qr-page">
          <div class="restaurant-name">${downloadOptions.restaurantName}</div>
          <div class="table-number">Table ${table.tableNumber}</div>
          <div class="table-location">${table.location || ""}</div>
          <div class="qr-container">
            <img class="qr-code" src="${table.qrCode}" alt="QR Code for Table ${
          table.tableNumber
        }">
          </div>
          <div class="scan-instruction">Scan to Order</div>
          <div class="scan-description">Scan this QR code to view menu and order</div>
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - All Tables</title>
          <style>
            @page {
              size: A5;
              margin: 10mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              background: white;
            }
            .qr-page {
              page-break-after: always;
              height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              text-align: center;
            }
            .qr-page:last-child {
              page-break-after: avoid;
            }
            .restaurant-name {
              font-size: 22px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 8px;
            }
            .table-number {
              font-size: 32px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 4px;
            }
            .table-location {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .qr-container {
              border: 4px solid #ffdc64;
              padding: 16px;
              border-radius: 12px;
              background: white;
              display: inline-block;
            }
            .qr-code {
              width: 250px;
              height: 250px;
              image-rendering: pixelated;
            }
            .scan-instruction {
              margin-top: 20px;
              font-size: 20px;
              font-weight: bold;
              color: #1a1a1a;
            }
            .scan-description {
              margin-top: 8px;
              font-size: 12px;
              color: #666;
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
          ${tablesHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-antiflash p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">
            Batch QR Operations
          </h3>
          <p className="text-sm text-gray-600">
            {hasSelection
              ? `${selectedTableIds.length} table${
                  selectedTableIds.length > 1 ? "s" : ""
                } selected`
              : `All ${tables.length} tables`}
            {tablesWithQR.length > 0 &&
              ` (${tablesWithQR.length} with QR codes)`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            icon={DownloadIcon}
            onClick={() => setShowDownloadOptions(true)}
            disabled={tablesWithQR.length === 0}
          >
            Download All
          </Button>
          <Button
            variant="secondary"
            icon={PrinterIcon}
            onClick={handlePrintAll}
            disabled={tablesWithQR.length === 0}
          >
            Print All
          </Button>
          <Button
            variant="secondary"
            icon={RefreshCwIcon}
            onClick={() => setShowRegenerateConfirm(true)}
            disabled={tables.length === 0}
            className="text-orange-600 hover:bg-orange-50"
          >
            Regenerate All
          </Button>
        </div>
      </div>

      {/* Download Options Modal */}
      <Modal
        isOpen={showDownloadOptions}
        onClose={() => setShowDownloadOptions(false)}
        title="Download QR Codes"
        size="md"
      >
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Download Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setDownloadOptions({ ...downloadOptions, format: "zip" })
                }
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  downloadOptions.format === "zip"
                    ? "border-naples bg-naples/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileArchiveIcon className="w-8 h-8 text-charcoal" />
                <span className="font-medium">ZIP Archive</span>
                <span className="text-xs text-gray-500">
                  Individual PNG files
                </span>
              </button>
              <button
                onClick={() =>
                  setDownloadOptions({ ...downloadOptions, format: "pdf" })
                }
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  downloadOptions.format === "pdf"
                    ? "border-naples bg-naples/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileTextIcon className="w-8 h-8 text-charcoal" />
                <span className="font-medium">PDF Document</span>
                <span className="text-xs text-gray-500">
                  Print-ready format
                </span>
              </button>
            </div>
          </div>

          {/* PDF Layout Options */}
          {downloadOptions.format === "pdf" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Page Layout
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setDownloadOptions({ ...downloadOptions, layout: "single" })
                  }
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    downloadOptions.layout === "single"
                      ? "border-naples bg-naples/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <LayoutIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">Single per Page</span>
                </button>
                <button
                  onClick={() =>
                    setDownloadOptions({
                      ...downloadOptions,
                      layout: "multiple",
                    })
                  }
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    downloadOptions.layout === "multiple"
                      ? "border-naples bg-naples/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <LayoutGridIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">4 per Page</span>
                </button>
              </div>
            </div>
          )}

          {/* Restaurant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              value={downloadOptions.restaurantName}
              onChange={(e) =>
                setDownloadOptions({
                  ...downloadOptions,
                  restaurantName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naples focus:border-naples"
              placeholder="Smart Restaurant"
            />
          </div>

          {/* WiFi Info */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={downloadOptions.includeWifi}
                onChange={(e) =>
                  setDownloadOptions({
                    ...downloadOptions,
                    includeWifi: e.target.checked,
                  })
                }
                className="w-4 h-4 text-naples rounded focus:ring-naples"
              />
              <span className="text-sm font-medium text-gray-700">
                Include WiFi Information
              </span>
            </label>
            {downloadOptions.includeWifi && (
              <div className="mt-3 space-y-3 pl-6">
                <input
                  type="text"
                  value={downloadOptions.wifiName}
                  onChange={(e) =>
                    setDownloadOptions({
                      ...downloadOptions,
                      wifiName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naples focus:border-naples"
                  placeholder="WiFi Network Name"
                />
                <input
                  type="text"
                  value={downloadOptions.wifiPassword}
                  onChange={(e) =>
                    setDownloadOptions({
                      ...downloadOptions,
                      wifiPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naples focus:border-naples"
                  placeholder="WiFi Password (optional)"
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>{tablesWithQR.length}</strong> QR codes will be downloaded
              as{" "}
              <strong>
                {downloadOptions.format === "zip"
                  ? "ZIP archive"
                  : "PDF document"}
              </strong>
              {downloadOptions.format === "pdf" && (
                <span>
                  {" "}
                  with{" "}
                  <strong>
                    {downloadOptions.layout === "single" ? "1" : "4"}
                  </strong>{" "}
                  QR code(s) per page
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDownloadOptions(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchDownload}
              disabled={isDownloading}
              icon={DownloadIcon}
            >
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Regenerate Confirmation Modal */}
      <Modal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        title="Confirm Bulk Regeneration"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">
                Warning: This action cannot be undone
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Regenerating QR codes will invalidate all existing codes.
                Customers with printed or saved QR codes will need new ones to
                access the menu.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>
                {hasSelection ? selectedTableIds.length : tables.length}
              </strong>{" "}
              table(s) will have their QR codes regenerated:
            </p>
            <ul className="mt-2 text-sm text-gray-600 max-h-32 overflow-y-auto">
              {(hasSelection ? selectedTables : tables)
                .slice(0, 10)
                .map((table) => (
                  <li key={table.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Table {table.tableNumber} - {table.location}
                  </li>
                ))}
              {(hasSelection ? selectedTableIds.length : tables.length) >
                10 && (
                <li className="text-gray-500">
                  ... and{" "}
                  {(hasSelection ? selectedTableIds.length : tables.length) -
                    10}{" "}
                  more
                </li>
              )}
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowRegenerateConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkRegenerate}
              disabled={isRegenerating}
              className="bg-orange-600 hover:bg-orange-700"
              icon={RefreshCwIcon}
            >
              {isRegenerating ? "Regenerating..." : "Regenerate All"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Regeneration Results Modal */}
      <Modal
        isOpen={!!regenerateResult}
        onClose={() => setRegenerateResult(null)}
        title="Regeneration Complete"
        size="md"
      >
        {regenerateResult && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">
                  {regenerateResult.message}
                </h4>
              </div>
            </div>

            {regenerateResult.results.success.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  Successfully Regenerated (
                  {regenerateResult.results.success.length})
                </h5>
                <ul className="text-sm text-gray-600 max-h-24 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {regenerateResult.results.success.map((item) => (
                    <li key={item.tableId}>Table {item.tableNumber}</li>
                  ))}
                </ul>
              </div>
            )}

            {regenerateResult.results.failed.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                  Failed ({regenerateResult.results.failed.length})
                </h5>
                <ul className="text-sm text-red-600 max-h-24 overflow-y-auto bg-red-50 rounded-lg p-3">
                  {regenerateResult.results.failed.map((item) => (
                    <li key={item.tableId}>
                      {item.tableId}: {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setRegenerateResult(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
