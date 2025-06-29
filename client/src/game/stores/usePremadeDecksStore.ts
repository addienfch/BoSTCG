import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../data/cardTypes';

export interface PremadeDeck {
  id: string;
  name: string;
  expansion: string;
  tribe: string;
  description: string;
  price: number;
  cardCount: number;
  strategy: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  coverCardName: string;
  keyCards: string[];
  purchased: boolean;
  artUrl: string; // Deck cover image
  cards?: Card[]; // Optional full card list
}

interface PremadeDecksStore {
  premadeDecks: PremadeDeck[];
  addPremadeDeck: (deck: PremadeDeck) => void;
  updatePremadeDeck: (id: string, deck: PremadeDeck) => void;
  deletePremadeDeck: (id: string) => void;
  getPremadeDeck: (id: string) => PremadeDeck | undefined;
  getPremadeDecksByExpansion: (expansion: string) => PremadeDeck[];
  purchaseDeck: (id: string) => void;
  initializePremadeDecks: () => void;
}

// Default premade decks data
const defaultPremadeDecks: PremadeDeck[] = [
  {
    id: 'kobar-borah-starter',
    name: 'Kobar-Borah Tribal',
    expansion: 'Kobar & Borah',
    tribe: 'kobar-borah',
    description: 'Complete tribal deck featuring Kobar and Borah avatars with supporting spells.',
    price: 35,
    cardCount: 42,
    strategy: 'Tribal synergy with avatar evolution and equipment support',
    difficulty: 'Beginner',
    coverCardName: 'Radja',
    keyCards: ['Radja', 'Crimson', 'Boar Berserker', 'Banaspati'],
    purchased: false,
    artUrl: '/assets/shared/decks/fire-tribe-starter.svg'
  },
  {
    id: 'kujana-kuhaka-starter',
    name: 'Kujana-Kuhaka Tribal',
    expansion: 'Kujana & Kuhaka',
    tribe: 'kujana-kuhaka',
    description: 'Aggressive tribal deck with Kujana and Kuhaka avatars plus fire spells.',
    price: 40,
    cardCount: 45,
    strategy: 'Fast aggro with spell support and avatar synergies',
    difficulty: 'Intermediate',
    coverCardName: 'Boar Witch',
    keyCards: ['Boar Witch', 'Daisy', 'Spark', 'Burn Ball'],
    purchased: false,
    artUrl: '/assets/shared/decks/water-tribe-starter.svg'
  },
  {
    id: 'kobar-pure',
    name: 'Pure Kobar Deck',
    expansion: 'Neutral Spells',
    tribe: 'kobar',
    description: 'Specialized deck focusing only on Kobar tribe avatars and equipment.',
    price: 50,
    cardCount: 40,
    strategy: 'Pure tribal with equipment synergy',
    difficulty: 'Advanced',
    coverCardName: 'Kobar Trainee A',
    keyCards: ['Kobar Trainee A', 'Kobar Trainee B', 'Cracking Sword'],
    purchased: false,
    artUrl: '/assets/shared/decks/ground-tribe-starter.svg'
  },
  {
    id: 'kobar-fire-starter',
    name: 'Kobar Fire Starter',
    expansion: 'Kobar & Borah',
    tribe: 'Kobar',
    description: 'A balanced fire-based starter deck',
    price: 1500,
    cardCount: 40,
    strategy: 'Aggressive gameplay with burn effects',
    difficulty: 'Beginner',
    coverCardName: 'Radja',
    keyCards: ['Radja', 'Crimson', 'Spark'],
    purchased: false,
    artUrl: '/assets/shared/decks/air-tribe-starter.svg'
  }
];

export const usePremadeDecksStore = create<PremadeDecksStore>()(
  persist(
    (set, get) => ({
      premadeDecks: defaultPremadeDecks,

      addPremadeDeck: (deck: PremadeDeck) => {
        set((state) => ({
          premadeDecks: [...state.premadeDecks, deck]
        }));
      },

      updatePremadeDeck: (id: string, updatedDeck: PremadeDeck) => {
        set((state) => ({
          premadeDecks: state.premadeDecks.map(deck => 
            deck.id === id ? updatedDeck : deck
          )
        }));
      },

      deletePremadeDeck: (id: string) => {
        set((state) => ({
          premadeDecks: state.premadeDecks.filter(deck => deck.id !== id)
        }));
      },

      getPremadeDeck: (id: string) => {
        return get().premadeDecks.find(deck => deck.id === id);
      },

      getPremadeDecksByExpansion: (expansion: string) => {
        return get().premadeDecks.filter(deck => deck.expansion === expansion);
      },

      purchaseDeck: (id: string) => {
        set((state) => ({
          premadeDecks: state.premadeDecks.map(deck => 
            deck.id === id ? { ...deck, purchased: true } : deck
          )
        }));
      },

      initializePremadeDecks: () => {
        const { premadeDecks } = get();
        if (premadeDecks.length === 0) {
          set({ premadeDecks: defaultPremadeDecks });
          console.log('Initialized premade decks with default data');
        } else {
          console.log('Premade decks already initialized');
        }
      }
    }),
    {
      name: 'premade-decks-store',
      version: 1,
    }
  )
);