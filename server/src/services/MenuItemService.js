import prisma from "../lib/prisma.js";

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
          modifiers: true,
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
        modifiers: true,
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

  async createMenuItem(data, imageUrl, uploadedPhotos = []) {
    // Parse numeric fields that might come as strings from FormData
    const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    const preparationTime = data.preparationTime
      ? (typeof data.preparationTime === 'string' ? parseInt(data.preparationTime) : data.preparationTime)
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
        isAvailable: data.isAvailable === 'true' || data.isAvailable === true,
        isSoldOut: data.isSoldOut === 'true' || data.isSoldOut === true,
        isChefRecommendation: data.isChefRecommendation === 'true' || data.isChefRecommendation === true,
      },
      include: {
        modifiers: true,
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
      return await prisma.menuItem.findUnique({
        where: { id: menuItem.id },
        include: {
          modifiers: true,
          categoryModel: true,
          photos: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
        },
      });
    }

    return menuItem;
  }

  async addModifiers(menuItemId, modifiers) {
    return await prisma.modifier.createMany({
      data: modifiers.map((m) => ({
        menuItemId,
        name: m.name,
        price: m.price,
        groupName: m.groupName,
      })),
    });
  }

  async updateModifiers(menuItemId, modifiers) {
    // Delete existing modifiers
    await prisma.modifier.deleteMany({ where: { menuItemId } });

    // Create new modifiers
    return this.addModifiers(menuItemId, modifiers);
  }

  async updateMenuItem(id, data, imageUrl, uploadedPhotos = []) {
    // Parse numeric fields that might come as strings from FormData
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) {
      updateData.price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    }
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    if (data.preparationTime !== undefined) {
      updateData.preparationTime = data.preparationTime
        ? (typeof data.preparationTime === 'string' ? parseInt(data.preparationTime) : data.preparationTime)
        : null;
    }
    if (data.isAvailable !== undefined) {
      updateData.isAvailable = data.isAvailable === 'true' || data.isAvailable === true;
    }
    if (data.isSoldOut !== undefined) {
      updateData.isSoldOut = data.isSoldOut === 'true' || data.isSoldOut === true;
    }
    if (data.isChefRecommendation !== undefined) {
      updateData.isChefRecommendation = data.isChefRecommendation === 'true' || data.isChefRecommendation === true;
    }

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        modifiers: true,
        categoryModel: true,
        photos: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
      },
    });

    // Create new photo records if photos were uploaded
    if (uploadedPhotos.length > 0) {
      await prisma.menuItemPhoto.createMany({
        data: uploadedPhotos.map((photo) => ({
          menuItemId: menuItem.id,
          url: photo.url,
          isPrimary: photo.isPrimary || false,
        })),
      });

      // Refetch to include new photos
      return await prisma.menuItem.findUnique({
        where: { id: menuItem.id },
        include: {
          modifiers: true,
          categoryModel: true,
          photos: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
        },
      });
    }

    return menuItem;
  }

  async updateStatus(id, status) {
    return await prisma.menuItem.update({
      where: { id },
      data: status,
    });
  }

  async deleteMenuItem(id) {
    // Soft delete: mark as unavailable
    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: false },
    });

    // Or hard delete:
    // await prisma.menuItem.delete({ where: { id } });
  }
}

export default MenuItemService;
