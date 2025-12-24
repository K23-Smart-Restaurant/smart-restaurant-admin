import PublicMenuService from "../services/PublicMenuService.js";

/**
 * PublicMenuController - H1: Public Guest Menu API
 * Handles public menu requests for guests browsing via QR code
 */
class PublicMenuController {
    /**
     * H1: Get public menu items
     * GET /api/menu
     * Query params:
     * - search: Search by item name
     * - categoryId: Filter by category ID
     * - category: Filter by category enum
     * - isChefRecommendation: Filter chef picks (true/false)
     * - sortBy: name, price, popularity
     * - sortOrder: asc, desc
     * - limit: Items per page (default 20)
     * - offset: Pagination offset
     * - qrToken: Optional QR token for restaurant context
     */
    async getMenu(req, res, next) {
        try {
            const filters = {
                search: req.query.search,
                categoryId: req.query.categoryId,
                category: req.query.category,
                isChefRecommendation:
                    req.query.isChefRecommendation === "true"
                        ? true
                        : req.query.isChefRecommendation === "false"
                            ? false
                            : undefined,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
                limit: req.query.limit ? parseInt(req.query.limit) : 20,
                offset: req.query.offset ? parseInt(req.query.offset) : 0,
            };

            // Validate QR token if provided (for restaurant scoping)
            if (req.query.qrToken) {
                const tableContext = await PublicMenuService.validateQrToken(
                    req.query.qrToken
                );
                if (tableContext) {
                    filters.restaurantId = tableContext.restaurantId;
                }
            }

            const result = await PublicMenuService.getPublicMenu(filters);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get public categories for filtering
     * GET /api/menu/categories
     */
    async getCategories(req, res, next) {
        try {
            let restaurantId = null;

            // Validate QR token if provided
            if (req.query.qrToken) {
                const tableContext = await PublicMenuService.validateQrToken(
                    req.query.qrToken
                );
                if (tableContext) {
                    restaurantId = tableContext.restaurantId;
                }
            }

            const categories = await PublicMenuService.getPublicCategories(
                restaurantId
            );

            res.json({
                success: true,
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate QR token and get table context
     * GET /api/menu/validate-qr
     */
    async validateQr(req, res, next) {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "QR token is required",
                });
            }

            const tableContext = await PublicMenuService.validateQrToken(token);

            if (!tableContext) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid or expired QR code",
                });
            }

            res.json({
                success: true,
                data: {
                    tableId: tableContext.id,
                    tableNumber: tableContext.tableNumber,
                    restaurantId: tableContext.restaurantId,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PublicMenuController();
