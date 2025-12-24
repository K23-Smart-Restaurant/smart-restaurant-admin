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

  async createMenuItem(data, imageUrl) {
    return await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        categoryId: data.categoryId,
        imageUrl,
        preparationTime: data.preparationTime,
        isAvailable: data.isAvailable ?? true,
        isSoldOut: data.isSoldOut ?? false,
        isChefRecommendation: data.isChefRecommendation ?? false,
      },
      include: {
        modifiers: true,
        categoryModel: true,
      },
    });
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

  async updateMenuItem(id, data, imageUrl) {
    const updateData = {
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      categoryId: data.categoryId,
      preparationTime: data.preparationTime,
      isAvailable: data.isAvailable,
      isSoldOut: data.isSoldOut,
      isChefRecommendation: data.isChefRecommendation,
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    return await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        modifiers: true,
        categoryModel: true,
      },
    });
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
