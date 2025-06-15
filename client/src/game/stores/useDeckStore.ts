import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card, AvatarCard, ActionCard } from '../data/cardTypes';
import { fireAvatarCards, fireActionCards } from '../data/fireCards';
import { 
  kobarBorahAvatarCards, 
  kobarBorahActionCards, 
  kujanaKuhakaAvatarCards, 
  allFireCards 
} from '../data/kobarBorahCards';
import { allKujanaKuhakaCards } from '../data/kujanaKuhakaCards';
import { redElementalSpellCards } from '../data/redElementalCards';
import { allNeutralCards } from '../data/neutralCards';
import { cardNftService } from '../../blockchain/solana/cardNftService';
import { toast } from 'sonner';

// Define the deck interface
export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  coverCardId?: string; // Optional card to show as the deck cover
  createdAt: number;
  updatedAt: number;
  tribe?: string; // Optional tribe identifier
}

// Define the deck store interface
interface DeckStore {
  decks: Deck[];
  activeDeckId: string | null;
  
  // Actions
  addDeck: (name: string, cards: Card[], tribe?: string) => Deck;
  updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => void;
  deleteDeck: (id: string) => void;
  setActiveDeck: (id: string) => void;
  
  // Card management helpers
  getAvailableCards: () => Card[];
  getAvailableCardsWithCNFTs: () => Promise<Card[]>;
  findCard: (id: string) => Card | undefined;
  getAvailableCardsByElement: (element: string) => Card[];
  getAvailableCardsByTribe: (tribe: string) => Card[];
  refreshLibrary: () => void;
  syncWithNFTs: () => Promise<void>;
}

// Helper function to create a Kobar-Borah tribe deck
const createKobarBorahDeck = (): Deck => {
  const avatars = kobarBorahAvatarCards.filter(card => card.level === 1);
  const level2Avatars = kobarBorahAvatarCards.filter(card => card.level === 2);
  const actions = kobarBorahActionCards;
  
  const cards: Card[] = [];
  
  // Add copies of level 1 avatars (3 of each)
  avatars.forEach(avatar => {
    for (let i = 1; i <= 3; i++) {
      cards.push({...avatar, id: `${avatar.id}-${i}`});
    }
  });
  
  // Add 3 copies of each action card
  actions.forEach(action => {
    for (let i = 0; i < 3; i++) {
      cards.push({...action, id: `${action.id}-${i+1}`});
    }
  });
  
  // Also add 1 copy of each level 2 avatar for evolution possibilities
  level2Avatars.forEach(avatar => {
    cards.push({...avatar, id: `${avatar.id}-1`});
  });
  
  // If deck size is less than 40, add more action cards until we reach minimum size
  if (cards.length < 40) {
    const cardsNeeded = 40 - cards.length;
    let index = 0;
    
    for (let i = 0; i < cardsNeeded; i++) {
      const action = actions[index % actions.length]; // Cycle through action cards
      const copyId = Math.floor(i / actions.length) + 5; // Start from copy #5
      cards.push({...action, id: `${action.id}-extra-${copyId}`});
      index++;
    }
  }
  
  const now = Date.now();
  return {
    id: `deck-kb-${now}`,
    name: "Kobar-Borah Deck",
    cards,
    coverCardId: cards.find(card => card.name === "Radja")?.id || cards[0].id,
    createdAt: now,
    updatedAt: now,
    tribe: "kobar-borah"
  };
};

