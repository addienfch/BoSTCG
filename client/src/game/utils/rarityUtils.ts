import { RarityType } from '../data/cardTypes';

export const RARITY_COLORS: Record<RarityType, string> = {
  'Common': 'border-gray-400 bg-gray-500',
  'Uncommon': 'border-green-400 bg-green-500',
  'Rare': 'border-blue-400 bg-blue-500',
  'Super Rare': 'border-purple-400 bg-purple-500',
  'Mythic': 'border-yellow-400 bg-yellow-500'
};

export const RARITY_TEXT_COLORS: Record<RarityType, string> = {
  'Common': 'text-gray-400',
  'Uncommon': 'text-green-400',
  'Rare': 'text-blue-400',
  'Super Rare': 'text-purple-400',
  'Mythic': 'text-yellow-400'
};

export const RARITY_ORDER: Record<RarityType, number> = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 3,
  'Super Rare': 4,
  'Mythic': 5
};

export const RARITY_RATES = {
  'Common': 60,      // 60%
  'Uncommon': 25,    // 25%
  'Rare': 10,        // 10%
  'Super Rare': 4,   // 4%
  'Mythic': 1        // 1%
};

export function getRarityColor(rarity: RarityType): string {
  return RARITY_COLORS[rarity] || RARITY_COLORS.Common;
}

export function getRarityTextColor(rarity: RarityType): string {
  return RARITY_TEXT_COLORS[rarity] || RARITY_TEXT_COLORS.Common;
}

export function getRarityWeight(rarity: RarityType): number {
  return RARITY_ORDER[rarity] || 1;
}

export function getRandomRarity(): RarityType {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, rate] of Object.entries(RARITY_RATES)) {
    cumulative += rate;
    if (random <= cumulative) {
      return rarity as RarityType;
    }
  }
  
  return 'Common';
}

// Get the base card ID without rarity suffix
export function getBaseCardId(cardId: string): string {
  return cardId.replace(/-\d+$/, ''); // Remove numeric suffix used for rarity variants
}

// Generate card ID with rarity suffix
export function generateRarityCardId(baseName: string, rarity: RarityType): string {
  const rarityIndex = getRarityWeight(rarity);
  return `${baseName.toLowerCase().replace(/\s+/g, '-')}-${rarityIndex}`;
}

// Check if cards are the same base card (ignoring rarity)
export function isSameBaseCard(card1Id: string, card2Id: string): boolean {
  return getBaseCardId(card1Id) === getBaseCardId(card2Id);
}