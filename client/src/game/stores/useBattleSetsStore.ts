import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BattleSetItem {
  id: string;
  name: string;
  type: 'card_back' | 'deck_cover' | 'avatar_skin' | 'battlefield' | 'effect_animation';
  description: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  preview: string;
  owned: boolean;
  element?: string;
}

interface BattleSetsStore {
  battleSets: BattleSetItem[];
  ownedItems: Set<string>;
  
  // Actions
  initializeBattleSets: () => void;
  purchaseItem: (itemId: string) => boolean;
  getItemsByCategory: (type: string) => BattleSetItem[];
  getItemsByElement: (element: string) => BattleSetItem[];
  isItemOwned: (itemId: string) => boolean;
  getOwnedItems: () => BattleSetItem[];
}

const defaultBattleSets: BattleSetItem[] = [
  // Card Backs
  {
    id: 'cardback-fire-1',
    name: 'Blazing Flames',
    type: 'card_back',
    description: 'Fiery card back with animated flame effects',
    price: 150,
    rarity: 'Rare',
    preview: '/textures/cards/fire_booster.png',
    owned: false,
    element: 'fire'
  },
  {
    id: 'cardback-water-1',
    name: 'Ocean Depths',
    type: 'card_back',
    description: 'Deep blue card back with flowing water patterns',
    price: 150,
    rarity: 'Rare',
    preview: '/textures/cards/neutral_booster.png',
    owned: false,
    element: 'water'
  },
  {
    id: 'cardback-legendary-1',
    name: 'Spektrum Master',
    type: 'card_back',
    description: 'Exclusive card back for dedicated players',
    price: 500,
    rarity: 'Legendary',
    preview: '/textures/cards/fire_booster.png',
    owned: false
  },
  
  // Deck Covers
  {
    id: 'deckcover-tribal-1',
    name: 'Kobar Dominance',
    type: 'deck_cover',
    description: 'Showcase your Kobar tribal mastery',
    price: 200,
    rarity: 'Epic',
    preview: '/textures/cards/neutral_booster.png',
    owned: false,
    element: 'fire'
  },
  {
    id: 'deckcover-tribal-2',
    name: 'Borah Wisdom',
    type: 'deck_cover',
    description: 'Display your Borah strategic prowess',
    price: 200,
    rarity: 'Epic',
    preview: '/textures/cards/neutral_booster.png',
    owned: false,
    element: 'water'
  },
  
  // Avatar Skins
  {
    id: 'avatar-elemental-1',
    name: 'Fire Lord Avatar',
    type: 'avatar_skin',
    description: 'Command respect with this blazing avatar skin',
    price: 300,
    rarity: 'Epic',
    preview: '/textures/cards/fire_booster.png',
    owned: false,
    element: 'fire'
  },
  {
    id: 'avatar-elemental-2',
    name: 'Water Sage Avatar',
    type: 'avatar_skin',
    description: 'Embody wisdom with this flowing avatar skin',
    price: 300,
    rarity: 'Epic',
    preview: '/textures/cards/neutral_booster.png',
    owned: false,
    element: 'water'
  },
  
  // Battlefields
  {
    id: 'battlefield-volcanic-1',
    name: 'Volcanic Crater',
    type: 'battlefield',
    description: 'Battle in the heart of an active volcano',
    price: 400,
    rarity: 'Epic',
    preview: '/textures/cards/fire_booster.png',
    owned: false,
    element: 'fire'
  },
  {
    id: 'battlefield-ocean-1',
    name: 'Deep Sea Arena',
    type: 'battlefield',
    description: 'Duel beneath the waves in this aquatic battlefield',
    price: 400,
    rarity: 'Epic',
    preview: '/textures/cards/neutral_booster.png',
    owned: false,
    element: 'water'
  },
  {
    id: 'battlefield-mystical-1',
    name: 'Spektrum Nexus',
    type: 'battlefield',
    description: 'Fight in the legendary source of all elemental power',
    price: 750,
    rarity: 'Legendary',
    preview: '/textures/cards/fire_booster.png',
    owned: false
  },
  
  // Effect Animations
  {
    id: 'effect-fire-1',
    name: 'Phoenix Rising',
    type: 'effect_animation',
    description: 'Spectacular phoenix animation for fire spells',
    price: 250,
    rarity: 'Rare',
    preview: '/textures/cards/fire_booster.png',
    owned: false,
    element: 'fire'
  },
  {
    id: 'effect-water-1',
    name: 'Tidal Wave',
    type: 'effect_animation',
    description: 'Crushing wave animation for water spells',
    price: 250,
    rarity: 'Rare',
    preview: '/textures/cards/neutral_booster.png',
    owned: false,
    element: 'water'
  },
  {
    id: 'effect-legendary-1',
    name: 'Spektrum Burst',
    type: 'effect_animation',
    description: 'Ultimate multi-elemental explosion effect',
    price: 600,
    rarity: 'Legendary',
    preview: '/textures/cards/fire_booster.png',
    owned: false
  }
];

export const useBattleSetsStore = create<BattleSetsStore>()(
  persist(
    (set, get) => ({
      battleSets: [],
      ownedItems: new Set<string>(),

      initializeBattleSets: () => {
        const { battleSets } = get();
        if (battleSets.length === 0) {
          set({ battleSets: defaultBattleSets });
          console.log('Battle Sets initialized with default data');
        }
      },

      purchaseItem: (itemId: string) => {
        const { battleSets, ownedItems } = get();
        
        if (ownedItems.has(itemId)) {
          console.warn(`Item ${itemId} already owned`);
          return false;
        }

        const item = battleSets.find(item => item.id === itemId);
        if (!item) {
          console.error(`Item ${itemId} not found`);
          return false;
        }

        // TODO: Integrate with payment system
        // For now, simulate successful purchase
        
        const newOwnedItems = new Set(ownedItems);
        newOwnedItems.add(itemId);
        
        const updatedBattleSets = battleSets.map(battleItem =>
          battleItem.id === itemId 
            ? { ...battleItem, owned: true }
            : battleItem
        );

        set({ 
          ownedItems: newOwnedItems,
          battleSets: updatedBattleSets
        });

        console.log(`Successfully purchased item: ${item.name}`);
        return true;
      },

      getItemsByCategory: (type: string) => {
        const { battleSets } = get();
        if (type === 'all') return battleSets;
        return battleSets.filter(item => item.type === type);
      },

      getItemsByElement: (element: string) => {
        const { battleSets } = get();
        return battleSets.filter(item => item.element === element);
      },

      isItemOwned: (itemId: string) => {
        const { ownedItems } = get();
        return ownedItems.has(itemId);
      },

      getOwnedItems: () => {
        const { battleSets } = get();
        return battleSets.filter(item => item.owned);
      }
    }),
    {
      name: 'battle-sets-storage',
      partialize: (state) => ({ 
        battleSets: state.battleSets,
        ownedItems: Array.from(state.ownedItems) // Convert Set to Array for JSON serialization
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.ownedItems)) {
          // Convert Array back to Set after rehydration
          state.ownedItems = new Set(state.ownedItems);
        }
      }
    }
  )
);