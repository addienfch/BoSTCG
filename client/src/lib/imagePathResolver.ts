/**
 * Comprehensive Image Path Resolver
 * Resolves all image paths for boosters, expansions, premade decks, and assets
 */

export interface ImagePaths {
  boosters: {
    [key: string]: string;
  };
  expansions: {
    [key: string]: string;
  };
  premadeDecks: {
    [key: string]: string;
  };
  cards: {
    [key: string]: string;
  };
  fallbacks: {
    booster: string;
    expansion: string;
    deck: string;
    card: string;
  };
}

/**
 * Complete image path mapping for the application
 */
export const IMAGE_PATHS: ImagePaths = {
  boosters: {
    'beginner': '/images/boosters/beginner-pack.svg',
    'advanced': '/images/boosters/advanced-pack.svg',
    'expert': '/images/boosters/expert-pack.svg',
    'default': '/images/boosters/default-booster.svg'
  },
  expansions: {
    'kobar-borah': '/images/expansions/kobar-borah.svg',
    'kujana-kuhaka': '/images/expansions/kujana-kuhaka.svg',
    'neutral-spells': '/images/expansions/neutral-spells.svg',
    'default': '/images/expansions/default-expansion.svg'
  },
  premadeDecks: {
    'kobar-fire-deck': '/images/premade-decks/kobar-fire-deck.svg',
    'borah-water-deck': '/images/premade-decks/borah-water-deck.svg',
    'kuhaka-ground-deck': '/images/premade-decks/default-deck.svg', // Will create specific one
    'kujana-air-deck': '/images/premade-decks/default-deck.svg', // Will create specific one
    'default': '/images/premade-decks/default-deck.svg'
  },
  cards: {
    // Card image paths will be resolved through assetPathMapper
  },
  fallbacks: {
    booster: '/images/boosters/default-booster.svg',
    expansion: '/images/expansions/default-expansion.svg',
    deck: '/images/premade-decks/default-deck.svg',
    card: '/card-back.png' // Existing fallback
  }
};

/**
 * Get booster pack image by tier
 */
const getBoosterImage = (tier: string): string => {
  const normalizedTier = tier.toLowerCase().replace(/[^a-z]/g, '');
  return IMAGE_PATHS.boosters[normalizedTier] || IMAGE_PATHS.fallbacks.booster;
};

/**
 * Get expansion icon image by expansion ID
 */
const getExpansionImage = (expansionId: string): string => {
  const normalizedId = expansionId.toLowerCase();
  return IMAGE_PATHS.expansions[normalizedId] || IMAGE_PATHS.fallbacks.expansion;
};

/**
 * Get premade deck image by deck ID or name
 */
const getPremadeDeckImage = (deckId: string): string => {
  const normalizedId = deckId.toLowerCase().replace(/[^a-z-]/g, '');
  return IMAGE_PATHS.premadeDecks[normalizedId] || IMAGE_PATHS.fallbacks.deck;
};

/**
 * Enhanced booster image resolver with variant support
 */
const getBoosterImageByVariant = (variantName: string): string => {
  const name = variantName.toLowerCase();
  
  if (name.includes('beginner') || name.includes('starter')) {
    return IMAGE_PATHS.boosters.beginner;
  }
  
  if (name.includes('advanced') || name.includes('intermediate')) {
    return IMAGE_PATHS.boosters.advanced;
  }
  
  if (name.includes('expert') || name.includes('master') || name.includes('premium')) {
    return IMAGE_PATHS.boosters.expert;
  }
  
  return IMAGE_PATHS.fallbacks.booster;
};

/**
 * Get image by pack tier name (for BoosterPacksPage compatibility)
 */
const getPackTierImage = (tierName: string): string => {
  const tier = tierName.toLowerCase();
  
  switch (tier) {
    case 'beginner pack':
    case 'beginner':
      return IMAGE_PATHS.boosters.beginner;
    case 'advanced pack':
    case 'advanced':
      return IMAGE_PATHS.boosters.advanced;
    case 'expert pack':
    case 'expert':
      return IMAGE_PATHS.boosters.expert;
    default:
      return IMAGE_PATHS.fallbacks.booster;
  }
};

/**
 * Enhanced expansion image resolver with fallback logic
 */
const getExpansionImageWithFallback = (expansion: { id: string; symbol?: string; name?: string }): string => {
  // Try by ID first
  let image = getExpansionImage(expansion.id);
  
  // If default fallback, try by symbol
  if (image === IMAGE_PATHS.fallbacks.expansion && expansion.symbol) {
    const symbolImage = IMAGE_PATHS.expansions[expansion.symbol.toLowerCase()];
    if (symbolImage) image = symbolImage;
  }
  
  // If still default, try by name
  if (image === IMAGE_PATHS.fallbacks.expansion && expansion.name) {
    const nameImage = IMAGE_PATHS.expansions[expansion.name.toLowerCase().replace(/[^a-z]/g, '-')];
    if (nameImage) image = nameImage;
  }
  
  return image;
};

