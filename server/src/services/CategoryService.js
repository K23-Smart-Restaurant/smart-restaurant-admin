import prisma from "../lib/prisma.js";

class CategoryService {
  async createCategory(data) {
    return await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });
  }

  async getCategories() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });
  }

  async updateCategory(id, data) {
    return await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });
  }

  /**
   * Delete a category from the database (hard delete)
   * M4: Prevents deletion if category contains any menu items
   */
  async deleteCategory(id) {
    // M4: Check for any menu items in this category (not just active ones)
    const itemsCount = await prisma.menuItem.count({
      where: {
        categoryId: id,
      },
    });

    if (itemsCount > 0) {
      const error = new Error(
        `Cannot delete category: it contains ${itemsCount} menu item(s). ` +
        `Please move or delete these items first.`
      );
      error.statusCode = 400;
      error.code = "CATEGORY_HAS_ITEMS";
      error.details = {
        categoryId: id,
        itemsCount,
      };
      throw error;
    }

    // Hard delete - remove from database
    return await prisma.category.delete({
      where: { id },
    });
  }
}

export default CategoryService;