// Helper function to create a Kujana-Kuhaka tribe deck
const createKujanaKuhakaDeck = (): Deck => {
  const avatars = kujanaKuhakaAvatarCards.filter(card => card.level === 1);
  const level2Avatars = kujanaKuhakaAvatarCards.filter(card => card.level === 2);
  const actions = redElementalSpellCards;
  
  const cards: Card[] = [];
  
  // Add copies of level 1 avatars (3 of each)
  avatars.forEach(avatar => {
    for (let i = 1; i <= 3; i++) {
      cards.push({...avatar, id: `${avatar.id}-${i}`});
    }
  });
  
  // Add 3 copies of each action card
  actions.forEach(action => {
    for (let i = 0; i < 3; i++) {
      cards.push({...action, id: `${action.id}-${i+1}`});
    }
  });
  
  // Also add 1 copy of each level 2 avatar for evolution possibilities
  level2Avatars.forEach(avatar => {
    cards.push({...avatar, id: `${avatar.id}-1`});
  });
  
  // If deck size is less than 40, add more action cards until we reach minimum size
  if (cards.length < 40) {
    const cardsNeeded = 40 - cards.length;
    let index = 0;
    
    for (let i = 0; i < cardsNeeded; i++) {
      const action = actions[index % actions.length]; // Cycle through action cards
      const copyId = Math.floor(i / actions.length) + 5; // Start from copy #5
      cards.push({...action, id: `${action.id}-extra-${copyId}`});
      index++;
    }
  }
  
  const now = Date.now();
  return {
    id: `deck-kk-${now}`,
    name: "Kujana-Kuhaka Deck",
    cards,
    coverCardId: cards.find(card => card.name === "Boar Witch")?.id || cards[0].id,
    createdAt: now,
    updatedAt: now,
    tribe: "kujana-kuhaka"
  };
};

// Helper function to create a default deck from the old structure (keeping for backwards compatibility)
const createDefaultDeck = (name: string): Deck => {
  // Create a deck with Fire element cards
  const avatars = fireAvatarCards.filter(card => card.level === 1);
  const level2Avatars = fireAvatarCards.filter(card => card.level === 2);
  const actions = fireActionCards;
  
  const cards: Card[] = [];
  
  // Add copies of level 1 avatars (at least 2 of each)
  avatars.forEach(avatar => {
    // Add 3 copies of each level 1 avatar for more consistency
    for (let i = 1; i <= 3; i++) {
      cards.push({...avatar, id: `${avatar.id}-${i}`});
    }
  });
  
  // Add 3 copies of each action card
  actions.forEach(action => {
    for (let i = 0; i < 3; i++) {
      cards.push({...action, id: `${action.id}-${i+1}`});
    }
  });
  
  // Also add 1 copy of each level 2 avatar for evolution possibilities
  level2Avatars.forEach(avatar => {
    cards.push({...avatar, id: `${avatar.id}-1`});
  });
  
  // If deck size is less than 40, add more action cards until we reach minimum size
  if (cards.length < 40) {
    const cardsNeeded = 40 - cards.length;
    let index = 0;
    
    for (let i = 0; i < cardsNeeded; i++) {
      const action = actions[index % actions.length]; // Cycle through action cards
      const copyId = Math.floor(i / actions.length) + 5; // Start from copy #5
      cards.push({...action, id: `${action.id}-extra-${copyId}`});
      index++;
    }
  }
  
  const now = Date.now();
  return {
    id: `deck-${now}`,
    name,
    cards,
    coverCardId: cards[0].id,
    createdAt: now,
    updatedAt: now
  };
};

// Create specialized Kobar tribal deck
const createKobarDeck = (): Deck => {
  // Get only Kobar avatars
  const avatars = kobarBorahAvatarCards.filter(card => 
    card.level === 1 && card.subType === 'kobar'
  );
  const level2Avatars = kobarBorahAvatarCards.filter(card => 
    card.level === 2 && card.subType === 'kobar'
  );
  // Use all action cards as they're non-tribal specific
  const actions = kobarBorahActionCards;
  
  const cards: Card[] = [];
  
  // Add copies of level 1 avatars (3 of each)
  avatars.forEach(avatar => {
    for (let i = 1; i <= 3; i++) {
      cards.push({...avatar, id: `${avatar.id}-${i}`});
    }
  });
  
  // Add 3 copies of each action card
  actions.forEach(action => {
    for (let i = 0; i < 3; i++) {
      cards.push({...action, id: `${action.id}-${i+1}`});
    }
  });
  
  // Also add 1 copy of each level 2 avatar for evolution possibilities
  level2Avatars.forEach(avatar => {
    cards.push({...avatar, id: `${avatar.id}-1`});
  });
  
  // If deck size is less than 40, add more action cards until we reach minimum size
  if (cards.length < 40) {
    const cardsNeeded = 40 - cards.length;
    let index = 0;
    
    for (let i = 0; i < cardsNeeded; i++) {
      const action = actions[index % actions.length]; // Cycle through action cards
      const copyId = Math.floor(i / actions.length) + 5; // Start from copy #5
      cards.push({...action, id: `${action.id}-extra-${copyId}`});
      index++;
    }
  }
  
  const now = Date.now();
  return {
    id: `deck-kobar-${now}`,
    name: "Kobar Specialized Deck",
    cards,
    coverCardId: cards.find(card => card.name === "Radja")?.id || cards[0].id,
    createdAt: now,
    updatedAt: now,
    tribe: "kobar"
  };
};

