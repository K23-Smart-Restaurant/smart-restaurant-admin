import TableService from "../services/TableService.js";

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
            const table = await tableService.updateTable(
                req.params.id,
                req.body
            );
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
            const qrBuffer = await tableService.downloadQRCode(req.params.id);
            res.setHeader("Content-Type", "image/png");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=table-qr-${req.params.id}.png`
            );
            res.send(qrBuffer);
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
