import React from 'react';
import { Card } from '../game/data/cardTypes';

/**
 * Gets a placeholder URL for a card based on its element and name
 * @param card The card object
 * @returns URL string for a placeholder image
 */
export const getCardPlaceholderUrl = (card: Card): string => {
  const colorHex = card.element === 'fire' ? 'ef4444' : 
                  card.element === 'water' ? '3b82f6' : 
                  card.element === 'earth' ? 'd97706' : 
                  card.element === 'air' ? '06b6d4' : 
                  '6b7280';
  return `https://placehold.co/200x280/${colorHex}/ffffff?text=${encodeURIComponent(card.name.substring(0, 10))}`;
};

/**
 * Gets an emoji representing a card's element
 * @param element The element type
 * @returns Emoji string
 */
export const getElementEmoji = (element: string): string => {
  switch (element) {
    case 'fire': return '🔥';
    case 'water': return '💧';
    case 'earth': return '🌍';
    case 'air': return '💨';
    default: return '✨';
  }
};

/**
 * Gets a gradient background class for a card's element
 * @param element The element type
 * @returns Tailwind CSS class string
 */
export const getElementBackground = (element: string): string => {
  switch (element) {
    case 'fire': return 'from-red-900 to-red-950';
    case 'water': return 'from-blue-900 to-blue-950';
    case 'earth': return 'from-amber-900 to-amber-950';
    case 'air': return 'from-cyan-900 to-cyan-950';
    default: return 'from-gray-800 to-gray-900';
  }
};

/**
 * Renders a card image with fallbacks for missing images
 * @param card The card object
 * @param className Optional CSS class for the image container
 * @returns JSX element with the card image or fallback
 */
export const renderCardImage = (card: Card, className: string = 'w-full h-full') => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop
    target.src = getCardPlaceholderUrl(card);
  };

  return (
    <div className={`bg-gradient-to-br ${getElementBackground(card.element)} flex items-center justify-center overflow-hidden ${className}`}>
      {card.art ? (
        <img 
          src={card.art} 
          alt={card.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-4xl">{getElementEmoji(card.element)}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Renders a card back image
 * @param className Optional CSS class for the image container
 * @returns JSX element with the card back image
 */
export const renderCardBack = (className: string = 'w-full h-full') => {
  return (
    <div className={`bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden ${className}`}>
      <span className="text-4xl">🎴</span>
    </div>
  );
};
