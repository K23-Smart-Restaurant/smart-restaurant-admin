import prisma from "../lib/prisma.js";
import qrCodeService from "./QRCodeService.js";

class TableService {
  async createTable(data) {
    // Create table with all fields including description
    const table = await prisma.table.create({
      data: {
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        location: data.location,
        description: data.description,
        status: data.status || "AVAILABLE",
      },
    });

    // Generate QR code and token using QRCodeService
    const { qrCode, qrToken, qrTokenCreatedAt } =
      await qrCodeService.generateTableQR(
        table.id,
        table.restaurantId || undefined
      );

    // Update table with QR data
    return await prisma.table.update({
      where: { id: table.id },
      data: {
        qrCode,
        qrToken,
        qrTokenCreatedAt,
      },
    });
  }

  async regenerateQRCode(tableId) {
    // Get current table
    const existingTable = await prisma.table.findUnique({
      where: { id: tableId },
      select: { restaurantId: true, qrToken: true },
    });

    if (!existingTable) {
      throw new Error("Table not found");
    }

    // Log old token invalidation
    if (existingTable.qrToken) {
      console.log(`Invalidating old QR token for table ${tableId}`);
    }

    // Generate new QR code and token
    const { qrCode, qrToken, qrTokenCreatedAt } =
      await qrCodeService.generateTableQR(
        tableId,
        existingTable.restaurantId || undefined
      );

    // Update table with new QR data (old token is automatically invalidated)
    return await prisma.table.update({
      where: { id: tableId },
      data: {
        qrCode,
        qrToken,
        qrTokenCreatedAt,
      },
    });
  }

  async downloadQRCode(tableId, format = "png") {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new Error("Table not found");
    }

    if (!table.qrToken) {
      throw new Error("QR code not generated for this table");
    }

    if (format === "pdf") {
      return await qrCodeService.generateTablePDF(table);
    }

    // PNG format - generate high-resolution buffer
    const url = qrCodeService.generateQRUrl(table.id, table.qrToken);
    return await qrCodeService.generateQRBuffer(url, { width: 800 });
  }

  async getTableWithQRStatus(tableId) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new Error("Table not found");
    }

    const tokenStatus = qrCodeService.getTokenStatus(
      table.qrToken,
      table.qrTokenCreatedAt
    );

    return {
      ...table,
      qrStatus: tokenStatus,
    };
  }

  async getTables() {
    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: "asc" },
    });

    // Add QR status to each table
    return tables.map((table) => ({
      ...table,
      qrStatus: qrCodeService.getTokenStatus(
        table.qrToken,
        table.qrTokenCreatedAt
      ),
    }));
  }

  async updateTable(id, data) {
    // Prepare update data, excluding fields that shouldn't be directly updated
    const updateData = {
      ...(data.tableNumber !== undefined && { tableNumber: data.tableNumber }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
    };

    return await prisma.table.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteTable(id) {
    await prisma.table.delete({ where: { id } });
  }

  // Batch operations
  async downloadBatchQRCodes(tableIds, format = "zip", options = {}) {
    let tables;

    if (tableIds && tableIds.length > 0) {
      tables = await prisma.table.findMany({
        where: { id: { in: tableIds } },
        orderBy: { tableNumber: "asc" },
      });
    } else {
      // If no IDs provided, get all tables
      tables = await prisma.table.findMany({
        orderBy: { tableNumber: "asc" },
      });
    }

    if (tables.length === 0) {
      throw new Error("No tables found");
    }

    // Filter out tables without QR codes
    const tablesWithQR = tables.filter((t) => t.qrToken);
    if (tablesWithQR.length === 0) {
      throw new Error("No tables have QR codes generated");
    }

    if (format === "zip") {
      return await qrCodeService.generateBatchZip(tablesWithQR);
    } else if (format === "pdf") {
      return await qrCodeService.generateBatchPDF(tablesWithQR, options);
    }

    throw new Error("Invalid format. Use 'zip' or 'pdf'");
  }

  async bulkRegenerateQRCodes(tableIds) {
    if (!tableIds || tableIds.length === 0) {
      // Regenerate for all tables
      const allTables = await prisma.table.findMany({ select: { id: true } });
      tableIds = allTables.map((t) => t.id);
    }

    return await qrCodeService.bulkRegenerateQR(tableIds);
  }
}

export default TableService;
