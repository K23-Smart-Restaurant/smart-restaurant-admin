import { Router } from "express";
import MenuItemController from "../controllers/MenuItemController.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadMenuItemPhotos, handleUploadError } from "../middleware/upload.middleware.js";

const router = Router();
const menuItemController = new MenuItemController();

router.use(authenticate, authorize("ADMIN"));

router.get("/", (req, res, next) => menuItemController.getAll(req, res, next));
router.get("/:id", (req, res, next) => menuItemController.getById(req, res, next));
router.post("/", handleUploadError(uploadMenuItemPhotos), (req, res, next) =>
  menuItemController.create(req, res, next)
);
router.patch("/:id", handleUploadError(uploadMenuItemPhotos), (req, res, next) =>
  menuItemController.update(req, res, next)
);
router.patch("/:id/status", (req, res, next) =>
  menuItemController.updateStatus(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  menuItemController.delete(req, res, next)
);

export default router;