// Create specialized Kujana-Kuhaka tribal deck
const createKujanaKuhakaPureDeck = (): Deck => {
  // Get only Kujana and Kuhaka avatars from all cards
  const avatars = allFireCards.filter(card => 
    card.type === 'avatar' && 
    (card as AvatarCard).level === 1 && 
    ((card as AvatarCard).subType === 'kujana' || (card as AvatarCard).subType === 'kuhaka')
  ) as AvatarCard[];
  
  const level2Avatars = allFireCards.filter(card => 
    card.type === 'avatar' && 
    (card as AvatarCard).level === 2 && 
    ((card as AvatarCard).subType === 'kujana' || (card as AvatarCard).subType === 'kuhaka')
  ) as AvatarCard[];
  
  // Use all action cards as they're non-tribal specific
  const actions = kobarBorahActionCards;
  
  const cards: Card[] = [];
  
  // Add copies of level 1 avatars (3 of each)
  avatars.forEach(avatar => {
    for (let i = 1; i <= 3; i++) {
      cards.push({...avatar, id: `${avatar.id}-${i}`});
    }
  });
  
  // Add 3 copies of each action card
  actions.forEach(action => {
    for (let i = 0; i < 3; i++) {
      cards.push({...action, id: `${action.id}-${i+1}`});
    }
  });
  
  // Also add 1 copy of each level 2 avatar for evolution possibilities
  level2Avatars.forEach(avatar => {
    cards.push({...avatar, id: `${avatar.id}-1`});
  });
  
  // If deck size is less than 40, add more action cards until we reach minimum size
  if (cards.length < 40) {
    const cardsNeeded = 40 - cards.length;
    let index = 0;
    
    for (let i = 0; i < cardsNeeded; i++) {
      const action = actions[index % actions.length]; // Cycle through action cards
      const copyId = Math.floor(i / actions.length) + 5; // Start from copy #5
      cards.push({...action, id: `${action.id}-extra-${copyId}`});
      index++;
    }
  }
  
  const now = Date.now();
  return {
    id: `deck-kk-pure-${now}`,
    name: "Kujana-Kuhaka Pure Tribal Deck",
    cards,
    coverCardId: cards.find(card => (card as AvatarCard).subType === 'kujana')?.id || cards[0].id,
    createdAt: now,
    updatedAt: now,
    tribe: "kujana-kuhaka"
  };
};

