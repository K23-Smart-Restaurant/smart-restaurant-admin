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

  async deleteCategory(id) {
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
