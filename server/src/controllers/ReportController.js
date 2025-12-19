import ReportService from "../services/ReportService.js";

const reportService = new ReportService();

class ReportController {
    async getRevenue(req, res, next) {
        try {
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);
            const report = await reportService.getRevenueReport(
                startDate,
                endDate
            );
            res.json(report);
        } catch (error) {
            next(error);
        }
    }

    async getTopItems(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const items = await reportService.getTopRevenueItems(limit);
            res.json(items);
        } catch (error) {
            next(error);
        }
    }

    async getAnalytics(req, res, next) {
        try {
            const analytics = await reportService.getOrderAnalytics();
            res.json(analytics);
        } catch (error) {
            next(error);
        }
    }
}

export default ReportController;
