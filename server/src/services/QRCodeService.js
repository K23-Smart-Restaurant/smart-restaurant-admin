import { toDataURL, toBuffer } from "qrcode";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import archiver from "archiver";
import prisma from "../lib/prisma.js";

// QR Token configuration
const QR_TOKEN_SECRET =
  process.env.QR_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "qr-secret-key-change-in-production";
const QR_TOKEN_EXPIRES_IN = process.env.QR_TOKEN_EXPIRES_IN || "365d"; // Default 1 year
const RESTAURANT_DOMAIN =
  process.env.RESTAURANT_DOMAIN || "http://localhost:3000";
const DEFAULT_RESTAURANT_ID =
  process.env.DEFAULT_RESTAURANT_ID || "default-restaurant";

class QRCodeService {
  /**
   * Generate a signed JWT token for table QR code
   * @param {string} tableId - Table ID
   * @param {string} restaurantId - Restaurant ID (optional)
   * @param {string} expiresIn - Token expiration (optional)
   * @returns {Object} Token and metadata
   */
  generateSignedToken(
    tableId,
    restaurantId = DEFAULT_RESTAURANT_ID,
    expiresIn = QR_TOKEN_EXPIRES_IN
  ) {
    const payload = {
      tableId,
      restaurantId,
      type: "table_qr_access",
      createdAt: new Date().toISOString(),
    };

    const token = jwt.sign(payload, QR_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn,
    });

