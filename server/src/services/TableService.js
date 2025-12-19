import { toDataURL } from "qrcode";
import { signToken } from "../utils/jwt.utils.js";
import prisma from "../lib/prisma.js";

class TableService {
    async createTable(data) {
        const table = await prisma.table.create({
            data: {
                tableNumber: data.tableNumber,
                capacity: data.capacity,
                location: data.location,
                status: data.status || "AVAILABLE",
            },
        });

        // Generate QR code
        const qrCode = await this.generateQRCode(table.id);

        return await prisma.table.update({
            where: { id: table.id },
            data: { qrCode },
        });
    }

    async generateQRCode(tableId) {
        // Create JWT token with table ID
        const token = signToken({ tableId, type: "table_access" });

        // Create URL (customer frontend will read this)
        const url = `${process.env.CLIENT_URL}/menu?token=${token}`;

        // Generate QR code as data URL
        const qrCodeDataUrl = await toDataURL(url);

        return qrCodeDataUrl;
    }

    async regenerateQRCode(tableId) {
        const qrCode = await this.generateQRCode(tableId);

        return await prisma.table.update({
            where: { id: tableId },
            data: { qrCode },
        });
    }

    async downloadQRCode(tableId) {
        const table = await prisma.table.findUnique({ where: { id: tableId } });
        if (!table || !table.qrCode) {
            throw new Error("Table or QR code not found");
        }

        // Convert data URL to buffer
        const base64Data = table.qrCode.replace(/^data:image\/png;base64,/, "");
        return Buffer.from(base64Data, "base64");
    }

    async getTables() {
        return await prisma.table.findMany({
            orderBy: { tableNumber: "asc" },
        });
    }

    async updateTable(id, data) {
        return await prisma.table.update({
            where: { id },
            data,
        });
    }

    async deleteTable(id) {
        await prisma.table.delete({ where: { id } });
    }
}

export default TableService;
