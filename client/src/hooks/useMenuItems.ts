import { useState, useMemo } from 'react';

export type MenuCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGE';

export interface Modifier {
  id: string;
  name: string;
  price: number;
  groupName: string; // e.g., "Size", "Extras"
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrls: string[]; // Multiple images
  isAvailable: boolean;
  isSoldOut: boolean;
  isChefRecommendation: boolean;
  preparationTime: number; // in minutes
  categoryId?: string;
  modifiers: Modifier[];
  createdAt: string;
  updatedAt: string;
}

// Mock data
const initialMockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with parmesan cheese and croutons",
    category: "APPETIZER",
    price: 8.99,
    imageUrls: ["https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400"],
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    preparationTime: 10,
    categoryId: "1",
    modifiers: [
      { id: "m1", name: "Extra Dressing", price: 1.5, groupName: "Extras" },
      { id: "m2", name: "Add Chicken", price: 3.5, groupName: "Extras" },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with herbs and lemon butter",
    category: "MAIN_COURSE",
    price: 24.99,
    imageUrls: ["https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400"],
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: true,
    preparationTime: 25,
    categoryId: "2",
    modifiers: [
      { id: "m3", name: "Small", price: 0, groupName: "Size" },
      { id: "m4", name: "Large", price: 5, groupName: "Size" },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    category: "MAIN_COURSE",
    price: 14.99,
    imageUrls: ["https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"],
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    preparationTime: 20,
    categoryId: "2",
    modifiers: [
      { id: "m5", name: "Regular (12\")", price: 0, groupName: "Size" },
      { id: "m6", name: "Large (16\")", price: 6, groupName: "Size" },
      { id: "m7", name: "Extra Cheese", price: 2, groupName: "Extras" },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    category: "DESSERT",
    price: 7.99,
    imageUrls: ["https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400"],
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: true,
    preparationTime: 15,
    categoryId: "3",
    modifiers: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "5",
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam",
    category: "BEVERAGE",
    price: 4.50,
    imageUrls: ["https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400"],
    isAvailable: false,
    isSoldOut: true,
    isChefRecommendation: false,
    preparationTime: 5,
    categoryId: "4",
    modifiers: [
      { id: "m8", name: "Small", price: 0, groupName: "Size" },
      { id: "m9", name: "Medium", price: 1, groupName: "Size" },
      { id: "m10", name: "Large", price: 2, groupName: "Size" },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "6",
    name: "Spring Rolls",
    description: "Crispy vegetable spring rolls with sweet chili sauce",
    category: "APPETIZER",
    price: 6.99,
    imageUrls: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"],
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    preparationTime: 12,
    categoryId: "1",
    modifiers: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "7",
    name: "Beef Burger",
    description: "Juicy beef patty with lettuce, tomato, cheese, and special sauce",
    category: "MAIN_COURSE",
    price: 12.99,
    imageUrls: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"],
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: true,
    preparationTime: 18,
    categoryId: "2",
    modifiers: [
      { id: "m11", name: "Single Patty", price: 0, groupName: "Size" },
      { id: "m12", name: "Double Patty", price: 4, groupName: "Size" },
      { id: "m13", name: "Bacon", price: 2.5, groupName: "Extras" },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "8",
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee and mascarpone",
    category: "DESSERT",
    price: 8.50,
    imageUrls: ["https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400"],
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    preparationTime: 10,
    categoryId: "3",
    modifiers: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

type SortOption = 'name' | 'price' | 'category' | 'createdAt' | 'popularity';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMockMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort menu items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...menuItems];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'popularity':
          // Mock popularity based on chef recommendation
          comparison = (a.isChefRecommendation ? 1 : 0) - (b.isChefRecommendation ? 1 : 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [menuItems, searchQuery, selectedCategory, sortBy, sortOrder]);

  // CRUD operations
  const createMenuItem = (newItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item: MenuItem = {
      ...newItem,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMenuItems((prev) => [...prev, item]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isAvailable: !item.isAvailable, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const toggleSoldOut = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isSoldOut: !item.isSoldOut, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  return {
    menuItems: filteredAndSortedItems,
    allMenuItems: menuItems,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleSoldOut,
  };
};
