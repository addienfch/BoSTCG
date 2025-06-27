import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cardNftService, type WalletStatus } from '../../blockchain/solana/cardNftService';
import { Card } from '../data/cardTypes';

interface WalletStore {
  // Wallet state
  isConnected: boolean;
  walletAddress: string | null;
  balance: number;
  nftCards: Card[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastConnectionError: string | null;
  
  // Actions
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  refreshWalletData: () => Promise<void>;
  syncNftCards: () => Promise<void>;
  getWalletStatus: () => Promise<WalletStatus>;
  
  // Internal actions
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setWalletData: (data: { address: string; balance: number }) => void;
  setNftCards: (cards: Card[]) => void;
  setError: (error: string | null) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      walletAddress: null,
      balance: 0,
      nftCards: [],
      connectionStatus: 'disconnected',
      lastConnectionError: null,

      connectWallet: async () => {
        try {
          set({ connectionStatus: 'connecting', lastConnectionError: null });
          console.log('Attempting wallet connection...');
          
          const walletStatus = await cardNftService.connect();
          
          if (walletStatus.connected) {
            set({
              isConnected: true,
              walletAddress: walletStatus.address,
              balance: walletStatus.balance,
              connectionStatus: 'connected'
            });
            
            // Sync NFT cards after successful connection
            await get().syncNftCards();
            
            console.log(`Wallet connected: ${walletStatus.address}`);
            return true;
          } else {
            set({
              connectionStatus: 'error',
              lastConnectionError: 'Failed to connect wallet'
            });
            return false;
          }
        } catch (error) {
          console.error('Wallet connection error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
          set({
            connectionStatus: 'error',
            lastConnectionError: errorMessage
          });
          return false;
        }
      },

      disconnectWallet: async () => {
        try {
          await cardNftService.disconnect();
          
          set({
            isConnected: false,
            walletAddress: null,
            balance: 0,
            nftCards: [],
            connectionStatus: 'disconnected',
            lastConnectionError: null
          });
          
          console.log('Wallet disconnected');
        } catch (error) {
          console.error('Wallet disconnection error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown disconnection error';
          set({ lastConnectionError: errorMessage });
        }
      },

      refreshWalletData: async () => {
        try {
          if (!get().isConnected) {
            console.warn('Cannot refresh wallet data: wallet not connected');
            return;
          }

          const walletStatus = await cardNftService.getWalletStatus();
          
          if (walletStatus.connected) {
            set({
              walletAddress: walletStatus.address,
              balance: walletStatus.balance
            });
            
            // Also refresh NFT cards
            await get().syncNftCards();
            
            console.log('Wallet data refreshed');
          } else {
            // Wallet got disconnected
            await get().disconnectWallet();
          }
        } catch (error) {
          console.error('Error refreshing wallet data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to refresh wallet data';
          set({ lastConnectionError: errorMessage });
        }
      },

      syncNftCards: async () => {
        try {
          if (!get().isConnected) {
            console.warn('Cannot sync NFT cards: wallet not connected');
            return;
          }

          console.log('Syncing NFT cards from wallet...');
          const nftCards = await cardNftService.getOwnedCards();
          
          set({ nftCards });
          console.log(`Synced ${nftCards.length} NFT cards from wallet`);
          
        } catch (error) {
          console.error('Error syncing NFT cards:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to sync NFT cards';
          set({ lastConnectionError: errorMessage });
        }
      },

      getWalletStatus: async () => {
        try {
          return await cardNftService.getWalletStatus();
        } catch (error) {
          console.error('Error getting wallet status:', error);
          return {
            connected: false,
            address: null,
            balance: 0
          };
        }
      },

      // Internal actions
      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      setWalletData: (data) => {
        set({
          walletAddress: data.address,
          balance: data.balance,
          isConnected: true,
          connectionStatus: 'connected'
        });
      },

      setNftCards: (cards) => {
        set({ nftCards: cards });
      },

      setError: (error) => {
        set({ lastConnectionError: error });
      }
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        // Don't persist connection state - always check on app start
        isConnected: false,
        walletAddress: null,
        balance: 0,
        nftCards: [],
        connectionStatus: 'disconnected' as const,
        lastConnectionError: null
      })
    }
  )
);