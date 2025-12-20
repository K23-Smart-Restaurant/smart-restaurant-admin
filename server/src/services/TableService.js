import { toDataURL } from "qrcode";
import { signToken } from "../utils/jwt.utils.js";
import prisma from "../lib/prisma.js";

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

        // Generate QR code and token
        const { qrCode, qrToken } = await this.generateQRCodeAndToken(table.id);

        // Update table with QR data
        return await prisma.table.update({
            where: { id: table.id },
            data: { 
                qrCode,
                qrToken,
                qrTokenCreatedAt: new Date()
            },
        });
    }

    async generateQRCodeAndToken(tableId) {
        // Create JWT token with table ID
        const token = signToken({ tableId, type: "table_access" });

        // Create URL (customer frontend will read this)
        const url = `${process.env.CLIENT_URL}/menu?token=${token}`;

        // Generate QR code as data URL (base64 image)
        const qrCodeDataUrl = await toDataURL(url, {
            width: 400,
            margin: 2,
            errorCorrectionLevel: 'H'
        });

        return {
            qrCode: qrCodeDataUrl,
            qrToken: token
        };
    }

    async generateQRCode(tableId) {
        // Legacy method - kept for backward compatibility
        const { qrCode } = await this.generateQRCodeAndToken(tableId);
        return qrCode;
    }

    async regenerateQRCode(tableId) {
        // Generate new QR code and token
        const { qrCode, qrToken } = await this.generateQRCodeAndToken(tableId);

        // Update table with new QR data
        // Old qrToken is automatically invalidated since we overwrite it
        return await prisma.table.update({
            where: { id: tableId },
            data: { 
                qrCode,
                qrToken,
                qrTokenCreatedAt: new Date()
            },
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
}

export default TableService;
