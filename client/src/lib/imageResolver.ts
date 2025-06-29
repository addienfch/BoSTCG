/**
 * Simplified Image Resolver
 * Provides image paths for boosters, expansions, and premade decks
 */

export const BOOSTER_IMAGES = {
  beginner: '/images/boosters/beginner-pack.svg',
  advanced: '/images/boosters/advanced-pack.svg',
  expert: '/images/boosters/expert-pack.svg',
  default: '/images/boosters/default-booster.svg'
};

export const EXPANSION_IMAGES = {
  'kobar-borah': '/images/expansions/kobar-borah.svg',
  'kujana-kuhaka': '/images/expansions/kujana-kuhaka.svg',
  'neutral-spells': '/images/expansions/neutral-spells.svg',
  default: '/images/expansions/default-expansion.svg'
};

export const PREMADE_DECK_IMAGES = {
  'kobar-fire-deck': '/images/premade-decks/kobar-fire-deck.svg',
  'borah-water-deck': '/images/premade-decks/borah-water-deck.svg',
  default: '/images/premade-decks/default-deck.svg'
};

export function getBoosterImage(tier: string): string {
  const normalizedTier = tier.toLowerCase().replace(/[^a-z]/g, '');
  return BOOSTER_IMAGES[normalizedTier as keyof typeof BOOSTER_IMAGES] || BOOSTER_IMAGES.default;
}

export function getExpansionImage(expansionId: string): string {
  const normalizedId = expansionId.toLowerCase();
  return EXPANSION_IMAGES[normalizedId as keyof typeof EXPANSION_IMAGES] || EXPANSION_IMAGES.default;
}

export function getPremadeDeckImage(deckId: string): string {
  const normalizedId = deckId.toLowerCase().replace(/[^a-z-]/g, '');
  return PREMADE_DECK_IMAGES[normalizedId as keyof typeof PREMADE_DECK_IMAGES] || PREMADE_DECK_IMAGES.default;
}

export function getPackTierImage(tierName: string): string {
  const tier = tierName.toLowerCase();
  
  if (tier.includes('beginner')) return BOOSTER_IMAGES.beginner;
  if (tier.includes('advanced')) return BOOSTER_IMAGES.advanced;
  if (tier.includes('expert')) return BOOSTER_IMAGES.expert;
  
  return BOOSTER_IMAGES.default;
}

export function getBoosterImageByVariant(variantName: string): string {
  const name = variantName.toLowerCase();
  
  if (name.includes('beginner') || name.includes('starter')) {
    return BOOSTER_IMAGES.beginner;
  }
  
  if (name.includes('advanced') || name.includes('intermediate')) {
    return BOOSTER_IMAGES.advanced;
  }
  
  if (name.includes('expert') || name.includes('master') || name.includes('premium')) {
    return BOOSTER_IMAGES.expert;
  }
  
  return BOOSTER_IMAGES.default;
}

export function getExpansionImageWithFallback(expansion: { id: string; symbol?: string; name?: string }): string {
  // Try by ID first
  let image = getExpansionImage(expansion.id);
  
  // If default fallback, try by symbol
  if (image === EXPANSION_IMAGES.default && expansion.symbol) {
    const symbolImage = EXPANSION_IMAGES[expansion.symbol.toLowerCase() as keyof typeof EXPANSION_IMAGES];
    if (symbolImage) image = symbolImage;
  }
  
  return image;
}

export function getPremadeDeckImageWithTribal(deck: { 
  id?: string; 
  name?: string; 
  tribal?: string; 
  element?: string; 
}): string {
  // Try by exact ID first
  if (deck.id) {
    const idImage = getPremadeDeckImage(deck.id);
    if (idImage !== PREMADE_DECK_IMAGES.default) return idImage;
  }
  
  // Try by name
  if (deck.name) {
    const nameImage = getPremadeDeckImage(deck.name);
    if (nameImage !== PREMADE_DECK_IMAGES.default) return nameImage;
  }
  
  // Try by tribal + element combination
  if (deck.tribal && deck.element) {
    const tribalKey = `${deck.tribal.toLowerCase()}-${deck.element.toLowerCase()}-deck`;
    const tribalImage = PREMADE_DECK_IMAGES[tribalKey as keyof typeof PREMADE_DECK_IMAGES];
    if (tribalImage) return tribalImage;
  }
  
  return PREMADE_DECK_IMAGES.default;
}