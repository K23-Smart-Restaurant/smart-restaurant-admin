import { Router } from "express";
import PublicMenuController from "../controllers/PublicMenuController.js";

const router = Router();

/**
 * H1: Public Guest Menu API Routes
 * These routes are PUBLIC - no authentication required
 * Used by guests browsing the menu via QR code
 */

// GET /api/menu - Get public menu items
// Query params: search, categoryId, category, isChefRecommendation, sortBy, sortOrder, limit, offset, qrToken
router.get("/", (req, res, next) =>
    PublicMenuController.getMenu(req, res, next)
);

// GET /api/menu/categories - Get public categories for filtering
router.get("/categories", (req, res, next) =>
    PublicMenuController.getCategories(req, res, next)
);

// GET /api/menu/validate-qr - Validate QR token and get table context
router.get("/validate-qr", (req, res, next) =>
    PublicMenuController.validateQr(req, res, next)
);

export default router;
