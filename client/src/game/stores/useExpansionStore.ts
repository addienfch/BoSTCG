import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Expansion {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  cardCount: number;
  artUrl: string;
  symbol: string;
}

interface ExpansionStore {
  expansions: Expansion[];
  addExpansion: (expansion: Expansion) => void;
  updateExpansion: (id: string, expansion: Expansion) => void;
  deleteExpansion: (id: string) => void;
  getExpansion: (id: string) => Expansion | undefined;
  getExpansionByName: (name: string) => Expansion | undefined;
  initializeExpansions: () => void;
}

// Default expansions data
const defaultExpansions: Expansion[] = [
  {
    id: 'kobar-borah',
    name: 'Kobar & Borah',
    description: 'Fire and Earth tribes clash in epic battles',
    releaseDate: '2024-01-01',
    cardCount: 120,
    artUrl: '/assets/shared/expansions/kobar-borah.svg',
    symbol: '🔥'
  },
  {
    id: 'kujana-kuhaka',
    name: 'Kujana & Kuhaka',
    description: 'Water and Air tribes unite with new mechanics',
    releaseDate: '2024-03-01',
    cardCount: 115,
    artUrl: '/assets/shared/expansions/kujana-kuhaka.svg',
    symbol: '💧'
  },
  {
    id: 'neutral-spells',
    name: 'Neutral Spells',
    description: 'Universal magic cards for all elements',
    releaseDate: '2024-02-01',
    cardCount: 80,
    artUrl: '/assets/shared/expansions/neutral-spells.svg',
    symbol: '⚡'
  }
];

export const useExpansionStore = create<ExpansionStore>()(
  persist(
    (set, get) => ({
      expansions: defaultExpansions,

      addExpansion: (expansion: Expansion) => {
        set((state) => ({
          expansions: [...state.expansions, expansion]
        }));
      },

      updateExpansion: (id: string, updatedExpansion: Expansion) => {
        set((state) => ({
          expansions: state.expansions.map(exp => 
            exp.id === id ? updatedExpansion : exp
          )
        }));
      },

      deleteExpansion: (id: string) => {
        set((state) => ({
          expansions: state.expansions.filter(exp => exp.id !== id)
        }));
      },

      getExpansion: (id: string) => {
        return get().expansions.find(exp => exp.id === id);
      },

      getExpansionByName: (name: string) => {
        return get().expansions.find(exp => exp.name === name);
      },

      initializeExpansions: () => {
        const { expansions } = get();
        if (expansions.length === 0) {
          set({ expansions: defaultExpansions });
          console.log('Initialized expansions with default data');
        } else {
          console.log('Expansions already initialized');
        }
      }
    }),
    {
      name: 'expansion-store', // unique name for localStorage key
      version: 1,
    }
  )
);