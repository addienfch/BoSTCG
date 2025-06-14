import React from 'react';

// Simplified wallet provider for development without Solana dependencies
export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};