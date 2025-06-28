import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PackTier {
  id: 'beginner' | 'advanced' | 'expert';
  name: string;
  description: string;
  price: number;
  cardCount: number;
  guaranteedRarity: string[];
  color: string;
  emoji: string;
  rarityWeights: {
    Common: number;
    Uncommon: number;
    Rare: number;
    'Super Rare': number;
    Mythic: number;
  };
}

interface PackTierStore {
  packTiers: PackTier[];
  
  // Actions
  initializePackTiers: () => void;
  createPackTier: (tier: PackTier) => void;
  updatePackTier: (id: string, updates: Partial<PackTier>) => void;
  deletePackTier: (id: string) => void;
  getPackTier: (id: string) => PackTier | undefined;
  getAllPackTiers: () => PackTier[];
}

const defaultPackTiers: PackTier[] = [
  {
    id: 'beginner',
    name: 'Beginner Pack',
    description: '5 cards - 4 Common + 1 Uncommon guaranteed',
    price: 3,
    cardCount: 5,
    guaranteedRarity: ['Common', 'Uncommon'],
    color: 'from-green-500 to-green-700',
    emoji: '🌱',
    rarityWeights: {
      Common: 0.80,
      Uncommon: 0.18,
      Rare: 0.02,
      'Super Rare': 0.00,
      Mythic: 0.00
    }
  },
  {
    id: 'advanced',
    name: 'Advanced Pack',
    description: '5 cards - 3 Common + 1 Uncommon + 1 Rare guaranteed',
    price: 8,
    cardCount: 5,
    guaranteedRarity: ['Uncommon', 'Rare'],
    color: 'from-purple-500 to-purple-700',
    emoji: '💎',
    rarityWeights: {
      Common: 0.60,
      Uncommon: 0.27,
      Rare: 0.10,
      'Super Rare': 0.02,
      Mythic: 0.01
    }
  },
  {
    id: 'expert',
    name: 'Expert Pack',
    description: '5 cards - 2 Common + 2 Uncommon + 1 Rare (chance for Super Rare)',
    price: 15,
    cardCount: 5,
    guaranteedRarity: ['Rare'],
    color: 'from-orange-500 to-red-700',
    emoji: '🔥',
    rarityWeights: {
      Common: 0.40,
      Uncommon: 0.35,
      Rare: 0.20,
      'Super Rare': 0.04,
      Mythic: 0.01
    }
  }
];

export const usePackTierStore = create<PackTierStore>()(
  persist(
    (set, get) => ({
      packTiers: [],

      initializePackTiers: () => {
        try {
          // Force reset to ensure no cached "master" tiers exist
          set({ packTiers: defaultPackTiers });
          console.log('Pack tiers initialized with default data (forced reset)');
        } catch (error) {
          console.error('Error initializing pack tiers:', error);
        }
      },

      createPackTier: (tier: PackTier) => {
        try {
          const { packTiers } = get();
          
          // Check if tier already exists
          if (packTiers.some(t => t.id === tier.id)) {
            console.warn(`Pack tier ${tier.id} already exists`);
            return;
          }

          set({ packTiers: [...packTiers, tier] });
          console.log(`Created pack tier: ${tier.name}`);
        } catch (error) {
          console.error('Error creating pack tier:', error);
        }
      },

      updatePackTier: (id: string, updates: Partial<PackTier>) => {
        try {
          const { packTiers } = get();
          
          const updatedTiers = packTiers.map(tier =>
            tier.id === id ? { ...tier, ...updates } : tier
          );

          set({ packTiers: updatedTiers });
          console.log(`Updated pack tier: ${id}`);
        } catch (error) {
          console.error('Error updating pack tier:', error);
        }
      },

      deletePackTier: (id: string) => {
        try {
          const { packTiers } = get();
          
          const filteredTiers = packTiers.filter(tier => tier.id !== id);
          set({ packTiers: filteredTiers });
          console.log(`Deleted pack tier: ${id}`);
        } catch (error) {
          console.error('Error deleting pack tier:', error);
        }
      },

      getPackTier: (id: string) => {
        try {
          const { packTiers } = get();
          return packTiers.find(tier => tier.id === id);
        } catch (error) {
          console.error('Error getting pack tier:', error);
          return undefined;
        }
      },

      getAllPackTiers: () => {
        try {
          return get().packTiers;
        } catch (error) {
          console.error('Error getting all pack tiers:', error);
          return [];
        }
      }
    }),
    {
      name: 'pack-tier-storage',
      version: 1, // Force cache invalidation to remove any old "master" pack references
      partialize: (state) => ({ 
        packTiers: state.packTiers
      })
    }
  )
);