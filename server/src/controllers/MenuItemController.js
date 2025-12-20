import MenuItemService from "../services/MenuItemService.js";

const menuItemService = new MenuItemService();

class MenuItemController {
  async getAll(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        category: req.query.category,
        categoryId: req.query.categoryId,
        isAvailable: req.query.isAvailable === "true" ? true : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      };
      const result = await menuItemService.getMenuItems(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const imageUrl = req.file
        ? `/uploads/menu-items/${req.file.filename}`
        : undefined;
      const menuItem = await menuItemService.createMenuItem(req.body, imageUrl);

      // Add modifiers if provided
      if (req.body.modifiers && Array.isArray(req.body.modifiers)) {
        await menuItemService.addModifiers(menuItem.id, req.body.modifiers);
      }

      res.status(201).json(menuItem);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const imageUrl = req.file
        ? `/uploads/menu-items/${req.file.filename}`
        : undefined;
      const menuItem = await menuItemService.updateMenuItem(
        req.params.id,
        req.body,
        imageUrl
      );

      // Update modifiers if provided
      if (req.body.modifiers && Array.isArray(req.body.modifiers)) {
        await menuItemService.updateModifiers(menuItem.id, req.body.modifiers);
      }

      res.json(menuItem);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const menuItem = await menuItemService.updateStatus(
        req.params.id,
        req.body
      );
      res.json(menuItem);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await menuItemService.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default MenuItemController;
