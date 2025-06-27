import { Card, AvatarCard, ActionCard, RarityType } from '../data/cardTypes';
import { generateRarityCardId } from './rarityUtils';

// Create rarity variants of a base card with different artwork
export function createCardRarityVariants(baseCard: Card): Card[] {
  const variants: Card[] = [];
  const rarities: RarityType[] = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Mythic'];
  
  rarities.forEach((rarity, index) => {
    const variant: Card = {
      ...baseCard,
      id: generateRarityCardId(baseCard.name, rarity),
      rarity: rarity,
      // Different artwork for different rarities
      art: getRarityArtwork(baseCard.art, rarity)
    };
    
    variants.push(variant);
  });
  
  return variants;
}

// Get artwork path based on rarity
function getRarityArtwork(baseArt: string, rarity: RarityType): string {
  if (!baseArt) return baseArt;
  
  // Extract the base filename without extension
  const extensionIndex = baseArt.lastIndexOf('.');
  const extension = extensionIndex > -1 ? baseArt.substring(extensionIndex) : '.png';
  const baseName = extensionIndex > -1 ? baseArt.substring(0, extensionIndex) : baseArt;
  
  // Add rarity suffix to artwork
  const raritySuffix = getRaritySuffix(rarity);
  return `${baseName}${raritySuffix}${extension}`;
}

function getRaritySuffix(rarity: RarityType): string {
  switch (rarity) {
    case 'Common': return '';
    case 'Uncommon': return '_uncommon';
    case 'Rare': return '_rare';
    case 'Super Rare': return '_super_rare';
    case 'Mythic': return '_mythic';
    default: return '';
  }
}

// Create all card variants for a collection
export function createCardCollectionWithRarities(baseCards: Card[]): Card[] {
  const allVariants: Card[] = [];
  
  baseCards.forEach(baseCard => {
    const variants = createCardRarityVariants(baseCard);
    allVariants.push(...variants);
  });
  
  return allVariants;
}

// Get cards with same base name but different rarities
export function getCardVariantsByBaseName(cards: Card[], baseName: string): Card[] {
  return cards.filter(card => card.name === baseName);
}

// Get the most common rarity version of a card
export function getCommonVariant(cards: Card[], baseName: string): Card | undefined {
  const variants = getCardVariantsByBaseName(cards, baseName);
  return variants.find(card => card.rarity === 'Common') || variants[0];
}

// Check if two cards are the same base card (same effects, different rarity/art)
export function isSameBaseCard(card1: Card, card2: Card): boolean {
  return card1.name === card2.name && 
         card1.type === card2.type && 
         card1.element === card2.element;
}

// Generate booster pack with rarity distribution
export function generateBoosterPackCards(allCards: Card[], packSize: number = 5): Card[] {
  const boosterCards: Card[] = [];
  const cardsByRarity = groupCardsByRarity(allCards);
  
  // Typical booster pack distribution
  const distribution = [
    { rarity: 'Common', count: 3 },
    { rarity: 'Uncommon', count: 1 },
    { rarity: 'Rare', count: 1 }
  ];
  
  distribution.forEach(({ rarity, count }) => {
    const availableCards = cardsByRarity[rarity as RarityType] || [];
    for (let i = 0; i < count && availableCards.length > 0; i++) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      boosterCards.push(randomCard);
    }
  });
  
  // Fill remaining slots with random cards if needed
  while (boosterCards.length < packSize) {
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    boosterCards.push(randomCard);
  }
  
  return boosterCards;
}

function groupCardsByRarity(cards: Card[]): Record<RarityType, Card[]> {
  const groups: Record<RarityType, Card[]> = {
    'Common': [],
    'Uncommon': [],
    'Rare': [],
    'Super Rare': [],
    'Mythic': []
  };
  
  cards.forEach(card => {
    const rarity = card.rarity || 'Common';
    groups[rarity].push(card);
  });
  
  return groups;
}