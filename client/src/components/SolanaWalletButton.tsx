import React from 'react';
import { toast } from 'sonner';

// Temporarily disabled Solana wallet functionality

interface SolanaWalletButtonProps {
  className?: string;
  mode?: 'full' | 'compact' | 'icon';
  showAddress?: boolean;
  customStyle?: 'default' | 'game';
  showBalance?: boolean;
}

const SolanaWalletButton: React.FC<SolanaWalletButtonProps> = ({ 
  className = '',
  mode = 'full',
  showAddress = true
}) => {
  // Temporarily disabled wallet functionality
  const connected = false;
  const connecting = false;

  // Create the base button style
  const baseStyle = "bg-gray-900 hover:bg-black text-white py-2 px-4 rounded-full font-medium transition-colors";
  const fullStyle = `${baseStyle} ${className}`;
  
  // Handler for wallet connection placeholder
  const handleConnect = () => {
    toast.info('Wallet functionality temporarily disabled');
  };

  return (
    <button 
      onClick={handleConnect}
      className={fullStyle}
      disabled={connecting}
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default SolanaWalletButton;
