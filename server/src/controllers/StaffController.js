import StaffService from '../services/StaffService.js';

const staffService = new StaffService();

class StaffController {
  /**
   * Create a new waiter account
   * POST /api/staff/waiter
   */
  async createWaiter(req, res, next) {
    try {
      const waiter = await staffService.createWaiter(req.body);
      res.status(201).json({
        success: true,
        message: 'Waiter account created successfully',
        data: waiter,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new kitchen staff account
   * POST /api/staff/kitchen
   */
  async createKitchenStaff(req, res, next) {
    try {
      const kitchenStaff = await staffService.createKitchenStaff(req.body);
      res.status(201).json({
        success: true,
        message: 'Kitchen staff account created successfully',
        data: kitchenStaff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all staff members
   * GET /api/staff
   */
  async getAll(req, res, next) {
    try {
      const { role, search } = req.query;
      const staff = await staffService.getStaff({ role, search });
      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update staff member information
   * PATCH /api/staff/:id
   */
  async update(req, res, next) {
    try {
      const updatedStaff = await staffService.updateStaff(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Staff member updated successfully',
        data: updatedStaff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate (delete) a staff member
   * DELETE /api/staff/:id
   */
  async delete(req, res, next) {
    try {
      const result = await staffService.deactivateStaff(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default StaffController;
