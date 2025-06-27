import { create } from 'zustand';
import { useExpansionStore } from './useExpansionStore';
import { usePremadeDecksStore } from './usePremadeDecksStore';
import { useDeckStore } from './useDeckStore';

// Central data synchronization utilities
interface DataSyncStore {
  syncAllData: () => void;
  getExpansionsWithDecks: () => Array<{
    expansion: any;
    decks: any[];
  }>;
  validateDataConsistency: () => {
    valid: boolean;
    issues: string[];
  };
}

export const useDataSyncStore = create<DataSyncStore>()((set, get) => ({
  syncAllData: () => {
    // This function ensures all stores are properly connected
    console.log('Syncing all game data stores...');
    
    // Validate expansion-deck relationships
    const expansions = useExpansionStore.getState().expansions;
    const premadeDecks = usePremadeDecksStore.getState().premadeDecks;
    
    console.log('Available expansions:', expansions.length);
    console.log('Available premade decks:', premadeDecks.length);
    
    // Log any orphaned decks (decks with invalid expansion references)
    const orphanedDecks = premadeDecks.filter(deck => 
      !expansions.some(exp => exp.name === deck.expansion)
    );
    
    if (orphanedDecks.length > 0) {
      console.warn('Found orphaned decks with invalid expansion references:', orphanedDecks);
    }
  },

  getExpansionsWithDecks: () => {
    const expansions = useExpansionStore.getState().expansions;
    const premadeDecks = usePremadeDecksStore.getState().premadeDecks;
    
    return expansions.map(expansion => ({
      expansion,
      decks: premadeDecks.filter(deck => deck.expansion === expansion.name)
    }));
  },

  validateDataConsistency: () => {
    const issues: string[] = [];
    
    const expansions = useExpansionStore.getState().expansions;
    const premadeDecks = usePremadeDecksStore.getState().premadeDecks;
    
    // Check for missing expansion references
    premadeDecks.forEach(deck => {
      if (!expansions.some(exp => exp.name === deck.expansion)) {
        issues.push(`Deck "${deck.name}" references non-existent expansion "${deck.expansion}"`);
      }
    });
    
    // Check for expansions without decks
    expansions.forEach(expansion => {
      const deckCount = premadeDecks.filter(deck => deck.expansion === expansion.name).length;
      if (deckCount === 0) {
        issues.push(`Expansion "${expansion.name}" has no associated premade decks`);
      }
    });
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}));