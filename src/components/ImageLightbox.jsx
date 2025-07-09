import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiChevronLeft, FiChevronRight, FiExternalLink } = FiIcons;

const ImageLightbox = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    // Add overflow hidden to body when lightbox is open to prevent scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      // Restore body overflow when lightbox is closed
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <SafeIcon icon={FiX} className="h-8 w-8" />
        </button>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <SafeIcon icon={FiChevronLeft} className="h-8 w-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <SafeIcon icon={FiChevronRight} className="h-8 w-8" />
            </button>
          </>
        )}

        {/* Main Image */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-[90vw] max-h-[85vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={currentImage.src}
              alt={`Gallery image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
              style={{ margin: 'auto' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Instagram Link */}
          {currentImage.type === 'instagram' && currentImage.url && (
            <a
              href={currentImage.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
            </a>
          )}
        </motion.div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg overflow-x-auto max-w-[90vw]">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors flex-shrink-0 ${
                  index === currentIndex ? 'border-white' : 'border-transparent'
                }`}
              >
                <img
                  src={image.src}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;