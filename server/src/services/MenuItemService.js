import prisma from "../lib/prisma.js";
import StorageService from "./StorageService.js";

class MenuItemService {
  async getMenuItems(filters) {
    const where = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    // M2: Handle popularity sorting separately using aggregation
    if (filters.sortBy === "popularity") {
      return this.getMenuItemsByPopularity(where, filters);
    }

    let orderBy = { createdAt: "desc" };
    if (filters.sortBy === "name") {
      orderBy = { name: filters.sortOrder || "asc" };
    } else if (filters.sortBy === "price") {
      orderBy = { price: filters.sortOrder || "asc" };
    } else if (filters.sortBy === "category") {
      orderBy = { category: filters.sortOrder || "asc" };
    } else if (filters.sortBy === "createdAt") {
      orderBy = { createdAt: filters.sortOrder || "desc" };
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          modifiers: {
            include: {
              modifiers: true,
            },
          },
          categoryModel: true,
          photos: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.menuItem.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * M2: Get menu items sorted by popularity (order count)
   * Uses aggregation to count total orders per menu item
   */
  async getMenuItemsByPopularity(where, filters) {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const sortOrder = filters.sortOrder || "desc";

    // Get all matching items with their order counts
    const itemsWithCounts = await prisma.menuItem.findMany({
      where,
      include: {
        modifiers: {
          include: {
            modifiers: true,
          },
        },
        categoryModel: true,
        photos: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    // Sort by order count (popularity)
    const sorted = itemsWithCounts.sort((a, b) => {
      const countA = a._count.orderItems;
      const countB = b._count.orderItems;
      return sortOrder === "desc" ? countB - countA : countA - countB;
    });

    // Apply pagination
    const paginated = sorted.slice(offset, offset + limit);

    // Add popularity score to each item
    const itemsWithPopularity = paginated.map((item) => ({
      ...item,
      popularityScore: item._count.orderItems,
    }));

    return { items: itemsWithPopularity, total: sorted.length };
  }

  async getMenuItemById(id) {
    return await prisma.menuItem.findUnique({
      where: { id },
      include: {
        modifiers: {
          include: {
            modifiers: true,
          },
        },
        categoryModel: true,
        photos: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      },
    });
  }

  async createMenuItem(data, imageUrl, uploadedPhotos = []) {
    // Parse numeric fields that might come as strings from FormData
    const price =
      typeof data.price === "string" ? parseFloat(data.price) : data.price;
    const preparationTime = data.preparationTime
      ? typeof data.preparationTime === "string"
        ? parseInt(data.preparationTime)
        : data.preparationTime
      : null;

    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        price,
        categoryId: data.categoryId || null,
        imageUrl,
        preparationTime,
        isAvailable: data.isAvailable === "true" || data.isAvailable === true,
        isSoldOut: data.isSoldOut === "true" || data.isSoldOut === true,
        isChefRecommendation:
          data.isChefRecommendation === "true" ||
          data.isChefRecommendation === true,
      },
      include: {
        modifiers: {
          include: {
            modifiers: true,
          },
        },
        categoryModel: true,
        photos: true,
      },
    });

    // Create photo records if photos were uploaded
    if (uploadedPhotos.length > 0) {
      await prisma.menuItemPhoto.createMany({
        data: uploadedPhotos.map((photo) => ({
          menuItemId: menuItem.id,
          url: photo.url,
          isPrimary: photo.isPrimary || false,
        })),
      });

      // Refetch to include photos
      return await this.getMenuItemById(menuItem.id);
    }

    return menuItem;
  }

  async addModifiers(menuItemId, modifiers) {
    // Group modifiers by groupName
    const groupMap = new Map();

    for (const modifier of modifiers) {
      const groupName = modifier.groupName || "Default";
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, []);
      }
      groupMap.get(groupName).push(modifier);
    }

    // Create modifier groups and their modifiers
    for (const [groupName, groupModifiers] of groupMap.entries()) {
      // Create the modifier group
      const modifierGroup = await prisma.modifierGroup.create({
        data: {
          menuItemId,
          name: groupName,
          selectionType: groupModifiers[0]?.selectionType || "multiple",
          isRequired: groupModifiers[0]?.isRequired || false,
          minSelections: groupModifiers[0]?.minSelections || 0,
          maxSelections: groupModifiers[0]?.maxSelections || null,
          displayOrder: groupModifiers[0]?.displayOrder || 0,
        },
      });

      // Create modifiers for this group
      await prisma.modifier.createMany({
        data: groupModifiers.map((m, index) => ({
          modifierGroupId: modifierGroup.id,
          name: m.name,
          price: m.price,
          displayOrder: m.displayOrder || index,
        })),
      });
    }
  }

