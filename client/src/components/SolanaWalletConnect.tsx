import React, { useState, useEffect } from 'react';
import { cardNftService, WalletStatus } from '../blockchain/solana/cardNftService';
import { toast } from 'sonner';

const SolanaWalletConnect: React.FC = () => {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    connected: false,
    address: null,
    balance: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize and check wallet connection on component mount
  useEffect(() => {
    const checkWalletStatus = async () => {
      try {
        const status = await cardNftService.getWalletStatus();
        setWalletStatus(status);
      } catch (error) {
        console.error('Error checking wallet status:', error);
      }
    };
    
    checkWalletStatus();
  }, []);
  
  // Handle wallet connection
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const status = await cardNftService.connect();
      setWalletStatus(status);
      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
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
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Display wallet address in a truncated format
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-2">Solana Wallet</h2>
        
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
            
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect Wallet'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full disabled:opacity-50"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
      
      {walletStatus.connected && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-white mb-2">NFT Card Collection</h3>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded text-sm"
            onClick={() => toast.info('NFT Collection will be displayed here')}
          >
            View Collection
          </button>
        </div>
      )}
    </div>
  );
};

export default SolanaWalletConnect;