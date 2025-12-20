import { Router } from "express";
import TableController from "../controllers/TableController.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createTableSchema,
  updateTableSchema,
} from "../schemas/table.schema.js";

const router = Router();
const tableController = new TableController();

// Public route for QR code validation (used by customer app)
router.get("/validate-qr", (req, res, next) =>
  tableController.validateQRToken(req, res, next)
);

// Protected routes (require authentication)
router.use(authenticate, authorize("ADMIN"));

router.get("/", (req, res, next) => tableController.getAll(req, res, next));
router.post("/", validate(createTableSchema), (req, res, next) =>
  tableController.create(req, res, next)
);

// Batch operations (must come before /:id routes)
router.post("/batch/download", (req, res, next) =>
  tableController.downloadBatchQR(req, res, next)
);
router.post("/batch/regenerate", (req, res, next) =>
  tableController.bulkRegenerateQR(req, res, next)
);

// Single table operations
router.patch("/:id", validate(updateTableSchema), (req, res, next) =>
  tableController.update(req, res, next)
);
router.post("/:id/regenerate-qr", (req, res, next) =>
  tableController.regenerateQR(req, res, next)
);
router.get("/:id/qr-code", (req, res, next) =>
  tableController.downloadQR(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  tableController.delete(req, res, next)
);

export default router;
