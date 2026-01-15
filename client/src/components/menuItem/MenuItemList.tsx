import React from 'react';
import { SearchIcon, FilterIcon, ArrowUpDownIcon, SparklesIcon, XCircleIcon } from 'lucide-react';
import type { MenuItem, MenuCategory } from '../../hooks/useMenuItems';
import type { FieldHighlight } from '../../types/search.types';
import { MenuItemCard } from './MenuItemCard';
import { Pagination } from '../common/Pagination';

/**
 * MenuItemList Component
 * Task 4.2: Add Fuzzy Toggle to MenuItemList Search
 * Task 4.4: Add "No Results" State with Suggestions
 *
 * Displays a list of menu items with search, filters, and pagination.
 * Supports fuzzy search with toggle and match highlighting.
 */

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
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
  onToggleAvailability: (id: string) => void;
  onToggleSoldOut: (id: string) => void;

  // Highlight props for fuzzy search
  getItemHighlights?: (itemId: string) => FieldHighlight[];
  getItemRelevance?: (itemId: string) => number | undefined;

  // No results props
  suggestions?: MenuItem[];
  isSearchActive?: boolean;
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
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleSoldOut,
  // Highlight props
  getItemHighlights,
  getItemRelevance,
  // No results props
  suggestions = [],
  isSearchActive = false,
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

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md border border-antiflash p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search with Fuzzy Toggle */}
          <div className="lg:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-charcoal mb-2">
              <SearchIcon className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <div className="relative flex-1">
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full bg-gray-200 text-black px-4 py-2 pr-10 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              )}
            </div>
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
          {/* Smart Search Indicator - shown when search is active */}
          {isSearchActive && (
            <span className="px-2 py-1 bg-gradient-to-r from-naples/10 to-arylide/10 border border-naples/20 text-charcoal text-xs rounded-full flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-naples" />
              Smart search
            </span>
          )}
          <span className="px-2 py-1 bg-gray-200 text-charcoal text-xs rounded-full">
            Sort: {sortOptions.find((s) => s.value === sortBy)?.label} (
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
          </span>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-charcoal">{menuItems.length}</span> of{' '}
          <span className="font-semibold text-charcoal">{total}</span> menu items
          {/* Relevance sorting indicator - shown when search is active */}
          {isSearchActive && menuItems.length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-naples/10 border border-naples/20 text-charcoal">
              <SparklesIcon className="w-3 h-3 text-naples" />
              sorted by relevance
            </span>
          )}
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
              // Pass highlight data (Task 4.3)
              highlights={getItemHighlights?.(menuItem.id)}
              relevanceScore={getItemRelevance?.(menuItem.id)}
            />
          ))}
        </div>
      ) : (
        /* Enhanced No Results State (Task 4.4) */
        <div className="bg-white rounded-lg shadow-md border border-antiflash p-12">
          <div className="text-center max-w-md mx-auto">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>

            {/* Message */}
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              {searchQuery ? `No menu items match "${searchQuery}"` : 'No menu items found'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Try adjusting your filters or search terms'
                : 'Create your first menu item to get started!'}
            </p>

            {/* Suggestions (Task 4.4) */}
            {suggestions.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Did you mean:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSearchChange(item.name)}
                      className="px-3 py-1.5 bg-naples/10 hover:bg-naples/20 text-charcoal text-sm rounded-full border border-naples/20 transition-colors"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(searchQuery || selectedCategory !== 'ALL') && (
              <div className="flex justify-center gap-3">
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-charcoal text-sm font-medium rounded-md transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {(searchQuery || selectedCategory !== 'ALL') && (
                  <button
                    onClick={() => {
                      onSearchChange('');
                      onCategoryChange('ALL');
                    }}
                    className="px-4 py-2 bg-naples hover:bg-arylide text-charcoal text-sm font-medium rounded-md transition-colors"
                  >
                    Browse All
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="pt-4 border-t border-antiflash">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
};

