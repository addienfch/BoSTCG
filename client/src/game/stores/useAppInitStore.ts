import { create } from 'zustand';
import { useDeckStore } from './useDeckStore';
import { useExpansionStore } from './useExpansionStore';
import { usePremadeDecksStore } from './usePremadeDecksStore';
import { useBattleSetsStore } from './useBattleSetsStore';
import { useBoosterVariantStore } from './useBoosterVariantStore';

interface AppInitStore {
  isInitialized: boolean;
  initializationStatus: {
    decks: boolean;
    expansions: boolean;
    premadeDecks: boolean;
    battleSets: boolean;
    boosterVariants: boolean;
  };
  initializeApp: () => Promise<void>;
  getInitializationReport: () => string;
}

export const useAppInitStore = create<AppInitStore>()((set, get) => ({
  isInitialized: false,
  initializationStatus: {
    decks: false,
    expansions: false,
    premadeDecks: false,
    battleSets: false,
    boosterVariants: false,
  },

  initializeApp: async () => {
    console.log('🚀 Starting comprehensive app initialization...');
    
    try {
      const status = {
        decks: false,
        expansions: false,
        premadeDecks: false,
        battleSets: false,
        boosterVariants: false,
      };

      // Initialize Expansions first (other stores depend on this)
      try {
        useExpansionStore.getState().initializeExpansions();
        status.expansions = true;
        console.log('✅ Expansions initialized');
      } catch (error) {
        console.error('❌ Failed to initialize expansions:', error);
      }

      // Initialize Deck Store (ensure cards are loaded)
      try {
        const deckStore = useDeckStore.getState();
        const cardCount = deckStore.getAvailableCards().length;
        if (cardCount > 0) {
          status.decks = true;
          console.log(`✅ Deck store initialized with ${cardCount} cards`);
        } else {
          console.warn('⚠️ Deck store has no cards available');
        }
      } catch (error) {
        console.error('❌ Failed to initialize deck store:', error);
      }

      // Initialize Premade Decks
      try {
        usePremadeDecksStore.getState().initializePremadeDecks();
        status.premadeDecks = true;
        console.log('✅ Premade decks initialized');
      } catch (error) {
        console.error('❌ Failed to initialize premade decks:', error);
      }

      // Initialize Battle Sets
      try {
        useBattleSetsStore.getState().initializeBattleSets();
        status.battleSets = true;
        console.log('✅ Battle sets initialized');
      } catch (error) {
        console.error('❌ Failed to initialize battle sets:', error);
      }

      // Initialize Booster Variants (this doesn't have default data, just mark as ready)
      try {
        status.boosterVariants = true;
        console.log('✅ Booster variants ready');
      } catch (error) {
        console.error('❌ Failed to initialize booster variants:', error);
      }

      const allInitialized = Object.values(status).every(Boolean);
      
      set({ 
        isInitialized: allInitialized,
        initializationStatus: status 
      });

      if (allInitialized) {
        console.log('🎉 All stores successfully initialized!');
      } else {
        console.warn('⚠️ Some stores failed to initialize:', status);
      }

    } catch (error) {
      console.error('💥 Critical error during app initialization:', error);
      set({ 
        isInitialized: false,
        initializationStatus: {
          decks: false,
          expansions: false,
          premadeDecks: false,
          battleSets: false,
          boosterVariants: false,
        }
      });
    }
  },

  getInitializationReport: () => {
    const { isInitialized, initializationStatus } = get();
    
    let report = `APP INITIALIZATION STATUS\n`;
    report += `========================\n`;
    report += `Overall Status: ${isInitialized ? '✅ READY' : '❌ INCOMPLETE'}\n\n`;
    
    report += `Store Status:\n`;
    report += `- Expansions: ${initializationStatus.expansions ? '✅' : '❌'}\n`;
    report += `- Deck Store: ${initializationStatus.decks ? '✅' : '❌'}\n`;
    report += `- Premade Decks: ${initializationStatus.premadeDecks ? '✅' : '❌'}\n`;
    report += `- Battle Sets: ${initializationStatus.battleSets ? '✅' : '❌'}\n`;
    report += `- Booster Variants: ${initializationStatus.boosterVariants ? '✅' : '❌'}\n`;
    
    // Add data counts
    try {
      const expansionCount = useExpansionStore.getState().expansions.length;
      const deckCount = useDeckStore.getState().getAvailableCards().length;
      const premadeCount = usePremadeDecksStore.getState().premadeDecks.length;
      const battleSetCount = useBattleSetsStore.getState().battleSets.length;
      
      report += `\nData Counts:\n`;
      report += `- Expansions: ${expansionCount}\n`;
      report += `- Available Cards: ${deckCount}\n`;
      report += `- Premade Decks: ${premadeCount}\n`;
      report += `- Battle Set Items: ${battleSetCount}\n`;
    } catch (error) {
      report += `\nData Count Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
    }
    
    return report;
  }
}));