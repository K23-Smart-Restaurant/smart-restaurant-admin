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

    let orderBy = { createdAt: "desc" };
    if (filters.sortBy === "name") {
      orderBy = { name: filters.sortOrder || "asc" };
    } else if (filters.sortBy === "price") {
      orderBy = { price: filters.sortOrder || "asc" };
    } else if (filters.sortBy === "popularity") {
      // TODO: Add orderItems count aggregation
      orderBy = { createdAt: "desc" };
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          modifiers: true,
          categoryModel: true,
        },
        orderBy,
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      prisma.menuItem.count({ where }),
    ]);

    return { items, total };
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
