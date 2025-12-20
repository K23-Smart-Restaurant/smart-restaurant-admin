import { Router } from "express";
import MenuItemController from "../controllers/MenuItemController.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const router = Router();
const menuItemController = new MenuItemController();

router.use(authenticate, authorize("ADMIN"));

router.get("/", (req, res, next) => menuItemController.getAll(req, res, next));
router.post("/", uploadSingle, (req, res, next) =>
  menuItemController.create(req, res, next)
);
router.patch("/:id", uploadSingle, (req, res, next) =>
  menuItemController.update(req, res, next)
);
router.patch("/:id/status", (req, res, next) =>
  menuItemController.updateStatus(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  menuItemController.delete(req, res, next)
);

export default router;