/**
 * Enhanced premade deck image resolver with tribal support
 */
export const getPremadeDeckImageWithTribal = (deck: { 
  id?: string; 
  name?: string; 
  tribal?: string; 
  element?: string; 
}): string => {
  // Try by exact ID first
  if (deck.id) {
    const idImage = getPremadeDeckImage(deck.id);
    if (idImage !== IMAGE_PATHS.fallbacks.deck) return idImage;
  }
  
  // Try by name
  if (deck.name) {
    const nameImage = getPremadeDeckImage(deck.name);
    if (nameImage !== IMAGE_PATHS.fallbacks.deck) return nameImage;
  }
  
  // Try by tribal + element combination
  if (deck.tribal && deck.element) {
    const tribalKey = `${deck.tribal.toLowerCase()}-${deck.element.toLowerCase()}-deck`;
    const tribalImage = IMAGE_PATHS.premadeDecks[tribalKey];
    if (tribalImage) return tribalImage;
  }
  
  return IMAGE_PATHS.fallbacks.deck;
};

/**
 * Validate if an image path exists in our mapping
 */
export const validateImagePath = (path: string): boolean => {
  const allPaths = [
    ...Object.values(IMAGE_PATHS.boosters),
    ...Object.values(IMAGE_PATHS.expansions),
    ...Object.values(IMAGE_PATHS.premadeDecks),
    ...Object.values(IMAGE_PATHS.fallbacks)
  ];
  
  return allPaths.includes(path);
};

/**
 * Get all available images for a category
 */
export const getAvailableImages = (category: 'boosters' | 'expansions' | 'premadeDecks'): string[] => {
  return Object.values(IMAGE_PATHS[category]);
};

/**
 * Preload critical images for better performance
 */
export const preloadCriticalImages = async (): Promise<void> => {
  const criticalImages = [
    IMAGE_PATHS.fallbacks.booster,
    IMAGE_PATHS.fallbacks.expansion,
    IMAGE_PATHS.fallbacks.deck,
    IMAGE_PATHS.boosters.beginner,
    IMAGE_PATHS.boosters.advanced,
    IMAGE_PATHS.boosters.expert
  ];
  
  const preloadPromises = criticalImages.map(src => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });
  });
  
  try {
    await Promise.all(preloadPromises);
    console.log('✅ Critical images preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Some critical images failed to preload:', error);
  }
};

/**
 * Image path resolver with comprehensive fallback system
 */
export class ImagePathResolver {
  private loadedImages = new Set<string>();
  private failedImages = new Set<string>();
  
  /**
   * Resolve image path with validation and fallback
   */
  async resolveImagePath(
    category: 'booster' | 'expansion' | 'deck' | 'card',
    identifier: string,
    fallbackData?: any
  ): Promise<string> {
    let imagePath: string;
    
    switch (category) {
      case 'booster':
        imagePath = getBoosterImageByVariant(identifier);
        break;
      case 'expansion':
        imagePath = getExpansionImageWithFallback(fallbackData || { id: identifier });
        break;
      case 'deck':
        imagePath = getPremadeDeckImageWithTribal(fallbackData || { id: identifier });
        break;
      case 'card':
        imagePath = IMAGE_PATHS.fallbacks.card;
        break;
      default:
        imagePath = IMAGE_PATHS.fallbacks[category] || '/card-back.png';
    }
    
    // Validate the image exists
    if (await this.validateImageExists(imagePath)) {
      this.loadedImages.add(imagePath);
      return imagePath;
    } else {
      this.failedImages.add(imagePath);
      return IMAGE_PATHS.fallbacks[category] || '/card-back.png';
    }
  }
  
  /**
   * Check if image exists and can be loaded
   */
  private async validateImageExists(path: string): Promise<boolean> {
    if (this.loadedImages.has(path)) return true;
    if (this.failedImages.has(path)) return false;
    
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = path;
    });
  }
  
  /**
   * Get loading statistics
   */
  getStats() {
    return {
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
      loadedPaths: Array.from(this.loadedImages),
      failedPaths: Array.from(this.failedImages)
    };
  }
}

export const imagePathResolver = new ImagePathResolver();

// Export all utility functions
export {
  getBoosterImage,
  getExpansionImage,
  getPremadeDeckImage,
  getBoosterImageByVariant,
  getPackTierImage,
  getExpansionImageWithFallback,
  getPremadeDeckImageWithTribal
};