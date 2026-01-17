import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, Trash2Icon, ClockIcon, DollarSignIcon, StarIcon, EyeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MenuItem } from '../../hooks/useMenuItems';
import type { FieldHighlight } from '../../types/search.types';
import { HighlightedText } from '../common/HighlightedText';

/**
 * MenuItemCard Component
 * Task 4.3: Display Match Highlights in MenuItemCard
 *
 * Displays a menu item card with optional search highlighting.
 */

interface MenuItemCardProps {
  menuItem: MenuItem;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
  onToggleAvailability: (id: string) => void;
  onToggleSoldOut: (id: string) => void;

  // NEW: Fuzzy search props (Task 4.3)
  highlights?: FieldHighlight[];
  relevanceScore?: number;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  menuItem,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleSoldOut,
  highlights,
  relevanceScore,
}) => {
  const { t } = useTranslation('menu');
  const navigate = useNavigate();

  const handleDelete = () => {
    onDelete(menuItem);
  };

  const handleViewDetails = () => {
    navigate(`/menu/${menuItem.id}`);
  };

  const primaryPhotoUrl =
    menuItem.photos?.find((p) => p.isPrimary)?.url ||
    menuItem.photos?.[0]?.url ||
    menuItem.imageUrl ||
    '';

  const getCategoryLabel = () => {
    return menuItem.category?.name || t('categories.unknown');
  };

  const getCategoryColor = () => {
    // Dynamic category coloring based on category name
    // Can be enhanced later with color field from Category table
    return 'bg-gradient-to-r from-naples/20 to-arylide/30 text-charcoal shadow-sm';
  };

  // Extract highlights for specific fields (Task 4.3)
  const { nameHighlight, descriptionHighlight } = useMemo(() => {
    if (!highlights || highlights.length === 0) {
      return { nameHighlight: undefined, descriptionHighlight: undefined };
    }

    const nameField = highlights.find((h) => h.field === 'name');
    const descField = highlights.find((h) => h.field === 'description');

    return {
      nameHighlight: nameField?.segments,
      descriptionHighlight: descField?.segments,
    };
  }, [highlights]);

  // Render name with optional highlighting
  const renderName = () => {
    if (nameHighlight && nameHighlight.some((s) => s.isMatch)) {
      return (
        <HighlightedText
          segments={nameHighlight}
          textClassName="text-lg font-bold text-charcoal"
          highlightClassName="bg-gradient-to-b from-naples/20 to-naples/30 px-0.5 rounded font-bold text-charcoal"
          lineClamp={1}
        />
      );
    }
    return <span className="line-clamp-1">{menuItem.name}</span>;
  };

  // Render description with optional highlighting
  const renderDescription = () => {
    if (!menuItem.description) return null;

    if (descriptionHighlight && descriptionHighlight.some((s) => s.isMatch)) {
      return (
        <HighlightedText
          segments={descriptionHighlight}
          textClassName="text-sm text-gray-600"
          highlightClassName="bg-gradient-to-b from-naples/15 to-naples/25 px-0.5 rounded text-gray-700"
          lineClamp={2}
        />
      );
    }
    return <span className="line-clamp-2">{menuItem.description}</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-elevation-2 border border-gray-100 hover:border-gradient-primary/30 hover:shadow-elevation-3 transition-all duration-300 overflow-hidden group card-hover animate-fade-in-up">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {primaryPhotoUrl ? (
          <img
            src={primaryPhotoUrl}
            alt={menuItem.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">{t('form.noPhotos')}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Chef Recommendation Badge */}
        {menuItem.isChefRecommendation && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-naples to-arylide text-charcoal text-xs font-bold rounded-full flex items-center shadow-glow-yellow animate-bounce-gentle">
            <StarIcon className="w-3.5 h-3.5 mr-1 fill-current" />
            {t('card.chefsPick')}
          </div>
        )}

        {/* Relevance Score Badge (Task 4.3) */}
        {relevanceScore !== undefined && relevanceScore > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold rounded-full shadow-sm">
            {t('card.matchScore', { score: relevanceScore })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleViewDetails}
            className="p-2.5 bg-white/95 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 text-blue-600 hover:text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-110"
            title={t('card.viewDetails')}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(menuItem)}
            className="p-2.5 bg-white/95 backdrop-blur-sm hover:bg-gradient-to-r hover:from-gradient-primary hover:to-gradient-secondary text-gray-600 hover:text-white rounded-xl shadow-md hover:shadow-glow transition-all duration-300 transform hover:scale-110"
            title={t('card.editItem')}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2.5 bg-white/95 backdrop-blur-sm hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 text-red-600 hover:text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-110"
            title={t('card.deleteItem')}
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
            <h3 className="text-lg font-bold text-charcoal line-clamp-1">{renderName()}</h3>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryColor()}`}
            >
              {getCategoryLabel()}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{renderDescription()}</p>
        </div>

        {/* Price and Time */}
        <div className="flex items-center justify-between pt-2 border-t border-antiflash">
          <div className="flex items-center text-charcoal font-bold text-lg">
            <DollarSignIcon className="w-5 h-5 text-naples" />
            {Number(menuItem.price).toFixed(2)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-1" />
            {t('card.prepTime', { time: menuItem.preparationTime })}
          </div>
        </div>

        {/* Modifiers Count */}
        {menuItem.modifiers && menuItem.modifiers.length > 0 && (
          <div className="pt-2">
            <span className="text-xs text-gray-600">
              {t('card.modifiersAvailable', { count: menuItem.modifiers.length })}
            </span>
          </div>
        )}

        {/* Status Toggles */}
        <div className="pt-3 space-y-2 border-t border-antiflash">
          {/* Available Toggle */}
          <label className="flex items-center justify-between cursor-pointer group/toggle">
            <span className="text-sm text-charcoal">{t('form.isAvailable')}</span>
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
            <span className="text-sm text-charcoal">{t('form.isSoldOut')}</span>
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
              {t('card.unavailable')}
            </span>
          )}
          {menuItem.isSoldOut && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
              {t('card.soldOut')}
            </span>
          )}
          {menuItem.isAvailable && !menuItem.isSoldOut && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              {t('card.active')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
