import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../data/cardTypes';
import { redElementalCards } from '../data/redElementalCards';
import { allKobarBorahCards } from '../data/kobarBorahCards';
import { allKujanaKuhakaCards } from '../data/kujanaKuhakaCards';
import { BoosterPackType } from '../gacha/BoosterPackSystem';
import { toast } from 'sonner';

// Define the structure of the collection store
interface CollectionState {
  // Player's owned cards
  cards: Card[];
  
  // Currency for purchasing packs
  coins: number;
  
  // Pack opening history
  packHistory: {
    date: string;
    packType: BoosterPackType;
    cards: Card[];
  }[];
  
  // Collection statistics
  stats: {
    totalCards: number;
    avatarCards: number;
    spellCards: number;
    quickSpellCards: number;
    elementalDistribution: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      neutral: number;
      light: number;
      dark: number;
    };
  };
  
  // Actions
  addCard: (card: Card) => void;
  addCards: (cards: Card[]) => void;
  addCoins: (amount: number) => void;
  purchaseBoosterPack: (packType: BoosterPackType, cost: number) => Card[] | null;
  recalculateStats: () => void;
  
  // Dev actions (for testing)
  resetCollection: () => void;
  fillCollection: () => void;
}

// Extract card sets from available cards
const getCardPoolByPackType = (packType: BoosterPackType): Card[] => {
  switch (packType) {
    case BoosterPackType.FIRE:
      return Object.values(redElementalCards);
    case BoosterPackType.KOBAR_BORAH:
      return allKobarBorahCards;
    case BoosterPackType.KUJANA_KUHAKA:
      return allKujanaKuhakaCards;
    case BoosterPackType.RANDOM:
    default:
      // Combine all card pools
      return [
        ...Object.values(redElementalCards),
        ...allKobarBorahCards,
        ...allKujanaKuhakaCards
      ];
  }
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Create the collection store with persistence
export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      // Initial state
      cards: [],
      coins: 100000, // Increased starting coins for testing
      packHistory: [],
      stats: {
        totalCards: 0,
        avatarCards: 0,
        spellCards: 0,
        quickSpellCards: 0,
        elementalDistribution: {
          fire: 0,
          water: 0,
          earth: 0,
          air: 0,
          neutral: 0,
          light: 0,
          dark: 0,
        },
      },
      
      // Add a single card to the collection
      addCard: (card: Card) => {
        set((state) => {
          // Clone the card with a unique identifier
          const uniqueCard = { 
            ...card, 
            id: `${card.id}-${state.cards.length}-${Date.now()}` 
          };
          
          // Add to collection
          const updatedCards = [...state.cards, uniqueCard];
          
          return { 
            cards: updatedCards,
          };
        });
        
        // Recalculate stats after adding card
        get().recalculateStats();
        
        // Show notification
        toast.success(`Added ${card.name} to your collection!`);
      },
      
      // Add multiple cards to the collection
      addCards: (cards: Card[]) => {
        if (cards.length === 0) return;
        
        set((state) => {
          // Clone cards with unique identifiers
          const uniqueCards = cards.map(card => ({
            ...card,
            id: `${card.id}-${state.cards.length}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          }));
          
          // Add all cards to collection
          const updatedCards = [...state.cards, ...uniqueCards];
          
          return { 
            cards: updatedCards,
          };
        });
        
        // Recalculate stats after adding cards
        get().recalculateStats();
        
        // Show notification
        toast.success(`Added ${cards.length} cards to your collection!`);
      },
      
      // Add coins to the player's balance
      addCoins: (amount: number) => {
        set((state) => ({ 
          coins: state.coins + amount 
        }));
        
        if (amount > 0) {
          toast.success(`+${amount} coins added!`);
        } else {
          toast.info(`${amount} coins`);
        }
      },
      
      // Purchase a booster pack
      purchaseBoosterPack: (packType: BoosterPackType, cost: number) => {
        const { coins } = get();
        
        // Check if player has enough coins
        if (coins < cost) {
          toast.error("Not enough coins!");
          return null;
        }
        
        // Deduct the cost
        set((state) => ({ coins: state.coins - cost }));
        
        // Get the card pool for this pack type
        const cardPool = getCardPoolByPackType(packType);
        
        // Separate avatars and spells
        const avatars = cardPool.filter(card => card.type === 'avatar');
        const spells = cardPool.filter(card => card.type !== 'avatar');
        
        // Determine pack contents (5 cards: at least 1 avatar, rest are random)
        const randomAvatars = shuffleArray(avatars).slice(0, 2); // Get up to 2 random avatars
        const randomSpells = shuffleArray(spells).slice(0, 4);   // Get up to 4 random spells
        
        // Take at least 1 avatar and fill the rest to make 5 cards total
        const packCards = [
          randomAvatars[0], // Guaranteed first avatar
          ...randomAvatars.slice(1, 2), // Potentially a second avatar
          ...randomSpells.slice(0, 5 - Math.min(2, randomAvatars.length)) // Fill the rest with spells
        ];
        
        // Add the cards to the collection
        get().addCards(packCards);
        
        // Record the pack history
        set((state) => ({
          packHistory: [
            ...state.packHistory,
            {
              date: new Date().toISOString(),
              packType,
              cards: packCards,
            }
          ]
        }));
        
        return packCards;
      },
      
      // Recalculate collection statistics
      recalculateStats: () => {
        const { cards } = get();
        
        const stats = {
          totalCards: cards.length,
          avatarCards: cards.filter(card => card.type === 'avatar').length,
          spellCards: cards.filter(card => card.type === 'spell').length,
          quickSpellCards: cards.filter(card => card.type === 'quickSpell').length,
          elementalDistribution: {
            fire: cards.filter(card => card.element === 'fire').length,
            water: cards.filter(card => card.element === 'water').length,
            earth: cards.filter(card => card.element === 'earth').length,
            air: cards.filter(card => card.element === 'air').length,
            neutral: cards.filter(card => card.element === 'neutral').length,
            light: cards.filter(card => card.element === 'light').length,
            dark: cards.filter(card => card.element === 'dark').length,
          },
        };
        
        set({ stats });
      },
      
      // Reset the collection (dev feature)
      resetCollection: () => {
        set({
          cards: [],
          coins: 1000,
          packHistory: [],
          stats: {
            totalCards: 0,
            avatarCards: 0,
            spellCards: 0,
            quickSpellCards: 0,
            elementalDistribution: {
              fire: 0,
              water: 0,
              earth: 0,
              air: 0,
              neutral: 0,
              light: 0,
              dark: 0,
            },
          },
        });
        
        toast.info('Collection reset to default state');
      },
      
      // Fill the collection with all cards (dev feature)
      fillCollection: () => {
        // Get all cards
        const allCards = [
          ...Object.values(redElementalCards),
          ...allKobarBorahCards,
          ...allKujanaKuhakaCards,
        ];
        
        // Add all cards
        get().addCards(allCards);
        
        toast.success('Added all cards to your collection!');
      },
    }),
    {
      name: 'spektrum-collection-storage', // Local storage key
      partialize: (state) => ({
        cards: state.cards,
        coins: state.coins,
        packHistory: state.packHistory,
        // Don't persist stats as they can be recalculated
      }),
      // After rehydration, recalculate stats
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.recalculateStats();
        }
      },
    }
  )
);