  async updateModifiers(menuItemId, modifiers) {
    // Delete existing modifier groups (this cascades to modifiers)
    await prisma.modifierGroup.deleteMany({ where: { menuItemId } });

    // Create new modifiers
    return this.addModifiers(menuItemId, modifiers);
  }

  async updateMenuItem(id, data, imageUrl, uploadedPhotos = []) {
    // Parse numeric fields that might come as strings from FormData
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description || null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) {
      updateData.price =
        typeof data.price === "string" ? parseFloat(data.price) : data.price;
    }
    if (data.categoryId !== undefined)
      updateData.categoryId = data.categoryId || null;
    if (data.preparationTime !== undefined) {
      updateData.preparationTime = data.preparationTime
        ? typeof data.preparationTime === "string"
          ? parseInt(data.preparationTime)
          : data.preparationTime
        : null;
    }
    if (data.isAvailable !== undefined) {
      updateData.isAvailable =
        data.isAvailable === "true" || data.isAvailable === true;
    }
    if (data.isSoldOut !== undefined) {
      updateData.isSoldOut =
        data.isSoldOut === "true" || data.isSoldOut === true;
    }
    if (data.isChefRecommendation !== undefined) {
      updateData.isChefRecommendation =
        data.isChefRecommendation === "true" ||
        data.isChefRecommendation === true;
    }

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        modifiers: {
          include: {
            modifiers: true,
          },
        },
        categoryModel: true,
        photos: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      },
    });

    // Create new photo records if photos were uploaded
    if (uploadedPhotos.length > 0) {
      // Check if any of the new photos is marked as primary
      const hasNewPrimaryPhoto = uploadedPhotos.some(
        (photo) => photo.isPrimary
      );

      // If a new photo is set as primary, reset all existing photos' isPrimary to false
      if (hasNewPrimaryPhoto) {
        await prisma.menuItemPhoto.updateMany({
          where: { menuItemId: menuItem.id },
          data: { isPrimary: false },
        });
      }

      await prisma.menuItemPhoto.createMany({
        data: uploadedPhotos.map((photo) => ({
          menuItemId: menuItem.id,
          url: photo.url,
          isPrimary: photo.isPrimary || false,
        })),
      });

      // Refetch to include new photos
      return await this.getMenuItemById(menuItem.id);
    }

    return menuItem;
  }

  /**
   * Set a specific photo as the primary photo for a menu item
   * Also updates the legacy imageUrl field with the primary photo's URL
   */
  async setPrimaryPhoto(menuItemId, photoId) {
    // First, verify the photo belongs to this menu item
    const photo = await prisma.menuItemPhoto.findFirst({
      where: {
        id: photoId,
        menuItemId: menuItemId,
      },
    });

    if (!photo) {
      throw new Error("Photo not found or does not belong to this menu item");
    }

    // Reset all photos' isPrimary to false for this menu item
    await prisma.menuItemPhoto.updateMany({
      where: { menuItemId: menuItemId },
      data: { isPrimary: false },
    });

    // Set the specified photo as primary
    await prisma.menuItemPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    // Update the legacy imageUrl field on the menu item
    await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { imageUrl: photo.url },
    });

    return await this.getMenuItemById(menuItemId);
  }

  async updateStatus(id, status) {
    return await prisma.menuItem.update({
      where: { id },
      data: status,
    });
  }

  /**
   * Delete a menu item permanently from the database (hard delete)
   * Also removes associated photos from Supabase and database, plus modifier groups
   */
  async deleteMenuItem(id) {
    // First, fetch the menu item with all photos to get URLs for deletion
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        photos: true,
      },
    });

    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    // Delete photos from Supabase Storage
    const photoUrls = [];

    // Collect photo URLs from MenuItemPhoto records
    if (menuItem.photos && menuItem.photos.length > 0) {
      menuItem.photos.forEach((photo) => {
        if (photo.url) photoUrls.push(photo.url);
      });
    }

    // Also include the legacy imageUrl if it exists
    if (menuItem.imageUrl) {
      photoUrls.push(menuItem.imageUrl);
    }

    // Delete all photos from Supabase bucket
    if (photoUrls.length > 0) {
      await Promise.allSettled(
        photoUrls.map((url) => StorageService.deleteFileByUrl(url))
      );
    }

    // Delete associated photo records from database
    await prisma.menuItemPhoto.deleteMany({
      where: { menuItemId: id },
    });

    // Delete associated modifier groups and their modifiers (cascade should handle modifiers)
    await prisma.modifierGroup.deleteMany({
      where: { menuItemId: id },
    });

    // Finally, delete the menu item
    return await prisma.menuItem.delete({
      where: { id },
    });
  }
}

export default MenuItemService;
