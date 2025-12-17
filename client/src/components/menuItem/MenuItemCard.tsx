import React from 'react';
import { PencilIcon, Trash2Icon, ClockIcon, DollarSignIcon, StarIcon } from 'lucide-react';
import type { MenuItem } from '../../hooks/useMenuItems';

interface MenuItemCardProps {
  menuItem: MenuItem;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
  onToggleAvailability: (id: string) => void;
  onToggleSoldOut: (id: string) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  menuItem,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleSoldOut,
}) => {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${menuItem.name}"?`)) {
      onDelete(menuItem);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      APPETIZER: 'Appetizer',
      MAIN_COURSE: 'Main Course',
      DESSERT: 'Dessert',
      BEVERAGE: 'Beverage',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      APPETIZER: 'bg-green-100 text-green-800',
      MAIN_COURSE: 'bg-blue-100 text-blue-800',
      DESSERT: 'bg-pink-100 text-pink-800',
      BEVERAGE: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-white hover:border-naples/80 hover:shadow-lg hover:shadow-naples/30 transition-all duration-200 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {menuItem.imageUrls && menuItem.imageUrls.length > 0 ? (
          <img
            src={menuItem.imageUrls[0]}
            alt={menuItem.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Chef Recommendation Badge */}
        {menuItem.isChefRecommendation && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-naples text-charcoal text-xs font-semibold rounded-full flex items-center shadow-md">
            <StarIcon className="w-3 h-3 mr-1 fill-current" />
            Chef's Pick
          </div>
        )}

        {/* Multiple Images Indicator */}
        {menuItem.imageUrls && menuItem.imageUrls.length > 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
            +{menuItem.imageUrls.length - 1} more
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(menuItem)}
            className="p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-charcoal rounded-md shadow-md transition-colors"
            title="Edit menu item"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 rounded-md shadow-md transition-colors"
            title="Delete menu item"
          >
            <Trash2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title and Category */}
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-bold text-charcoal line-clamp-1">{menuItem.name}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(menuItem.category)}`}>
              {getCategoryLabel(menuItem.category)}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{menuItem.description}</p>
        </div>

        {/* Price and Time */}
        <div className="flex items-center justify-between pt-2 border-t border-antiflash">
          <div className="flex items-center text-charcoal font-bold text-lg">
            <DollarSignIcon className="w-5 h-5 text-naples" />
            {menuItem.price.toFixed(2)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-1" />
            {menuItem.preparationTime} min
          </div>
        </div>

        {/* Modifiers Count */}
        {menuItem.modifiers && menuItem.modifiers.length > 0 && (
          <div className="pt-2">
            <span className="text-xs text-gray-600">
              {menuItem.modifiers.length} modifier{menuItem.modifiers.length !== 1 ? 's' : ''} available
            </span>
          </div>
        )}

        {/* Status Toggles */}
        <div className="pt-3 space-y-2 border-t border-antiflash">
          {/* Available Toggle */}
          <label className="flex items-center justify-between cursor-pointer group/toggle">
            <span className="text-sm text-charcoal">Available for Ordering</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={menuItem.isAvailable}
                onChange={() => onToggleAvailability(menuItem.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-naples transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>

          {/* Sold Out Toggle */}
          <label className="flex items-center justify-between cursor-pointer group/toggle">
            <span className="text-sm text-charcoal">Sold Out</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={menuItem.isSoldOut}
                onChange={() => onToggleSoldOut(menuItem.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-red-500 peer-focus:ring-2 peer-focus:ring-naples transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {!menuItem.isAvailable && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
              Unavailable
            </span>
          )}
          {menuItem.isSoldOut && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
              Sold Out
            </span>
          )}
          {menuItem.isAvailable && !menuItem.isSoldOut && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
