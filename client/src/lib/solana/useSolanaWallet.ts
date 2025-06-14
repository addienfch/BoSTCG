import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Simplified wallet hook for development without Solana dependencies
export const useSolanaWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem('walletAddress')
  );
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  
  const connectWallet = async () => {
    setConnecting(true);
    try {
      // Simplified wallet connection for development
      const mockAddress = 'mock_wallet_address_123';
      localStorage.setItem('walletAddress', mockAddress);
      setWalletAddress(mockAddress);
      setConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      localStorage.removeItem('walletAddress');
      setWalletAddress(null);
      setConnected(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  return {
    walletAddress,
    connecting,
    connected,
    connectWallet,
    disconnectWallet
  };
};