import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, XIcon } from 'lucide-react';

interface ImageGalleryProps {
  images: Array<{
    id?: string;
    url: string;
    isPrimary?: boolean;
  }>;
  alt?: string;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  alt = 'Menu item image',
  className = '',
}) => {
  // Sort images to put primary first
  const sortedImages = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    const sorted = [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
    return sorted;
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset current index when images change
  useEffect(() => {
    setCurrentIndex(0);
    setIsImageLoaded(false);
  }, [images]);

  const hasImages = sortedImages.length > 0;
  const hasMultipleImages = sortedImages.length > 1;

  const goToPrevious = useCallback(() => {
    setIsImageLoaded(false);
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  }, [sortedImages.length]);

  const goToNext = useCallback(() => {
    setIsImageLoaded(false);
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  }, [sortedImages.length]);

  const goToSlide = useCallback((index: number) => {
    setIsImageLoaded(false);
    setCurrentIndex(index);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultipleImages) return;
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape' && isLightboxOpen) setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleImages, goToPrevious, goToNext, isLightboxOpen]);

  // Touch swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultipleImages) goToNext();
    if (isRightSwipe && hasMultipleImages) goToPrevious();
  };

  // Placeholder for no images
  if (!hasImages) {
    return (
      <div className={`relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden ${className}`}>
        <div className="aspect-[4/3] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-300/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Main Image Container */}
        <div
          className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-elevation-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Aspect ratio container */}
          <div className="aspect-[4/3] relative overflow-hidden">
            {/* Loading skeleton */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
            )}

            {/* Main Image */}
            <img
              src={sortedImages[currentIndex]?.url}
              alt={`${alt} ${currentIndex + 1}`}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              onLoad={() => setIsImageLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600?text=Image+Not+Found';
                setIsImageLoaded(true);
              }}
            />

            {/* Gradient overlay for better button visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

            {/* Zoom button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md
                         opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0
                         transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-110
                         focus:outline-none focus:ring-2 focus:ring-naples"
              title="View full size"
            >
              <ZoomInIcon className="w-5 h-5 text-charcoal" />
            </button>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md
                             opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0
                             transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-110
                             focus:outline-none focus:ring-2 focus:ring-naples"
                  title="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-charcoal" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md
                             opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0
                             transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-110
                             focus:outline-none focus:ring-2 focus:ring-naples"
                  title="Next image"
                >
                  <ChevronRightIcon className="w-5 h-5 text-charcoal" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full
                              text-white text-sm font-medium shadow-md">
                {currentIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {hasMultipleImages && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin">
            {sortedImages.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden
                           transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-naples
                           ${currentIndex === index
                             ? 'ring-2 ring-naples shadow-glow-yellow scale-105'
                             : 'ring-1 ring-gray-200 hover:ring-naples/50 hover:scale-105 opacity-70 hover:opacity-100'
                           }`}
              >
                <img
                  src={image.url}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Error';
                  }}
                />
                {/* Active indicator overlay */}
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-naples/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Dot Indicators (alternative for mobile) */}
        {hasMultipleImages && (
          <div className="mt-3 flex justify-center gap-2 md:hidden">
            {sortedImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none
                           ${currentIndex === index
                             ? 'bg-naples w-6 shadow-glow-yellow'
                             : 'bg-gray-300 hover:bg-naples/50'
                           }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-sm rounded-full
                       text-white hover:bg-white/20 transition-all duration-300 hover:scale-110
                       focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
            title="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>

          {/* Lightbox Navigation */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full
                           text-white hover:bg-white/20 transition-all duration-300 hover:scale-110
                           focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
                title="Previous image"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full
                           text-white hover:bg-white/20 transition-all duration-300 hover:scale-110
                           focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
                title="Next image"
              >
                <ChevronRightIcon className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Lightbox Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={sortedImages[currentIndex]?.url}
              alt={`${alt} ${currentIndex + 1} (full size)`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-scale-in"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/1200x900?text=Image+Not+Found';
              }}
            />
          </div>

          {/* Lightbox Counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm
                            rounded-full text-white font-medium">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          )}

          {/* Lightbox Thumbnail Strip */}
          {hasMultipleImages && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 px-4">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-300
                             ${currentIndex === index
                               ? 'ring-2 ring-white scale-110'
                               : 'ring-1 ring-white/30 opacity-60 hover:opacity-100 hover:scale-105'
                             }`}
                >
                  <img
                    src={image.url}
                    alt={`${alt} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
