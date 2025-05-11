import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../data/cardTypes';
import { toast } from 'sonner';
import { openBoosterPack, BoosterPackType } from '../gacha/BoosterPackSystem';

// Define the collection state
interface CollectionState {
  // Card collection
  cards: Card[];
  // Currency for purchasing cards
  coins: number;
  
  // Add cards to collection
  addCards: (newCards: Card[]) => void;
  // Remove cards from collection (e.g., when adding to a deck)
  removeCards: (cardIds: string[]) => void;
  // Set coins amount
  setCoins: (amount: number) => void;
  // Add coins
  addCoins: (amount: number) => void;
  // Spend coins
  spendCoins: (amount: number) => boolean;
  
  // Purchase a booster pack
  purchaseBoosterPack: (packType: BoosterPackType, packPrice: number) => Card[] | null;
}

// Create the collection store with persistence
export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      // Initial state
      cards: [],
      coins: 1000, // Start with 1000 coins
      
      // Add cards to collection
      addCards: (newCards) => {
        set((state) => {
          // Add the cards to the collection
          const updatedCards = [...state.cards, ...newCards];
          return { cards: updatedCards };
        });
        
        // Show success message
        toast.success(`Added ${newCards.length} new cards to your collection!`);
      },
      
      // Remove cards from collection
      removeCards: (cardIds) => {
        set((state) => {
          // Filter out the cards with matching IDs
          const updatedCards = state.cards.filter(card => !cardIds.includes(card.id));
          return { cards: updatedCards };
        });
      },
      
      // Set coins amount
      setCoins: (amount) => {
        set({ coins: amount });
      },
      
      // Add coins
      addCoins: (amount) => {
        set((state) => ({ coins: state.coins + amount }));
        toast.success(`Added ${amount} coins to your account!`);
      },
      
      // Spend coins
      spendCoins: (amount) => {
        const { coins } = get();
        
        // Check if enough coins
        if (coins < amount) {
          toast.error(`Not enough coins! You need ${amount} coins.`);
          return false;
        }
        
        // Deduct the coins
        set((state) => ({ coins: state.coins - amount }));
        return true;
      },
      
      // Purchase a booster pack
      purchaseBoosterPack: (packType, packPrice) => {
        const { coins } = get();
        
        // Check if enough coins
        if (coins < packPrice) {
          toast.error(`Not enough coins! You need ${packPrice} coins.`);
          return null;
        }
        
        // Spend the coins
        if (!get().spendCoins(packPrice)) {
          return null;
        }
        
        // Open the booster pack
        const cards = openBoosterPack(packType);
        
        // Add the cards to the collection
        get().addCards(cards);
        
        // Return the cards for display
        return cards;
      }
    }),
    {
      name: 'spektrum-card-collection',
      // Only persist these fields
      partialize: (state) => ({ 
        cards: state.cards,
        coins: state.coins
      }),
    }
  )
);