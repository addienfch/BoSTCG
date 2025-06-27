import React, { useEffect } from 'react';
import { useWalletStore } from '../game/stores/useWalletStore';
import { toast } from 'sonner';

interface SolanaWalletConnectProps {
  onConnected?: () => void;
}

const SolanaWalletConnect: React.FC<SolanaWalletConnectProps> = ({ onConnected }) => {
  const {
    isConnected,
    walletAddress,
    balance,
    connectionStatus,
    lastConnectionError,
    connectWallet,
    disconnectWallet,
    refreshWalletData
  } = useWalletStore();

  // Check for connection status changes
  useEffect(() => {
    if (isConnected && onConnected) {
      onConnected();
    }
  }, [isConnected, onConnected]);

  // Show error toast when connection fails
  useEffect(() => {
    if (lastConnectionError && connectionStatus === 'error') {
      toast.error(`Wallet connection failed: ${lastConnectionError}`);
    }
  }, [lastConnectionError, connectionStatus]);

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      toast.success('Wallet connected successfully!');
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    toast.success('Wallet disconnected');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Solana Wallet</h3>
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'connecting' ? 'bg-yellow-500' :
          connectionStatus === 'error' ? 'bg-red-500' :
          'bg-gray-500'
        }`} />
      </div>

      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Connect your Solana wallet to manage your NFT cards
          </p>
          <button
            onClick={handleConnect}
            disabled={connectionStatus === 'connecting'}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              connectionStatus === 'connecting'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-spektrum-orange text-black hover:bg-orange-600'
            }`}
          >
            {connectionStatus === 'connecting' ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                Connecting...
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
          
          {lastConnectionError && (
            <p className="text-red-400 text-sm mt-2">
              {lastConnectionError}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Address:</span>
              <span className="font-mono text-sm">
                {walletAddress ? formatAddress(walletAddress) : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Balance:</span>
              <span className="font-semibold">
                {balance.toFixed(4)} SOL
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={refreshWalletData}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleDisconnect}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolanaWalletConnect;