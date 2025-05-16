import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useSolanaWallet = () => {
  const { 
    wallet, 
    publicKey, 
    connecting, 
    connected, 
    disconnect, 
    select,
    connect 
  } = useWallet();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem('walletAddress')
  );
  
  // Update localStorage and state when wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toString();
      localStorage.setItem('walletAddress', address);
      setWalletAddress(address);
      toast.success('Wallet connected successfully!');
    } else if (!connecting && !connected && !localStorage.getItem('walletAddress')) {
      // Only clear if we're not connecting and there's no stored address
      setWalletAddress(null);
    }
  }, [connected, connecting, publicKey]);
  
  // Check if the wallet address in localStorage matches the connected one
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    
    // If we have a stored address but not connected, attempt to reconnect
    if (storedAddress && !connected && !connecting && wallet) {
      // Try to reconnect, but don't remove the stored address if it fails
      // This allows the user to still navigate the app even if reconnection fails
      connect().catch(error => {
        console.error('Failed to reconnect wallet:', error);
        // Don't remove the address - we'll use it for authentication still
        // localStorage.removeItem('walletAddress');
        // setWalletAddress(null);
      });
    }
  }, [wallet, connected, connecting, connect]);
  
  const connectWallet = async () => {
    if (wallet) {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    } else {
      toast.error('Please select a wallet first');
    }
  };
  
  const disconnectWallet = async () => {
    try {
      await disconnect();
      localStorage.removeItem('walletAddress');
      setWalletAddress(null);
      toast.info('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      // Even if disconnect fails, we'll still clear the local storage
      localStorage.removeItem('walletAddress');
      setWalletAddress(null);
      toast.info('Wallet disconnected (forced)');
    }
  };
  
  return {
    wallet,
    publicKey,
    walletAddress,
    connecting,
    connected,
    connectWallet,
    disconnectWallet,
    select
  };
};
