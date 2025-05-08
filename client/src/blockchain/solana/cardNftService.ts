// This file provides integration with Solana's compressed NFTs (cNFTs) system
// It will be used to interact with NFT card data from the blockchain

import { CardData } from '../../game/components/Card';
import { Card } from '../../game/data/cardTypes';

// Interface for NFT metadata that matches our card structure
export interface CardNftMetadata {
  name: string;
  description: string;
  symbol: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

// Interface for wallet connection status
export interface WalletStatus {
  connected: boolean;
  address: string | null;
  balance: number;
}

// Interface for the card NFT service
export interface CardNftService {
  // Basic connection functions
  connect: () => Promise<WalletStatus>;
  disconnect: () => Promise<void>;
  getWalletStatus: () => Promise<WalletStatus>;
  
  // NFT Collection interaction
  getOwnedCards: () => Promise<Card[]>;
  getNftMetadata: (mint: string) => Promise<CardNftMetadata>;
  
  // Marketplace functions (to be implemented)
  buyCard: (mint: string, price: number) => Promise<boolean>;
  sellCard: (mint: string, price: number) => Promise<boolean>;
  
  // Card conversion functions
  convertNftToCard: (metadata: CardNftMetadata) => Card;
  convertCardToNftMetadata: (card: Card) => CardNftMetadata;
}

// Mock implementation for development until blockchain integration is ready
class MockCardNftService implements CardNftService {
  private walletStatus: WalletStatus = {
    connected: false,
    address: null,
    balance: 0
  };
  
  // Simulated NFT collection (for development)
  private mockNfts: { mint: string, metadata: CardNftMetadata }[] = [];
  
  constructor() {
    // Initialize with some mock data
    console.log('Initializing mock Solana cNFT service');
  }
  
  async connect(): Promise<WalletStatus> {
    // Simulate connection process
    console.log('Connecting to Solana wallet...');
    
    // Generate mock wallet address and balance
    this.walletStatus = {
      connected: true,
      address: 'mockSolanaAddress123456789',
      balance: 5.5
    };
    
    return this.walletStatus;
  }
  
  async disconnect(): Promise<void> {
    console.log('Disconnecting from Solana wallet');
    this.walletStatus = {
      connected: false,
      address: null,
      balance: 0
    };
  }
  
  async getWalletStatus(): Promise<WalletStatus> {
    return this.walletStatus;
  }
  
  async getOwnedCards(): Promise<Card[]> {
    if (!this.walletStatus.connected) {
      throw new Error('Wallet not connected');
    }
    
    // Return mock card collection
    return this.mockNfts.map(nft => this.convertNftToCard(nft.metadata));
  }
  
  async getNftMetadata(mint: string): Promise<CardNftMetadata> {
    const nft = this.mockNfts.find(n => n.mint === mint);
    if (!nft) {
      throw new Error(`NFT with mint ${mint} not found`);
    }
    
    return nft.metadata;
  }
  
  async buyCard(mint: string, price: number): Promise<boolean> {
    console.log(`Buying card with mint ${mint} for ${price} SOL`);
    return true;
  }
  
  async sellCard(mint: string, price: number): Promise<boolean> {
    console.log(`Selling card with mint ${mint} for ${price} SOL`);
    return true;
  }
  
  convertNftToCard(metadata: CardNftMetadata): Card {
    // Extract card attributes from NFT metadata
    const getAttributeValue = (traitType: string) => {
      const attr = metadata.attributes.find(a => a.trait_type === traitType);
      return attr ? attr.value : null;
    };
    
    // Build card object from metadata
    return {
      id: `nft-${Math.random().toString(36).substring(2, 10)}`,
      name: metadata.name,
      type: getAttributeValue('type') as any || 'avatar',
      element: getAttributeValue('element') as any || 'fire',
      level: getAttributeValue('level') as any || 1,
      subType: getAttributeValue('subType') as any,
      health: Number(getAttributeValue('health')) || 5,
      description: metadata.description,
      art: metadata.image,
      energyCost: getAttributeValue('energyCost') ? (getAttributeValue('energyCost') as string).split(',') as any[] : []
    } as Card;
  }
  
  convertCardToNftMetadata(card: Card): CardNftMetadata {
    // Build NFT metadata from card object
    const attributes = [
      { trait_type: 'type', value: card.type },
      { trait_type: 'element', value: card.element }
    ];
    
    if ('level' in card) {
      attributes.push({ trait_type: 'level', value: card.level });
    }
    
    if ('subType' in card) {
      attributes.push({ trait_type: 'subType', value: card.subType });
    }
    
    if ('health' in card) {
      attributes.push({ trait_type: 'health', value: card.health });
    }
    
    if (card.energyCost) {
      attributes.push({ 
        trait_type: 'energyCost', 
        value: Array.isArray(card.energyCost) ? card.energyCost.join(',') : card.energyCost 
      });
    }
    
    return {
      name: card.name,
      description: card.description || '',
      symbol: 'TCGNFT',
      image: card.art,
      attributes
    };
  }
}

// Export singleton instance
export const cardNftService = new MockCardNftService();

// Note: To implement the actual Solana cNFT integration, 
// you would need to replace this mock implementation with real Solana
// Web3.js and Metaplex SDK interactions.