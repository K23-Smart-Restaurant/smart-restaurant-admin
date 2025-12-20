import { Router } from 'express';
import StaffController from '../controllers/StaffController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createWaiterSchema,
  createKitchenStaffSchema,
  updateUserSchema,
} from '../schemas/user.schema.js';

const router = Router();
const staffController = new StaffController();

// All staff routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Create waiter account
router.post(
  '/waiter',
  validate(createWaiterSchema),
  (req, res, next) => staffController.createWaiter(req, res, next)
);

// Create kitchen staff account
router.post(
  '/kitchen',
  validate(createKitchenStaffSchema),
  (req, res, next) => staffController.createKitchenStaff(req, res, next)
);

// Get all staff members
router.get('/', (req, res, next) => staffController.getAll(req, res, next));

// Update staff member
router.patch(
  '/:id',
  validate(updateUserSchema),
  (req, res, next) => staffController.update(req, res, next)
);

// Delete (deactivate) staff member
router.delete('/:id', (req, res, next) =>
  staffController.delete(req, res, next)
);

export default router;
