import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PackTier {
  id: 'beginner' | 'advanced' | 'expert' | 'master';
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
    description: 'Perfect for new players - 80% Common, 15% Uncommon, 3% Rare, 1.5% Super Rare, 0.5% Mythic',
    price: 3,
    cardCount: 5,
    guaranteedRarity: ['Common', 'Uncommon'],
    color: 'from-green-500 to-green-700',
    emoji: '🌱',
    rarityWeights: {
      Common: 0.80,
      Uncommon: 0.15,
      Rare: 0.03,
      'Super Rare': 0.015,
      Mythic: 0.005
    }
  },
  {
    id: 'advanced',
    name: 'Advanced Pack',
    description: 'For experienced players - 60% Common, 27% Uncommon, 8% Rare, 4% Super Rare, 1% Mythic',
    price: 8,
    cardCount: 8,
    guaranteedRarity: ['Rare', 'Super Rare'],
    color: 'from-purple-500 to-purple-700',
    emoji: '💎',
    rarityWeights: {
      Common: 0.60,
      Uncommon: 0.27,
      Rare: 0.08,
      'Super Rare': 0.04,
      Mythic: 0.01
    }
  },
  {
    id: 'expert',
    name: 'Expert Pack',
    description: 'For veteran players - 40% Common, 30% Uncommon, 20% Rare, 8% Super Rare, 2% Mythic',
    price: 15,
    cardCount: 10,
    guaranteedRarity: ['Rare', 'Super Rare'],
    color: 'from-orange-500 to-red-700',
    emoji: '🔥',
    rarityWeights: {
      Common: 0.40,
      Uncommon: 0.30,
      Rare: 0.20,
      'Super Rare': 0.08,
      Mythic: 0.02
    }
  },
  {
    id: 'master',
    name: 'Master Pack',
    description: 'Ultimate pack - 20% Common, 25% Uncommon, 30% Rare, 20% Super Rare, 5% Mythic',
    price: 25,
    cardCount: 12,
    guaranteedRarity: ['Super Rare', 'Mythic'],
    color: 'from-yellow-500 to-yellow-700',
    emoji: '👑',
    rarityWeights: {
      Common: 0.20,
      Uncommon: 0.25,
      Rare: 0.30,
      'Super Rare': 0.20,
      Mythic: 0.05
    }
  }
];

export const usePackTierStore = create<PackTierStore>()(
  persist(
    (set, get) => ({
      packTiers: [],

      initializePackTiers: () => {
        try {
          const { packTiers } = get();
          if (packTiers.length === 0) {
            set({ packTiers: defaultPackTiers });
            console.log('Pack tiers initialized with default data');
          }
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
      partialize: (state) => ({ 
        packTiers: state.packTiers
      })
    }
  )
);