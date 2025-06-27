import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppInitStore {
  storesInitialized: Record<string, boolean>;
  initializationInProgress: boolean;
  initializationComplete: boolean;
  
  // Actions
  markStoreInitialized: (storeName: string) => void;
  waitForStoreInitialization: (storeName: string) => Promise<boolean>;
  initializeAllStores: () => Promise<void>;
  resetInitialization: () => void;
}

// Store names that need coordination
export const STORE_NAMES = {
  EXPANSION: 'expansion',
  PREMADE_DECKS: 'premadeDecks',
  DECK: 'deck',
  BATTLE_SETS: 'battleSets',
  BOOSTER_VARIANT: 'boosterVariant',
  DATA_SYNC: 'dataSync'
} as const;

export const useAppInitStore = create<AppInitStore>()(
  persist(
    (set, get) => ({
      storesInitialized: {},
      initializationInProgress: false,
      initializationComplete: false,

      markStoreInitialized: (storeName: string) => {
        const { storesInitialized } = get();
        const newInitialized = { ...storesInitialized, [storeName]: true };
        
        // Check if all stores are initialized
        const allStoresInitialized = Object.values(STORE_NAMES).every(
          name => newInitialized[name] === true
        );

        set({
          storesInitialized: newInitialized,
          initializationComplete: allStoresInitialized,
          initializationInProgress: !allStoresInitialized
        });

        console.log(`Store ${storeName} initialized. Complete: ${allStoresInitialized}`);
      },

      waitForStoreInitialization: async (storeName: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const checkInitialization = () => {
            const { storesInitialized } = get();
            if (storesInitialized[storeName]) {
              resolve(true);
              return;
            }
            
            // Check again in 100ms
            setTimeout(checkInitialization, 100);
          };
          
          checkInitialization();
          
          // Timeout after 10 seconds
          setTimeout(() => {
            console.warn(`Store ${storeName} initialization timeout`);
            resolve(false);
          }, 10000);
        });
      },

      initializeAllStores: async () => {
        // Helper function for safe initialization
        const safeInitialize = async (initFn: () => void) => {
          try {
            const result = initFn();
            // Handle both sync and async initialization
            if (result && typeof result.then === 'function') {
              await result;
            }
            // Add small delay to prevent race conditions
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.warn('Store initialization warning:', error);
            // Don't fail the entire initialization for individual store errors
          }
        };

        try {
          set({ initializationInProgress: true });
          console.log('Starting coordinated store initialization...');

          // Import and initialize stores in dependency order
          const { useExpansionStore } = await import('./useExpansionStore');
          const { usePremadeDecksStore } = await import('./usePremadeDecksStore');
          const { useDeckStore } = await import('./useDeckStore');
          const { useBattleSetsStore } = await import('./useBattleSetsStore');
          const { useBoosterVariantStore } = await import('./useBoosterVariantStore');
          const { useDataSyncStore } = await import('./useDataSyncStore');

          // Initialize stores in sequence to prevent race conditions
          console.log('Initializing expansion store...');
          await safeInitialize(() => useExpansionStore.getState().initializeExpansions?.());
          get().markStoreInitialized(STORE_NAMES.EXPANSION);

          console.log('Initializing deck store...');
          await safeInitialize(() => useDeckStore.getState().initializeDefaultCards?.());
          get().markStoreInitialized(STORE_NAMES.DECK);

          console.log('Initializing premade decks store...');
          await safeInitialize(() => usePremadeDecksStore.getState().initializePremadeDecks?.());
          get().markStoreInitialized(STORE_NAMES.PREMADE_DECKS);

          console.log('Initializing battle sets store...');
          await safeInitialize(() => useBattleSetsStore.getState().initializeBattleSets());
          get().markStoreInitialized(STORE_NAMES.BATTLE_SETS);

          console.log('Initializing booster variant store...');
          // Booster variant store doesn't need initialization - just mark as ready
          get().markStoreInitialized(STORE_NAMES.BOOSTER_VARIANT);

          console.log('Initializing data sync store...');
          await safeInitialize(() => useDataSyncStore.getState().syncAllData());
          get().markStoreInitialized(STORE_NAMES.DATA_SYNC);

          console.log('All stores initialized successfully');
          
        } catch (error) {
          console.error('Error during store initialization:', error);
          set({ initializationInProgress: false });
        }
      },

      resetInitialization: () => {
        set({
          storesInitialized: {},
          initializationInProgress: false,
          initializationComplete: false
        });
      }
    }),
    {
      name: 'app-init-storage',
      partialize: (state) => ({
        // Don't persist initialization state - always reinitialize on app start
        storesInitialized: {},
        initializationInProgress: false,
        initializationComplete: false
      })
    }
  )
);