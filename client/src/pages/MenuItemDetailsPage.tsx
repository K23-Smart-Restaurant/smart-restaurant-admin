import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ClockIcon,
  DollarSignIcon,
  StarIcon,
  PencilIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  LayersIcon,
  InfoIcon,
} from 'lucide-react';
import { menuItemService, type MenuItem } from '../services/menuItemService';
import { ImageGallery } from '../components/menuItem/ImageGallery';
import { Button } from '../components/common/Button';

const MenuItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!id) {
        setError('Invalid menu item ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await menuItemService.getById(id);
        if (data) {
          setMenuItem(data);
        } else {
          setError('Menu item not found');
        }
      } catch (err) {
        console.error('Error fetching menu item:', err);
        setError('Failed to load menu item details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItem();
  }, [id]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      APPETIZER: 'Appetizer',
      MAIN_COURSE: 'Main Course',
      DESSERT: 'Dessert',
      BEVERAGE: 'Beverage',
    };
    return labels[category] || category;
  };

  const getCategoryBg = (category: string) => {
    const colors: Record<string, string> = {
      APPETIZER: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800',
      MAIN_COURSE: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
      DESSERT: 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800',
      BEVERAGE: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back button skeleton */}
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse" />
            
            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-10 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-1/4 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-16 w-1/3 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !menuItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="secondary"
            icon={ArrowLeftIcon}
            onClick={() => navigate('/menu')}
            className="mb-8"
          >
            Back to Menu
          </Button>
          
          <div className="bg-white rounded-2xl shadow-elevation-2 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircleIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              {error || 'Menu item not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The menu item you're looking for doesn't exist or has been removed.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/menu')}
            >
              Return to Menu Management
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare images for gallery
  const galleryImages = menuItem.photos?.length
    ? menuItem.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        isPrimary: photo.isPrimary,
      }))
    : menuItem.imageUrl
    ? [{ url: menuItem.imageUrl, isPrimary: true }]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              icon={ArrowLeftIcon}
              onClick={() => navigate('/menu')}
            >
              Back to Menu
            </Button>
            
            <Button
              variant="primary"
              icon={PencilIcon}
              onClick={() => navigate('/menu', { state: { editItemId: menuItem.id } })}
            >
              Edit Item
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image Gallery */}
          <div className="animate-fade-in-up">
            <ImageGallery
              images={galleryImages}
              alt={menuItem.name}
            />
          </div>

          {/* Right Column - Item Details */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Title and Badges */}
            <div>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                {/* Chef's Recommendation Badge */}
                {menuItem.isChefRecommendation && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-naples to-arylide text-charcoal text-sm font-bold rounded-full shadow-glow-yellow animate-bounce-gentle">
                    <StarIcon className="w-4 h-4 mr-1.5 fill-current" />
                    Chef's Recommendation
                  </span>
                )}
                
                {/* Category Badge */}
                <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full shadow-sm ${getCategoryBg(menuItem.category)}`}>
                  <TagIcon className="w-4 h-4 mr-1.5" />
                  {getCategoryLabel(menuItem.category)}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-charcoal mb-2">
                {menuItem.name}
              </h1>
            </div>

            {/* Price Card */}
            <div className="bg-white rounded-2xl shadow-elevation-2 border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Price</p>
                  <div className="flex items-baseline">
                    <DollarSignIcon className="w-8 h-8 text-naples" />
                    <span className="text-4xl font-bold text-charcoal">
                      {Number(menuItem.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {menuItem.preparationTime && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium mb-1">Prep Time</p>
                    <div className="flex items-center text-charcoal">
                      <ClockIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-2xl font-semibold">{menuItem.preparationTime}</span>
                      <span className="text-gray-500 ml-1">min</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Availability Status */}
              <div className={`rounded-xl p-4 border transition-all duration-300 ${
                menuItem.isAvailable
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {menuItem.isAvailable ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-500 mr-3" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Availability</p>
                    <p className={`font-semibold ${menuItem.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                      {menuItem.isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sold Out Status */}
              <div className={`rounded-xl p-4 border transition-all duration-300 ${
                !menuItem.isSoldOut
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center">
                  {!menuItem.isSoldOut ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                  ) : (
                    <AlertCircleIcon className="w-6 h-6 text-orange-500 mr-3" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Stock Status</p>
                    <p className={`font-semibold ${!menuItem.isSoldOut ? 'text-green-700' : 'text-orange-700'}`}>
                      {menuItem.isSoldOut ? 'Sold Out' : 'In Stock'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {menuItem.description && (
              <div className="bg-white rounded-2xl shadow-elevation-1 border border-gray-100 p-6">
                <div className="flex items-center mb-3">
                  <InfoIcon className="w-5 h-5 text-naples mr-2" />
                  <h3 className="text-lg font-semibold text-charcoal">Description</h3>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {menuItem.description}
                </p>
              </div>
            )}

            {/* Modifiers Section */}
            {menuItem.modifiers && menuItem.modifiers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-elevation-1 border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <LayersIcon className="w-5 h-5 text-naples mr-2" />
                  <h3 className="text-lg font-semibold text-charcoal">
                    Modifiers & Options
                  </h3>
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {menuItem.modifiers.length} group{menuItem.modifiers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {menuItem.modifiers.map((group, groupIndex) => (
                    <div
                      key={group.id || groupIndex}
                      className="border border-gray-100 rounded-xl p-4 bg-gray-50/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-charcoal">{group.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              group.selectionType === 'single'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {group.selectionType === 'single' ? 'Single Select' : 'Multiple Select'}
                            </span>
                            {group.isRequired && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {group.options && group.options.length > 0 && (
                        <div className="space-y-2">
                          {group.options.map((option, optionIndex) => (
                            <div
                              key={option.id || optionIndex}
                              className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100"
                            >
                              <span className="text-gray-700">{option.name}</span>
                              {option.price > 0 && (
                                <span className="text-naples font-semibold">
                                  +${Number(option.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {menuItem.createdAt && (
                  <span>
                    Created: {new Date(menuItem.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                {menuItem.updatedAt && (
                  <span>
                    Updated: {new Date(menuItem.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-naples/5 to-arylide/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-naples/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
    </div>
  );
};

export default MenuItemDetailsPage;