// Create the deck store
export const useDeckStore = create<DeckStore>()(
  persist(
    (set, get) => ({
      // Initialize with all our decks
      decks: [
        createKobarBorahDeck(),
        createKujanaKuhakaDeck(),
        createKobarDeck(),
        createKujanaKuhakaPureDeck()
      ],
      activeDeckId: null,
      
      addDeck: (name, cards, tribe) => {
        // Check if we've reached the maximum number of decks (5)
        const currentDecks = get().decks;
        if (currentDecks.length >= 5) {
          toast.error("You can only have a maximum of 5 decks. Please delete one first.");
          throw new Error("Maximum number of decks (5) reached");
        }
        
        // Validate the deck (must have at least 40 cards)
        if (cards.length < 40) {
          throw new Error("A deck must have at least 40 cards");
        }
        
        const now = Date.now();
        const newDeck: Deck = {
          id: `deck-${now}`,
          name,
          cards,
          coverCardId: cards[0].id,
          createdAt: now,
          updatedAt: now,
          tribe
        };
        
        set(state => ({
          decks: [...state.decks, newDeck]
        }));
        
        return newDeck;
      },
      
      updateDeck: (id, updates) => {
        set(state => ({
          decks: state.decks.map(deck => 
            deck.id === id 
              ? { 
                  ...deck, 
                  ...updates, 
                  updatedAt: Date.now() 
                } 
              : deck
          )
        }));
      },
      
      deleteDeck: (id) => {
        set(state => ({
          decks: state.decks.filter(deck => deck.id !== id),
          activeDeckId: state.activeDeckId === id ? null : state.activeDeckId
        }));
      },
      
      setActiveDeck: (id) => {
        const deck = get().decks.find(d => d.id === id);
        if (!deck) {
          throw new Error(`Deck with id ${id} not found`);
        }
        
        set({ activeDeckId: id });
      },
      
      getAvailableCards: () => {
        // Return all available cards including neutral cards
        return [...allFireCards, ...allNeutralCards];
      },

      getAvailableCardsWithCNFTs: async () => {
        try {
          // Get cNFT cards from wallet
          const walletStatus = await cardNftService.getWalletStatus();
          let cNftCards: Card[] = [];
          
          if (walletStatus.connected) {
            cNftCards = await cardNftService.getOwnedCards();
          }
          
          // Return all available cards including cNFTs and neutral cards
          return [...allFireCards, ...allNeutralCards, ...cNftCards];
        } catch (error) {
          console.error('Error loading cNFT cards in deck store:', error);
          // Fallback to regular cards if cNFT loading fails
          return [...allFireCards, ...allNeutralCards];
        }
      },
      
      findCard: (id) => {
        // Find the base card by id (without copy number)
        const baseId = id.split('-')[0] + '-' + id.split('-')[1];
        
        // First check in fire cards
        const fireCard = allFireCards.find(card => card.id.startsWith(baseId));
        if (fireCard) return fireCard;
        
        // If not found, check in neutral cards
        return allNeutralCards.find(card => card.id.startsWith(baseId));
      },
      
      getAvailableCardsByElement: (element) => {
        return get().getAvailableCards().filter(card => card.element === element);
      },
      
      getAvailableCardsByTribe: (tribe) => {
        if (tribe === 'kobar-borah') {
          return [...kobarBorahAvatarCards, ...kobarBorahActionCards];
        } else if (tribe === 'kujana-kuhaka') {
          return [...kujanaKuhakaAvatarCards, ...redElementalSpellCards];
        } else if (tribe === 'kujana') {
          return allFireCards.filter(card => 
            card.type === 'avatar' && (card as AvatarCard).subType === 'kujana'
          );
        } else if (tribe === 'kuhaka') {
          return allFireCards.filter(card => 
            card.type === 'avatar' && (card as AvatarCard).subType === 'kuhaka'
          );
        } else if (tribe === 'kobar') {
          return allFireCards.filter(card => 
            card.type === 'avatar' && (card as AvatarCard).subType === 'kobar'
          );
        } else if (tribe === 'borah') {
          return allFireCards.filter(card => 
            card.type === 'avatar' && (card as AvatarCard).subType === 'borah'
          );
        }
        
        // Default to all cards if tribe not recognized
        return get().getAvailableCards();
      },

      refreshLibrary: () => {
        // Force refresh library data by triggering state update
        set(state => ({ ...state }));
      },

      syncWithNFTs: async () => {
        try {
          const walletStatus = await cardNftService.getWalletStatus();
          if (walletStatus.connected) {
            await cardNftService.getOwnedCards();
            // Trigger library refresh after syncing
            get().refreshLibrary();
          }
        } catch (error) {
          console.error('Error syncing with NFTs:', error);
        }
      }
    }),
    {
      name: 'book-of-spektrum-decks', // Local storage key
      // Only persist deck data
      partialize: (state) => ({ 
        decks: state.decks,
        activeDeckId: state.activeDeckId
      })
    }
  )
);