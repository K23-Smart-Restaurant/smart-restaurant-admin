import TableService from "../services/TableService.js";
import qrCodeService from "../services/QRCodeService.js";

const tableService = new TableService();

class TableController {
  async getAll(req, res, next) {
    try {
      const tables = await tableService.getTables();
      res.json(tables);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const table = await tableService.createTable(req.body);
      res.status(201).json(table);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const table = await tableService.updateTable(req.params.id, req.body);
      res.json(table);
    } catch (error) {
      next(error);
    }
  }

  async regenerateQR(req, res, next) {
    try {
      const table = await tableService.regenerateQRCode(req.params.id);
      res.json(table);
    } catch (error) {
      next(error);
    }
  }

  async downloadQR(req, res, next) {
    try {
      const format = req.query.format || "png";
      const qrBuffer = await tableService.downloadQRCode(req.params.id, format);

      if (format === "pdf") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=table-${req.params.id}-qr.pdf`
        );
      } else {
        res.setHeader("Content-Type", "image/png");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=table-${req.params.id}-qr.png`
        );
      }
      res.send(qrBuffer);
    } catch (error) {
      next(error);
    }
  }

  async downloadBatchQR(req, res, next) {
    try {
      const { tableIds, format = "zip", layout = "single" } = req.body;
      const options = {
        layout,
        restaurantName: req.body.restaurantName || "Smart Restaurant",
        includeWifi: req.body.includeWifi || false,
        wifiName: req.body.wifiName || "",
        wifiPassword: req.body.wifiPassword || "",
      };

      const buffer = await tableService.downloadBatchQRCodes(
        tableIds,
        format,
        options
      );

      if (format === "zip") {
        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=qr-codes.zip"
        );
      } else {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=qr-codes.pdf"
        );
      }

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async bulkRegenerateQR(req, res, next) {
    try {
      const { tableIds } = req.body;
      const results = await tableService.bulkRegenerateQRCodes(tableIds);
      res.json({
        message: `Regenerated QR codes for ${results.success.length} tables`,
        results,
      });
    } catch (error) {
      next(error);
    }
  }

  async validateQRToken(req, res, next) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          valid: false,
          error: "Token is required",
        });
      }

      const validation = await qrCodeService.validateTokenWithDatabase(token);

      if (!validation.valid) {
        // Log invalid token access attempt
        console.warn(`Invalid QR token access: ${validation.error}`);
        return res.status(403).json(validation);
      }

      res.json(validation);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await tableService.deleteTable(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default TableController;
