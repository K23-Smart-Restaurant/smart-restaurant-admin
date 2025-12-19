import { Router } from "express";
import OrderController from "../controllers/OrderController.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { updateOrderStatusSchema } from "../schemas/order.schema.js";

const router = Router();
const orderController = new OrderController();

router.use(authenticate, authorize("ADMIN", "WAITER", "KITCHEN_STAFF"));

router.get("/", (req, res, next) => orderController.getAll(req, res, next));
router.get("/:id", (req, res, next) => orderController.getById(req, res, next));
router.patch(
    "/:id/status",
    authorize("ADMIN", "WAITER"),
    validate(updateOrderStatusSchema),
    (req, res, next) => orderController.updateStatus(req, res, next)
);

export default router;
