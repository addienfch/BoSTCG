import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaWallet } from '../lib/solana/useSolanaWallet';
import { toast } from 'sonner';

// Require adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Custom wallet button styles to override default Solana adapter styles
import '../styles/wallet-button.css';

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
  const { 
    walletAddress, 
    connected, 
    connecting,
    disconnectWallet
  } = useSolanaWallet();

  // Create the base button style
  const baseStyle = "bg-gray-900 hover:bg-black text-white py-2 px-4 rounded-full font-medium transition-colors";
  const fullStyle = `${baseStyle} ${className}`;
  
  // Handler for wallet disconnect with toast
  const handleDisconnect = () => {
    disconnectWallet();
    toast.success('Wallet disconnected');
  };

  // If showing compact view with address
  if (connected && walletAddress && showAddress && mode !== 'icon') {
    return (
      <div className="flex items-center space-x-2">
        {mode === 'full' && (
          <div className="bg-gray-800 text-white text-xs rounded-full px-3 py-1">
            {`${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`}
          </div>
        )}
        <button 
          onClick={handleDisconnect}
          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-full flex items-center"
        >
          <span className="mr-1">🔌</span>
          Disconnect
        </button>
      </div>
    );
  }

  // Default view: use the Solana WalletMultiButton
  return (
    <WalletMultiButton className={fullStyle} />
  );
};

export default SolanaWalletButton;