    return {
      token,
      createdAt: new Date(),
      expiresIn,
    };
  }

  /**
   * Verify and decode a QR token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded payload or error
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, QR_TOKEN_SECRET, {
        algorithms: ["HS256"],
      });
      return {
        valid: true,
        data: decoded,
        error: null,
      };
    } catch (error) {
      let errorMessage = "Invalid token";
      if (error.name === "TokenExpiredError") {
        errorMessage =
          "This QR code has expired. Please ask staff for assistance.";
      } else if (error.name === "JsonWebTokenError") {
        errorMessage =
          "This QR code is no longer valid. Please ask staff for assistance.";
      }
      return {
        valid: false,
        data: null,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate a QR token against the database
   * @param {string} token - JWT token to validate
   * @returns {Object} Validation result with table data
   */
  async validateTokenWithDatabase(token) {
    const verification = this.verifyToken(token);

    if (!verification.valid) {
      return verification;
    }

    // Check if token matches the current token for the table
    const table = await prisma.table.findUnique({
      where: { id: verification.data.tableId },
      select: {
        id: true,
        tableNumber: true,
        qrToken: true,
        qrTokenCreatedAt: true,
        status: true,
        location: true,
        capacity: true,
      },
    });

    if (!table) {
      return {
        valid: false,
        data: null,
        error: "Table not found. Please ask staff for assistance.",
      };
    }

    // Check if the token matches the current token (old tokens are invalidated)
    if (table.qrToken !== token) {
      // Log invalid token access
      console.warn(
        `Invalid QR token access attempt for table ${table.tableNumber}. Token may have been regenerated.`
      );
      return {
        valid: false,
        data: null,
        error:
          "This QR code is no longer valid. Please ask staff for assistance.",
      };
    }

    return {
      valid: true,
      data: {
        ...verification.data,
        table: {
          id: table.id,
          tableNumber: table.tableNumber,
          status: table.status,
          location: table.location,
          capacity: table.capacity,
        },
      },
      error: null,
    };
  }

  /**
   * Generate QR code URL for a table
   * @param {string} tableId - Table ID
   * @param {string} token - Signed token
   * @returns {string} QR code URL
   */
  generateQRUrl(tableId, token) {
    return `${RESTAURANT_DOMAIN}/menu?table=${tableId}&token=${token}`;
  }

  /**
   * Generate QR code as data URL (base64 image)
   * @param {string} url - URL to encode
   * @param {Object} options - QR code options
   * @returns {Promise<string>} Data URL
   */
  async generateQRDataUrl(url, options = {}) {
    const defaultOptions = {
      width: 400,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    };

    return await toDataURL(url, { ...defaultOptions, ...options });
  }

  /**
   * Generate QR code as PNG buffer
   * @param {string} url - URL to encode
   * @param {Object} options - QR code options
   * @returns {Promise<Buffer>} PNG buffer
   */
  async generateQRBuffer(url, options = {}) {
    const defaultOptions = {
      type: "png",
      width: 800, // Higher resolution for downloads
      margin: 2,
      errorCorrectionLevel: "H",
    };

    return await toBuffer(url, { ...defaultOptions, ...options });
  }

  /**
   * Generate complete QR code data for a table
   * @param {string} tableId - Table ID
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object>} QR code data
   */
  async generateTableQR(tableId, restaurantId = DEFAULT_RESTAURANT_ID) {
    const { token, createdAt } = this.generateSignedToken(
      tableId,
      restaurantId
    );
    const url = this.generateQRUrl(tableId, token);
    const qrCodeDataUrl = await this.generateQRDataUrl(url);

    return {
      qrCode: qrCodeDataUrl,
      qrToken: token,
      qrTokenCreatedAt: createdAt,
      qrUrl: url,
    };
  }

  /**
   * Get token status information
   * @param {string} token - JWT token
   * @param {Date} createdAt - Token creation date
   * @returns {Object} Token status
   */
  getTokenStatus(token, createdAt) {
    if (!token) {
      return {
        status: "none",
        label: "No QR Code",
        isActive: false,
      };
    }

    const verification = this.verifyToken(token);

    if (!verification.valid) {
      return {
        status: "invalid",
        label: "Invalid / Expired",
        isActive: false,
        error: verification.error,
      };
    }

    // Token is valid
    const exp = verification.data.exp;
    const now = Math.floor(Date.now() / 1000);
    const daysUntilExpiry = Math.ceil((exp - now) / (60 * 60 * 24));

    return {
      status: "active",
      label: "Active",
      isActive: true,
      createdAt,
      expiresAt: new Date(exp * 1000),
      daysUntilExpiry,
    };
  }

  /**
   * Generate PDF with QR code for a single table
   * @param {Object} table - Table data
   * @param {Object} options - PDF options
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateTablePDF(table, options = {}) {
    const {
      includeWifi = false,
      wifiName = "",
      wifiPassword = "",
      logoPath = null,
      restaurantName = "Smart Restaurant",
    } = options;

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A5",
          margin: 40,
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        // Generate QR code buffer
        const url = this.generateQRUrl(table.id, table.qrToken);
        const qrBuffer = await this.generateQRBuffer(url, { width: 600 });

        // Restaurant name header
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(restaurantName, { align: "center" });

        doc.moveDown(0.5);

        // Table number
        doc
          .fontSize(32)
          .font("Helvetica-Bold")
          .text(`Table ${table.tableNumber}`, { align: "center" });

        if (table.location) {
          doc
            .fontSize(14)
            .font("Helvetica")
            .fillColor("#666666")
            .text(table.location, { align: "center" });
        }

        doc.moveDown(1);

        // QR Code image - centered
        const pageWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const qrSize = Math.min(250, pageWidth - 40);
        const qrX = (doc.page.width - qrSize) / 2;

        doc.image(qrBuffer, qrX, doc.y, {
          width: qrSize,
          height: qrSize,
        });

        doc.y += qrSize + 20;

        // Scan instruction
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text("Scan to Order", { align: "center" });

        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica")
          .fillColor("#666666")
          .text(
            "Scan this QR code with your phone camera to view our menu and place orders.",
            {
              align: "center",
              width: pageWidth - 40,
            }
          );

        // WiFi info if provided
        if (includeWifi && wifiName) {
          doc.moveDown(1);
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .fillColor("#000000")
            .text("WiFi Information", { align: "center" });

          doc
            .fontSize(11)
            .font("Helvetica")
            .fillColor("#666666")
            .text(`Network: ${wifiName}`, { align: "center" });

          if (wifiPassword) {
            doc.text(`Password: ${wifiPassword}`, { align: "center" });
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate PDF with multiple tables (for batch printing)
   * @param {Array} tables - Array of table data
   * @param {Object} options - PDF options
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateBatchPDF(tables, options = {}) {
    const {
      layout = "single", // 'single' = 1 per page, 'multiple' = 4 per page
      restaurantName = "Smart Restaurant",
      includeWifi = false,
      wifiName = "",
      wifiPassword = "",
    } = options;

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: layout === "single" ? "A5" : "A4",
          margin: layout === "single" ? 40 : 30,
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        if (layout === "single") {
          // One table per page
          for (let i = 0; i < tables.length; i++) {
            if (i > 0) doc.addPage();
            await this.addTableToPage(doc, tables[i], {
              restaurantName,
              includeWifi,
              wifiName,
              wifiPassword,
              layout: "full",
            });
          }
        } else {
          // Multiple tables per page (2x2 grid)
          const pageWidth = doc.page.width - 60;
          const pageHeight = doc.page.height - 60;
          const cellWidth = pageWidth / 2;
          const cellHeight = pageHeight / 2;

          for (let i = 0; i < tables.length; i++) {
            const pageIndex = Math.floor(i / 4);
            const positionIndex = i % 4;

            if (positionIndex === 0 && i > 0) {
              doc.addPage();
            }

            const col = positionIndex % 2;
            const row = Math.floor(positionIndex / 2);
            const x = 30 + col * cellWidth;
            const y = 30 + row * cellHeight;

            await this.addTableToCell(
              doc,
              tables[i],
              x,
              y,
              cellWidth - 10,
              cellHeight - 10,
              { restaurantName }
            );
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add a table QR to a full page
   */
  async addTableToPage(doc, table, options) {
    const { restaurantName, includeWifi, wifiName, wifiPassword } = options;
    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Generate QR code buffer
    const url = this.generateQRUrl(table.id, table.qrToken);
    const qrBuffer = await this.generateQRBuffer(url, { width: 600 });

    // Restaurant name
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(restaurantName, doc.page.margins.left, 40, {
        align: "center",
        width: pageWidth,
      });

    // Table number
    doc
      .fontSize(32)
      .font("Helvetica-Bold")
      .text(`Table ${table.tableNumber}`, {
        align: "center",
        width: pageWidth,
      });

    if (table.location) {
      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#666666")
        .text(table.location, { align: "center", width: pageWidth });
    }

    doc.moveDown(1);

    // QR Code
    const qrSize = Math.min(250, pageWidth - 40);
    const qrX = (doc.page.width - qrSize) / 2;
    doc.image(qrBuffer, qrX, doc.y, { width: qrSize, height: qrSize });
    doc.y += qrSize + 20;

    // Scan instruction
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("Scan to Order", { align: "center", width: pageWidth });

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Scan this QR code to view menu and order", {
        align: "center",
        width: pageWidth,
      });

    // WiFi info
    if (includeWifi && wifiName) {
      doc.moveDown(1);
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#666666")
        .text(
          `WiFi: ${wifiName}${wifiPassword ? ` | Pass: ${wifiPassword}` : ""}`,
          { align: "center", width: pageWidth }
        );
    }
  }

  /**
   * Add a table QR to a cell in grid layout
   */
  async addTableToCell(doc, table, x, y, width, height, options) {
    const { restaurantName } = options;

    // Generate QR code buffer
    const url = this.generateQRUrl(table.id, table.qrToken);
    const qrBuffer = await this.generateQRBuffer(url, { width: 400 });

    const centerX = x + width / 2;

    // Draw border
    doc.rect(x, y, width, height).stroke("#cccccc");

    // Table number
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`Table ${table.tableNumber}`, x + 5, y + 10, {
        width: width - 10,
        align: "center",
      });

    // QR Code
    const qrSize = Math.min(120, width - 20);
    const qrX = centerX - qrSize / 2;
    doc.image(qrBuffer, qrX, y + 35, { width: qrSize, height: qrSize });

    // Scan text
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Scan to Order", x + 5, y + 40 + qrSize + 5, {
        width: width - 10,
        align: "center",
      });

    if (table.location) {
      doc
        .fontSize(8)
        .text(table.location, x + 5, y + 55 + qrSize + 5, {
          width: width - 10,
          align: "center",
        });
    }
  }

  /**
   * Generate ZIP archive with all QR codes as PNG files
   * @param {Array} tables - Array of table data
   * @returns {Promise<Buffer>} ZIP buffer
   */
  async generateBatchZip(tables) {
    return new Promise(async (resolve, reject) => {
      try {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const chunks = [];

        archive.on("data", (chunk) => chunks.push(chunk));
        archive.on("end", () => resolve(Buffer.concat(chunks)));
        archive.on("error", (err) => reject(err));

        // Add each table's QR code as PNG
        for (const table of tables) {
          const url = this.generateQRUrl(table.id, table.qrToken);
          const qrBuffer = await this.generateQRBuffer(url, { width: 800 });
          archive.append(qrBuffer, {
            name: `table-${table.tableNumber}-qr.png`,
          });
        }

        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Bulk regenerate QR codes for multiple tables
   * @param {Array<string>} tableIds - Array of table IDs
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object>} Summary of results
   */
  async bulkRegenerateQR(tableIds, restaurantId = DEFAULT_RESTAURANT_ID) {
    const results = {
      success: [],
      failed: [],
      total: tableIds.length,
    };

    for (const tableId of tableIds) {
      try {
        const { qrCode, qrToken, qrTokenCreatedAt } =
          await this.generateTableQR(tableId, restaurantId);

        await prisma.table.update({
          where: { id: tableId },
          data: {
            qrCode,
            qrToken,
            qrTokenCreatedAt,
          },
        });

        const table = await prisma.table.findUnique({
          where: { id: tableId },
          select: { tableNumber: true },
        });

        results.success.push({
          tableId,
          tableNumber: table?.tableNumber,
        });
      } catch (error) {
        results.failed.push({
          tableId,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default new QRCodeService();
