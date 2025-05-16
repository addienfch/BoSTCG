import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';
import { Card, AvatarCard } from '../data/cardTypes';
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
import { toast } from 'sonner';
import { useCollectionStore } from './useCollectionStore';

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
  ownedDecks: string[]; // Track which decks are owned by deck ID
  starterDeckClaimed: boolean; // Track if starter deck has been claimed
  
  // Actions
  addDeck: (name: string, cards: Card[], tribe?: string) => Deck;
  updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => void;
  deleteDeck: (id: string) => void;
  setActiveDeck: (id: string) => void;
  purchaseDeck: (deckId: string, cards: Card[]) => boolean;
  claimStarterDeck: () => void;
  
  // Card management helpers
  getAvailableCards: () => Card[];
  findCard: (id: string) => Card | undefined;
  getAvailableCardsByElement: (element: string) => Card[];
  getAvailableCardsByTribe: (tribe: string) => Card[];
  getOwnedDecks: () => Deck[];
  isDeckOwned: (deckId: string) => boolean;
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
          // Initialize with empty decks (will be added when purchased)
      decks: [] as Deck[],
      activeDeckId: null,
      ownedDecks: [] as string[],
      starterDeckClaimed: false,
      
      addDeck: (name, cards, tribe) => {
        // Check if we've reached the maximum number of decks (5)
        const currentDecks = get().decks;
        const now = Date.now();
        const newDeck: Deck = {
          id: `deck-${now}`,
          name,
          cards,
          coverCardId: cards[0]?.id,
          createdAt: now,
          updatedAt: now,
          tribe
        };
        
        set(state => ({
          decks: [...state.decks, newDeck],
          activeDeckId: newDeck.id
        }));
        
        return newDeck;
      },
      
      // Update an existing deck
      updateDeck: (id, updates) => {
        set(state => ({
          decks: state.decks.map(deck => 
            deck.id === id 
              ? { ...deck, ...updates, updatedAt: Date.now() } 
              : deck
          )
        }));
      },
      
      // Delete a deck
      deleteDeck: (id) => {
        set(state => ({
          decks: state.decks.filter(deck => deck.id !== id),
          activeDeckId: state.activeDeckId === id ? null : state.activeDeckId,
          ownedDecks: state.ownedDecks.filter(deckId => deckId !== id)
        }));
      },
      
      // Set the active deck
      setActiveDeck: (id) => {
        set({ activeDeckId: id });
      },

      // Purchase a deck and add it to the collection
      purchaseDeck: (deckId: string, cards: Card[]) => {
        const { ownedDecks } = get();
        
        // Check if already owned
        if (ownedDecks.includes(deckId)) {
          toast.error('You already own this deck!');
          return false;
        }
        
        // Add cards to collection
        const { addCards } = useCollectionStore.getState();
        addCards(cards);
        
        // Mark deck as owned
        set(state => ({
          ownedDecks: [...state.ownedDecks, deckId]
        }));
        
        // Create the deck and add it to the decks array
        let newDeck: Deck;
        if (deckId === 'deck1') {
          newDeck = createKobarBorahDeck();
        } else if (deckId === 'deck2') {
          newDeck = createKujanaKuhakaDeck();
        } else {
          // Create a generic deck if it's not one of the predefined ones
          newDeck = {
            id: `deck-${Date.now()}`,
            name: `Deck ${deckId}`,
            cards: cards,
            coverCardId: cards[0]?.id,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
        }
        
        // Add the new deck to the decks array
        set(state => ({
          decks: [...state.decks, newDeck],
          activeDeckId: newDeck.id
        }));
        
        toast.success('Deck purchased successfully!');
        return true;
      },
      
      // Claim the starter deck
      claimStarterDeck: () => {
        const { starterDeckClaimed } = get();
        
        if (starterDeckClaimed) {
          toast.error('You have already claimed your starter deck!');
          return false;
        }
        
        // Create a starter deck (Kobar-Borah deck as default)
        const starterDeck = createKobarBorahDeck();
        
        // Add deck to collection
        set(state => ({
          decks: [...state.decks, starterDeck],
          ownedDecks: [...state.ownedDecks, starterDeck.id],
          starterDeckClaimed: true,
          activeDeckId: starterDeck.id
        }));
        
        // Add cards to collection
        const { addCards } = useCollectionStore.getState();
        addCards(starterDeck.cards);
        
        toast.success('Starter deck claimed successfully!');
        return true;
      },
      
      // Get all available cards for deck building
      getAvailableCards: () => {
        // Combine all card sources
        return [
          ...allFireCards,
          ...allKujanaKuhakaCards,
          ...allNeutralCards
        ];
      },
      
      // Find a card by ID
      findCard: (id) => {
        const allCards = get().getAvailableCards();
        // First try exact match
        const exactMatch = allCards.find(card => card.id === id);
        if (exactMatch) return exactMatch;
        
        // If no exact match, try base ID (without copy number)
        const baseId = id.split('-').slice(0, 2).join('-');
        return allCards.find(card => card.id.split('-')[0] === baseId.split('-')[0]);
      },
      
      // Get cards by element
      getAvailableCardsByElement: (element) => {
        const allCards = get().getAvailableCards();
        return allCards.filter(card => card.element === element);
      },
      
      // Get cards by tribe
      getAvailableCardsByTribe: (tribe) => {
        const allCards = get().getAvailableCards();
        return allCards.filter(card => 
          card.type === 'avatar' && 
          (card as AvatarCard).subType?.toLowerCase() === tribe.toLowerCase()
        );
      },

      // Get all owned decks
      getOwnedDecks: () => {
        const { decks, ownedDecks } = get();
        return decks.filter(deck => ownedDecks.includes(deck.id));
      },

      // Check if a deck is owned
      isDeckOwned: (deckId) => {
        const { ownedDecks } = get();
        return ownedDecks.includes(deckId);
      }
    }),
    {
      name: 'book-of-spektrum-decks', // Local storage key
      // Persist deck data and ownership info
      partialize: (state) => ({
        decks: state.decks,
        activeDeckId: state.activeDeckId,
        ownedDecks: state.ownedDecks,
        starterDeckClaimed: state.starterDeckClaimed
      })
    }
  )
);