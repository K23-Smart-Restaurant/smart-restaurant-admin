import { Router } from "express";
import CategoryController from "../controllers/CategoryController.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema.js";

const router = Router();
const categoryController = new CategoryController();

router.use(authenticate, authorize("ADMIN"));

router.post("/", validate(createCategorySchema), (req, res, next) =>
  categoryController.create(req, res, next)
);
router.get("/", (req, res, next) => categoryController.getAll(req, res, next));
router.patch("/:id", validate(updateCategorySchema), (req, res, next) =>
  categoryController.update(req, res, next)
);
router.patch("/:id/status", (req, res, next) =>
  categoryController.updateStatus(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  categoryController.delete(req, res, next)
);

export default router;
