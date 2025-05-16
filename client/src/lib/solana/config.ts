// Solana network configuration
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Default to devnet for development and testing
export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

// RPC endpoints
export const SOLANA_RPC_ENDPOINT = {
  mainnet: clusterApiUrl(WalletAdapterNetwork.Mainnet),
  devnet: clusterApiUrl(WalletAdapterNetwork.Devnet),
  testnet: clusterApiUrl(WalletAdapterNetwork.Testnet),
};

// Better RPC endpoints (for production use)
export const BETTER_RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
};

// Current RPC endpoint based on selected network
export const CURRENT_ENDPOINT = SOLANA_RPC_ENDPOINT[SOLANA_NETWORK];

// Game-specific Solana configuration
export const SOLANA_CONFIG = {
  // Program IDs for the Book of Spektrum TCG game
  PROGRAM_ID: {
    // These are placeholders - you'll need to deploy your actual programs
    CARD_PROGRAM: '7SSSuefH6pqMvC1GvXxnLM5v6qKLcy9RLLRejMwPw8Dc',
    MARKETPLACE_PROGRAM: '9RLLRejMwPw8Dc7SSSuefH6pqMvC1GvXxnLM5v6qKLcy',
    GAME_STATE_PROGRAM: 'MwPw8Dc7SSSuefH6pqMvC1GvXxnLM5v6qKLcy9RLLRej',
  },
  
  // Token mints for the game's currencies and assets
  TOKEN_MINTS: {
    GAME_TOKEN: 'GvXxnLM5v6qKLcy9RLLRejMwPw8Dc7SSSuefH6pqMvC1',
  },
  
  // Transaction confirmation settings
  TRANSACTION_SETTINGS: {
    maxRetries: 3,
    skipPreflight: false,
  },
};
