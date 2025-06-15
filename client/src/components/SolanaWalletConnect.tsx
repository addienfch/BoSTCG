import React, { useState, useEffect } from 'react';
import { cardNftService, WalletStatus } from '../blockchain/solana/cardNftService';
import { toast } from 'sonner';

interface SolanaWalletConnectProps {
  onConnected?: () => void;
}

const SolanaWalletConnect: React.FC<SolanaWalletConnectProps> = ({ onConnected }) => {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    connected: false,
    address: null,
    balance: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  
  // Initialize and check wallet connection on component mount
  useEffect(() => {
    const checkWalletStatus = async () => {
      try {
        const status = await cardNftService.getWalletStatus();
        setWalletStatus(status);
      } catch (error) {
        console.error('Error checking wallet status:', error);
        // Set default disconnected state on error
        setWalletStatus({
          connected: false,
          address: null,
          balance: 0
        });
      }
    };
    
    // Wrap async call to prevent unhandled promise rejection
    checkWalletStatus().catch(error => {
      console.error('Failed to initialize wallet status:', error);
    });
  }, []);
  
  // Handle wallet connection
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const status = await cardNftService.connect();
      setWalletStatus(status);
      toast.success('Wallet connected successfully');
      if (onConnected) {
        onConnected();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
      // Reset wallet status on error
      setWalletStatus({
        connected: false,
        address: null,
        balance: 0
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle wallet disconnection
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await cardNftService.disconnect();
      setWalletStatus({
        connected: false,
        address: null,
        balance: 0
      });
      setShowCollection(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
      // Force reset wallet status even on error
      setWalletStatus({
        connected: false,
        address: null,
        balance: 0
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle showing NFT collection
  const handleViewCollection = async () => {
    setShowCollection(!showCollection);
    if (!showCollection) {
      try {
        const cards = await cardNftService.getOwnedCards();
        if (cards.length === 0) {
          toast.info('No NFT cards found in this wallet');
        }
      } catch (error) {
        console.error('Error fetching NFT cards:', error);
        toast.error('Failed to load NFT collection');
      }
    }
  };
  
  // Display wallet address in a truncated format
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-2">Solana Wallet</h2>
        <p className="text-gray-400 text-xs mb-3">Connect your Solana wallet to use your NFT cards in the game</p>
        
        {walletStatus.connected ? (
          <div className="flex flex-col gap-2">
            <div className="bg-gray-700 rounded p-2 text-sm text-white flex justify-between">
              <span>Address:</span> 
              <span className="font-mono">{formatAddress(walletStatus.address)}</span>
            </div>
            
            <div className="bg-gray-700 rounded p-2 text-sm text-white flex justify-between">
              <span>Balance:</span> 
              <span>{walletStatus.balance.toFixed(4)} SOL</span>
            </div>
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleViewCollection}
                className={`${showCollection ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white py-2 px-4 rounded flex-1`}
              >
                {showCollection ? 'Hide Collection' : 'View Collection'}
              </button>
              
              <button
                onClick={() => {
                  handleDisconnect().catch(error => {
                    console.error('Disconnect button error:', error);
                  });
                }}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              handleConnect().catch(error => {
                console.error('Connect button error:', error);
              });
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full disabled:opacity-50"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
      
      {/* NFT Collection Section */}
      {walletStatus.connected && showCollection && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="text-md font-semibold text-white mb-2">NFT Card Collection</h3>
          <div className="bg-gray-900 bg-opacity-50 rounded p-3 text-center">
            <p className="text-gray-300 text-sm mb-2">This is where your NFT cards will appear</p>
            <p className="text-gray-400 text-xs">You can use these cards in the game once connected</p>
          </div>
        </div>
      )}
      
      {/* Informational section */}
      <div className="mt-4 text-xs text-gray-400">
        <p>cNFTs on Solana allow you to own unique cards that you can use across different games and platforms.</p>
      </div>
    </div>
  );
};

export default SolanaWalletConnect;