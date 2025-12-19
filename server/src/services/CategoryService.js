import prisma from "../lib/prisma.js";

class CategoryService {
  async createCategory(data) {
    return await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder || 0,
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
    });
  }

  async deleteCategory(id) {
    // Check if category has menu items
    const count = await prisma.menuItem.count({
      where: { categoryId: id },
    });
    if (count > 0) {
      throw new Error(`Cannot delete category with ${count} menu items`);
    }

    await prisma.category.delete({ where: { id } });
  }
}

export default CategoryService;
