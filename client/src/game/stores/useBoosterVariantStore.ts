import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card, ElementType, RarityType } from '../data/cardTypes';
import { useDeckStore } from './useDeckStore';

export interface BoosterVariant {
  id: string;
  name: string;
  subtitle: string;
  artUrl: string;
  rarity: string;
  description: string;
  priceMultiplier: number;
  guaranteedRarities: RarityType[];
  rarityWeights: Record<RarityType, number>;
}

export interface BoosterPack {
  id: string;
  name: string;
  element: ElementType | 'mixed';
  price: number;  
  description: string;
  guaranteedRarity: string;
  cardCount: number;
  emoji: string;
  color: string;
  artUrl: string;
}

export interface VariantPurchase {
  id: string;
  variantId: string;
  packId: string;
  purchaseDate: Date;
  cardsReceived: Card[];
  totalCost: number;
}

interface BoosterVariantStore {
  selectedVariant: BoosterVariant | null;
  purchaseHistory: VariantPurchase[];
  
  // Actions
  setSelectedVariant: (variant: BoosterVariant | null) => void;
  generatePackVariants: (pack: BoosterPack) => BoosterVariant[];
  purchaseVariant: (variant: BoosterVariant, pack: BoosterPack) => Promise<Card[]>;
  getVariantPrice: (basePrice: number, variant: BoosterVariant) => number;
  generateVariantCards: (pack: BoosterPack, variant: BoosterVariant) => Card[];
  getPurchaseHistory: () => VariantPurchase[];
  getVariantStats: (variantId: string) => {
    purchaseCount: number;
    averageRarity: number;
    commonCards: number;
    rareCards: number;
    epicCards: number;
    legendaryCards: number;
  };
}

const variantTemplates: Omit<BoosterVariant, 'id' | 'name' | 'artUrl'>[] = [
  {
    rarity: 'Starter',
    subtitle: 'Basic Collection',
    description: 'Common cards with 1 guaranteed uncommon',
    priceMultiplier: 1.0,
    guaranteedRarities: ['Common', 'Uncommon'],
    rarityWeights: { 'Common': 0.80, 'Uncommon': 0.18, 'Rare': 0.02, 'Super Rare': 0.00, 'Mythic': 0.00 }
  },
  {
    rarity: 'Advanced',
    subtitle: 'Enhanced Power', 
    description: 'Uncommon cards with 1 guaranteed rare',
    priceMultiplier: 1.5,
    guaranteedRarities: ['Uncommon', 'Rare'],
    rarityWeights: { 'Common': 0.60, 'Uncommon': 0.27, 'Rare': 0.10, 'Super Rare': 0.02, 'Mythic': 0.01 }
  },
  {
    rarity: 'Elite',
    subtitle: 'Superior Force',
    description: 'Rare cards with chance of epic',
    priceMultiplier: 2.0,
    guaranteedRarities: ['Rare'],
    rarityWeights: { 'Common': 0.40, 'Uncommon': 0.35, 'Rare': 0.20, 'Super Rare': 0.04, 'Mythic': 0.01 }
  },
  {
    rarity: 'Master',
    subtitle: 'Legendary Power',
    description: 'Epic cards with chance of legendary',
    priceMultiplier: 3.0,
    guaranteedRarities: ['Super Rare'],
    rarityWeights: { 'Common': 0.30, 'Uncommon': 0.30, 'Rare': 0.25, 'Super Rare': 0.12, 'Mythic': 0.03 }
  },
  {
    rarity: 'Champion',
    subtitle: 'Ultimate Collection',
    description: 'Guaranteed legendary card',
    priceMultiplier: 4.0,
    guaranteedRarities: ['Mythic'],
    rarityWeights: { 'Common': 0.20, 'Uncommon': 0.25, 'Rare': 0.30, 'Super Rare': 0.20, 'Mythic': 0.05 }
  },
  {
    rarity: 'Mythic',
    subtitle: 'Divine Arsenal',
    description: 'Multiple rare+ cards guaranteed',
    priceMultiplier: 5.0,
    guaranteedRarities: ['Rare', 'Super Rare'],
    rarityWeights: { 'Common': 0.15, 'Uncommon': 0.20, 'Rare': 0.35, 'Super Rare': 0.25, 'Mythic': 0.05 }
  },
  {
    rarity: 'Cosmic',
    subtitle: 'Stellar Force', 
    description: 'Enhanced drop rates for all rarities',
    priceMultiplier: 6.0,
    guaranteedRarities: ['Super Rare'],
    rarityWeights: { 'Common': 0.10, 'Uncommon': 0.20, 'Rare': 0.30, 'Super Rare': 0.30, 'Mythic': 0.10 }
  },
  {
    rarity: 'Eternal',
    subtitle: 'Timeless Power',
    description: 'Exclusive variant cards included',
    priceMultiplier: 8.0,
    guaranteedRarities: ['Super Rare', 'Mythic'],
    rarityWeights: { 'Common': 0.05, 'Uncommon': 0.15, 'Rare': 0.30, 'Super Rare': 0.35, 'Mythic': 0.15 }
  },
  {
    rarity: 'Infinity',
    subtitle: 'Beyond Limits',
    description: 'Maximum rarity with bonus cards',
    priceMultiplier: 10.0,
    guaranteedRarities: ['Mythic'],
    rarityWeights: { 'Common': 0.05, 'Uncommon': 0.10, 'Rare': 0.25, 'Super Rare': 0.40, 'Mythic': 0.20 }
  }
];

