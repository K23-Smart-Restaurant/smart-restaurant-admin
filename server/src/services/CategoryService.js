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
   * M4: Delete/deactivate a category with validation
   * Prevents deletion if category contains active menu items
   */
  async deleteCategory(id) {
    // M4: Check for active menu items in this category
    const activeItemsCount = await prisma.menuItem.count({
      where: {
        categoryId: id,
        isAvailable: true,
      },
    });

    if (activeItemsCount > 0) {
      const error = new Error(
        `Cannot deactivate category: it contains ${activeItemsCount} active menu item(s). ` +
        `Please move or deactivate these items first.`
      );
      error.statusCode = 400;
      error.code = "CATEGORY_HAS_ACTIVE_ITEMS";
      error.details = {
        categoryId: id,
        activeItemsCount,
      };
      throw error;
    }

    // Soft delete - set isActive to false instead of hard delete
    return await prisma.category.update({
      where: { id },
      data: { isActive: false },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });
  }
}

export default CategoryService;
