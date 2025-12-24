import MenuItemService from "../services/MenuItemService.js";
import StorageService from "../services/StorageService.js";

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
      // Upload files to Supabase Storage
      let imageUrl = undefined;
      const uploadedPhotos = [];

      if (req.files) {
        // Collect all files to upload
        const filesToUpload = [];
        let primaryIndex = 0;

        // Check 'image' field first (for backward compatibility)
        if (req.files.image && req.files.image[0]) {
          filesToUpload.push(req.files.image[0]);
          primaryIndex = 0;
        }

        // Add 'photos' field files
        if (req.files.photos) {
          const startIndex = filesToUpload.length;
          filesToUpload.push(...req.files.photos);
          // If no image was set, first photo becomes primary
          if (filesToUpload.length > 0 && !req.files.image) {
            primaryIndex = 0;
          }
        }

        // Upload all files to Supabase
        if (filesToUpload.length > 0) {
          const uploaded = await StorageService.uploadMenuItemPhotos(filesToUpload, primaryIndex);
          uploaded.forEach((photo) => {
            uploadedPhotos.push({
              url: photo.url,
              isPrimary: photo.isPrimary,
            });
            if (photo.isPrimary) {
              imageUrl = photo.url;
            }
          });
        }
      }

      const menuItem = await menuItemService.createMenuItem(req.body, imageUrl, uploadedPhotos);

      // Add modifiers if provided
      if (req.body.modifiers) {
        const modifiers = typeof req.body.modifiers === 'string'
          ? JSON.parse(req.body.modifiers)
          : req.body.modifiers;
        if (Array.isArray(modifiers)) {
          await menuItemService.addModifiers(menuItem.id, modifiers);
        }
      }

      res.status(201).json(menuItem);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      // Upload new files to Supabase Storage
      let imageUrl = undefined;
      const uploadedPhotos = [];

      if (req.files) {
        // Collect all files to upload
        const filesToUpload = [];
        let primaryIndex = 0;

        // Check 'image' field first (for backward compatibility)
        if (req.files.image && req.files.image[0]) {
          filesToUpload.push(req.files.image[0]);
          primaryIndex = 0;
        }

        // Add 'photos' field files
        if (req.files.photos) {
          filesToUpload.push(...req.files.photos);
          // If no image was set, first photo becomes primary
          if (filesToUpload.length > 0 && !req.files.image) {
            primaryIndex = 0;
          }
        }

        // Upload all files to Supabase
        if (filesToUpload.length > 0) {
          const uploaded = await StorageService.uploadMenuItemPhotos(filesToUpload, primaryIndex);
          uploaded.forEach((photo) => {
            uploadedPhotos.push({
              url: photo.url,
              isPrimary: photo.isPrimary,
            });
            if (photo.isPrimary) {
              imageUrl = photo.url;
            }
          });
        }
      }

      const menuItem = await menuItemService.updateMenuItem(
        req.params.id,
        req.body,
        imageUrl,
        uploadedPhotos
      );

      // Update modifiers if provided
      if (req.body.modifiers) {
        const modifiers = typeof req.body.modifiers === 'string'
          ? JSON.parse(req.body.modifiers)
          : req.body.modifiers;
        if (Array.isArray(modifiers)) {
          await menuItemService.updateModifiers(menuItem.id, modifiers);
        }
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