export const useBoosterVariantStore = create<BoosterVariantStore>()(
  persist(
    (set, get) => ({
      selectedVariant: null,
      purchaseHistory: [],

      setSelectedVariant: (variant) => {
        set({ selectedVariant: variant });
      },

      generatePackVariants: (pack) => {
        return variantTemplates.map((template, index) => ({
          id: `${pack.id}-variant-${index + 1}`,
          name: `${template.rarity} ${pack.name}`,
          artUrl: pack.artUrl,
          ...template
        }));
      },

      getVariantPrice: (basePrice, variant) => {
        return Math.round(basePrice * variant.priceMultiplier);
      },

      generateVariantCards: (pack, variant) => {
        const { getAvailableCards } = useDeckStore.getState();
        const availableCards = getAvailableCards();
        
        // Filter cards by element
        const elementCards = pack.element === 'mixed' 
          ? availableCards 
          : availableCards.filter(card => card.element === pack.element);

        if (elementCards.length === 0) {
          console.warn('No cards available for pack generation');
          return [];
        }

        const cards: Card[] = [];
        
        // First, add guaranteed rarity cards
        variant.guaranteedRarities.forEach(guaranteedRarity => {
          const rarityCards = elementCards.filter(card => card.rarity === guaranteedRarity);
          if (rarityCards.length > 0) {
            const randomCard = rarityCards[Math.floor(Math.random() * rarityCards.length)];
            cards.push({
              ...randomCard,
              id: `${randomCard.id}-pack-${Date.now()}-${cards.length}`
            });
          }
        });

        // Fill remaining slots with weighted random selection
        const remainingSlots = pack.cardCount - cards.length;
        
        for (let i = 0; i < remainingSlots; i++) {
          const randomValue = Math.random();
          let cumulativeWeight = 0;
          let selectedRarity: RarityType = 'Common';
          
          // Determine rarity based on weights
          for (const [rarity, weight] of Object.entries(variant.rarityWeights)) {
            cumulativeWeight += weight;
            if (randomValue <= cumulativeWeight) {
              selectedRarity = rarity as RarityType;
              break;
            }
          }
          
          // Select random card of determined rarity
          const rarityCards = elementCards.filter(card => card.rarity === selectedRarity);
          if (rarityCards.length > 0) {
            const randomCard = rarityCards[Math.floor(Math.random() * rarityCards.length)];
            cards.push({
              ...randomCard,
              id: `${randomCard.id}-pack-${Date.now()}-${i}`
            });
          } else {
            // Fallback to random card if no cards of selected rarity
            const randomCard = elementCards[Math.floor(Math.random() * elementCards.length)];
            cards.push({
              ...randomCard,
              id: `${randomCard.id}-pack-${Date.now()}-${i}`
            });
          }
        }

        return cards;
      },

      purchaseVariant: async (variant, pack) => {
        const cards = get().generateVariantCards(pack, variant);
        const totalCost = get().getVariantPrice(pack.price, variant);
        
        const purchase: VariantPurchase = {
          id: `purchase-${Date.now()}`,
          variantId: variant.id,
          packId: pack.id,
          purchaseDate: new Date(),
          cardsReceived: cards,
          totalCost
        };

        set(state => ({
          purchaseHistory: [...state.purchaseHistory, purchase]
        }));

        // Add cards to collection
        const { addCards } = useDeckStore.getState();
        addCards(cards);

        console.log(`Purchased ${variant.name} for $${totalCost}, received ${cards.length} cards`);
        return cards;
      },

      getPurchaseHistory: () => {
        return get().purchaseHistory;
      },

      getVariantStats: (variantId) => {
        const { purchaseHistory } = get();
        const variantPurchases = purchaseHistory.filter(p => p.variantId === variantId);
        
        const stats = {
          purchaseCount: variantPurchases.length,
          averageRarity: 0,
          commonCards: 0,
          rareCards: 0,
          epicCards: 0,
          legendaryCards: 0
        };

        if (variantPurchases.length === 0) return stats;

        let totalRarityScore = 0;
        let totalCards = 0;

        variantPurchases.forEach(purchase => {
          purchase.cardsReceived.forEach(card => {
            totalCards++;
            
            switch (card.rarity) {
              case 'Common':
                stats.commonCards++;
                totalRarityScore += 1;
                break;
              case 'Uncommon':
                stats.rareCards++;
                totalRarityScore += 2;
                break;
              case 'Rare':
                stats.rareCards++;
                totalRarityScore += 3;
                break;
              case 'Super Rare':
                stats.epicCards++;
                totalRarityScore += 4;
                break;
              case 'Mythic':
                stats.legendaryCards++;
                totalRarityScore += 5;
                break;
            }
          });
        });

        stats.averageRarity = totalCards > 0 ? totalRarityScore / totalCards : 0;
        
        return stats;
      }
    }),
    {
      name: 'booster-variant-storage',
      partialize: (state) => ({ 
        selectedVariant: state.selectedVariant,
        purchaseHistory: state.purchaseHistory
      })
    }
  )
);