import { Router } from "express";
import ReportController from "../controllers/ReportController.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
const reportController = new ReportController();

router.use(authenticate, authorize("ADMIN"));

router.get("/revenue", (req, res, next) =>
    reportController.getRevenue(req, res, next)
);
router.get("/top-items", (req, res, next) =>
    reportController.getTopItems(req, res, next)
);
router.get("/analytics", (req, res, next) =>
    reportController.getAnalytics(req, res, next)
);

export default router;
