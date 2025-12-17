import React from 'react';
import { SearchIcon, FilterIcon, ArrowUpDownIcon } from 'lucide-react';
import type { MenuItem, MenuCategory } from '../../hooks/useMenuItems';
import { MenuItemCard } from './MenuItemCard';

interface MenuItemListProps {
  menuItems: MenuItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: MenuCategory | 'ALL';
  onCategoryChange: (category: MenuCategory | 'ALL') => void;
  sortBy: 'name' | 'price' | 'category' | 'createdAt' | 'popularity';
  onSortChange: (sortBy: 'name' | 'price' | 'category' | 'createdAt' | 'popularity') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
  onToggleAvailability: (id: string) => void;
  onToggleSoldOut: (id: string) => void;
}

export const MenuItemList: React.FC<MenuItemListProps> = ({
  menuItems,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleSoldOut,
}) => {
  const categoryOptions: Array<{ value: MenuCategory | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'APPETIZER', label: 'Appetizers' },
    { value: 'MAIN_COURSE', label: 'Main Courses' },
    { value: 'DESSERT', label: 'Desserts' },
    { value: 'BEVERAGE', label: 'Beverages' },
  ];

  const sortOptions: Array<{ value: typeof sortBy; label: string }> = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'category', label: 'Category' },
    { value: 'createdAt', label: 'Date Added' },
    { value: 'popularity', label: 'Popularity' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md border border-antiflash p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-charcoal mb-2">
              <SearchIcon className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-charcoal mb-2">
              <FilterIcon className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as MenuCategory | 'ALL')}
              className="w-full bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-charcoal mb-2">
              <ArrowUpDownIcon className="w-4 h-4 inline mr-1" />
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
                className="flex-1 bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={onSortOrderToggle}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-charcoal border border-antiflash rounded-md transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-600">Active filters:</span>
          {searchQuery && (
            <span className="px-2 py-1 bg-naples/20 text-charcoal text-xs rounded-full">
              Search: "{searchQuery}"
            </span>
          )}
          {selectedCategory !== 'ALL' && (
            <span className="px-2 py-1 bg-naples/20 text-charcoal text-xs rounded-full">
              Category: {categoryOptions.find((c) => c.value === selectedCategory)?.label}
            </span>
          )}
          <span className="px-2 py-1 bg-gray-200 text-charcoal text-xs rounded-full">
            Sort: {sortOptions.find((s) => s.value === sortBy)?.label} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
          </span>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-charcoal">{menuItems.length}</span> menu items
        </p>
      </div>

      {/* Menu Items Grid */}
      {menuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((menuItem) => (
            <MenuItemCard
              key={menuItem.id}
              menuItem={menuItem}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAvailability={onToggleAvailability}
              onToggleSoldOut={onToggleSoldOut}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-antiflash p-12 text-center">
          <p className="text-gray-600 mb-2">No menu items found</p>
          <p className="text-sm text-gray-500">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Try adjusting your filters'
              : 'Create your first menu item to get started!'}
          </p>
        </div>
      )}
    </div>
  );
};
