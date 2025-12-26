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

  async getById(req, res, next) {
    try {
      const menuItem = await menuItemService.getMenuItemById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }
      res.json({ success: true, data: menuItem });
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
          const uploaded = await StorageService.uploadMenuItemPhotos(
            filesToUpload,
            primaryIndex
          );
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

      const menuItem = await menuItemService.createMenuItem(
        req.body,
        imageUrl,
        uploadedPhotos
      );

      // Add modifiers if provided
      let finalMenuItem = menuItem;
      if (req.body.modifiers) {
        const modifiers =
          typeof req.body.modifiers === "string"
            ? JSON.parse(req.body.modifiers)
            : req.body.modifiers;
        if (Array.isArray(modifiers) && modifiers.length > 0) {
          await menuItemService.addModifiers(menuItem.id, modifiers);
          // Refetch to include modifiers
          finalMenuItem = await menuItemService.getMenuItemById(menuItem.id);
        }
      }

      res.status(201).json(finalMenuItem);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      // Upload new files to Supabase Storage
      let imageUrl = undefined;
      const uploadedPhotos = [];

      // Determine if an existing photo is being set as primary
      const primaryPhotoId = req.body.primaryPhotoId;
      const hasExistingPrimaryPhoto =
        primaryPhotoId &&
        typeof primaryPhotoId === "string" &&
        primaryPhotoId.length > 0;

      // Get primaryPhotoIndex from request body (for new photos)
      const primaryPhotoIndex =
        req.body.primaryPhotoIndex !== undefined
          ? parseInt(req.body.primaryPhotoIndex, 10)
          : null;

      if (req.files) {
        // Collect all files to upload
        const filesToUpload = [];
        // Default to -1 (no primary among new photos) if an existing photo is set as primary
        let primaryIndex = hasExistingPrimaryPhoto ? -1 : 0;

        // Check 'image' field first (for backward compatibility)
        if (req.files.image && req.files.image[0]) {
          filesToUpload.push(req.files.image[0]);
          if (!hasExistingPrimaryPhoto) {
            primaryIndex = 0;
          }
        }

        // Add 'photos' field files
        if (req.files.photos) {
          filesToUpload.push(...req.files.photos);
          // Use primaryPhotoIndex if provided and no existing photo is primary
          if (
            !hasExistingPrimaryPhoto &&
            primaryPhotoIndex !== null &&
            primaryPhotoIndex >= 0
          ) {
            primaryIndex = primaryPhotoIndex;
          } else if (
            !hasExistingPrimaryPhoto &&
            filesToUpload.length > 0 &&
            !req.files.image
          ) {
            primaryIndex = 0;
          }
        }

        // Upload all files to Supabase
        if (filesToUpload.length > 0) {
          const uploaded = await StorageService.uploadMenuItemPhotos(
            filesToUpload,
            primaryIndex
          );
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

      let menuItem = await menuItemService.updateMenuItem(
        req.params.id,
        req.body,
        imageUrl,
        uploadedPhotos
      );

      // Handle primary photo change for existing photos
      // (primaryPhotoId was already extracted at the start of update method)
      if (hasExistingPrimaryPhoto) {
        try {
          menuItem = await menuItemService.setPrimaryPhoto(
            req.params.id,
            primaryPhotoId
          );
        } catch (err) {
          console.warn("Failed to set primary photo:", err.message);
        }
      }

      // Update modifiers if provided
      let finalMenuItem = menuItem;
      if (req.body.modifiers) {
        const modifiers =
          typeof req.body.modifiers === "string"
            ? JSON.parse(req.body.modifiers)
            : req.body.modifiers;
        if (Array.isArray(modifiers)) {
          await menuItemService.updateModifiers(menuItem.id, modifiers);
          // Refetch to include updated modifiers
          finalMenuItem = await menuItemService.getMenuItemById(menuItem.id);
        }
      }

      res.json(finalMenuItem);
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
