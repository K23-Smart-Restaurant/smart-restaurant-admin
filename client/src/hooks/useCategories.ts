import { useState } from 'react';

export interface Category {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean; // UI-only field (not in schema, used for filtering)
  itemCount: number; // Computed field (count of related MenuItems)
  createdAt: string;
  updatedAt: string;
}

// Initial mock data
const initialMockCategories: Category[] = [
  {
    id: "1",
    name: "Appetizers",
    description: "Start your meal right",
    displayOrder: 1,
    isActive: true,
    itemCount: 8,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Main Course",
    description: "Hearty main dishes",
    displayOrder: 2,
    isActive: true,
    itemCount: 15,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Desserts",
    description: "Sweet endings",
    displayOrder: 3,
    isActive: true,
    itemCount: 6,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Beverages",
    description: "Drinks and refreshments",
    displayOrder: 4,
    isActive: true,
    itemCount: 12,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(initialMockCategories);

  // Add new category
  const addCategory = (newCategory: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = (Math.max(...categories.map(c => parseInt(c.id)), 0) + 1).toString();
    const now = new Date().toISOString();
    
    const category: Category = {
      ...newCategory,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setCategories(prevCategories => [...prevCategories, category]);
    return category;
  };

  // Update existing category
  const updateCategory = (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === id
          ? { ...category, ...data, updatedAt: new Date().toISOString() }
          : category
      )
    );
  };

  // Delete category (soft delete - toggle isActive to false)
  const deleteCategory = (id: string) => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === id
          ? { ...category, isActive: false, updatedAt: new Date().toISOString() }
          : category
      )
    );
  };

  // Permanently remove from array (alternative to soft delete)
  const removeCategory = (id: string) => {
    setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
  };

  // Toggle active status
  const toggleActive = (id: string) => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === id
          ? { ...category, isActive: !category.isActive, updatedAt: new Date().toISOString() }
          : category
      )
    );
  };

  // Get active categories only
  const getActiveCategories = () => {
    return categories.filter(category => category.isActive);
  };

  // Get category by ID
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  // Sort categories by display order
  const getSortedCategories = () => {
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    removeCategory,
    toggleActive,
    getActiveCategories,
    getCategoryById,
    getSortedCategories,
  };
};
