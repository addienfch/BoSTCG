import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from "sonner";

// Style imports
import "./styles/global.css";

// Pages
import HomePage from './pages/HomePage.tsx';
import DeckBuilderPage from './pages/DeckBuilderPage';
import ShopPage from './pages/ShopPage';
import LibraryPage from './pages/LibraryPage';
import ArenaPage from './pages/ArenaPage';
import StartPage from './pages/StartPage';

// Game components
import GameBoard2D from "./game/components2D/GameBoard2D";
import { useGameMode } from "./game/stores/useGameMode";
import { useAudio } from "./lib/stores/useAudio";

// Solana Wallet
import { SolanaWalletProvider } from './lib/solana/SolanaWalletProvider';

// Navigation
import Navigation from './components/Navigation';

// Define control keys for the game
const controls = [
  { name: "select", keys: ["KeyX", "Space"] },
  { name: "confirm", keys: ["KeyZ", "Enter"] },
  { name: "nextPhase", keys: ["KeyC", "Tab"] }
];

// Sound loader component to preload game sounds
function SoundLoader() {
  const playHit = useAudio(state => state.playHit);
  const playButton = useAudio(state => state.playButton);
  
  useEffect(() => {
    // We'll only play sounds after user interaction to avoid autoplay issues
    const handleUserInteraction = () => {
      try {
        // Attempt to play sounds only after user interaction
        playHit();
        playButton();
        
        // Remove event listeners after successful play
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      } catch (e) {
        console.warn('Audio preload not available yet');
      }
    };
    
    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [playHit, playButton]);
  
  return null;
}

// Game component (requires React Router context)
const Game = () => {
  const { sfxEnabled, toggleSfx } = useAudio();
  const gameMode = useGameMode();
  const navigate = useNavigate();
  
  // Function to go back to game setup
  const handleBackToSetup = () => {
    gameMode.resetState();
    navigate('/');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full h-full max-w-4xl rounded-lg overflow-hidden shadow-2xl">
        <GameBoard2D onAction={(action, data) => console.log(action, data)} />
        
        {/* Back to menu button */}
        <button
          onClick={handleBackToSetup}
          className="absolute top-2 left-2 z-50 bg-gray-800 bg-opacity-70 text-white py-1 px-3 rounded text-sm"
        >
          Back to Menu
        </button>
      </div>
      
      {/* Sound controls */}
      <button 
        onClick={toggleSfx} 
        className="absolute top-2 right-2 z-50 p-2 bg-opacity-70 bg-gray-800 text-white rounded-full"
        style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {!sfxEnabled ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

// Layout component that conditionally renders Navigation
interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation: boolean;
}

const AppLayout = ({ children, showNavigation }: AppLayoutProps) => {
  // For debugging purposes
  console.log('AppLayout rendering, showNavigation:', showNavigation);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#DFE1DD' }}>
      <Toaster position="top-center" richColors />
      <SoundLoader />
      
      {/* Main content with padding for bottom navigation when needed */}
      <div style={{ 
        height: '100%', 
        overflow: 'auto',
        paddingBottom: showNavigation ? '70px' : '0',
        color: '#0D1A29'
      }}>
        {children}
      </div>
      
      {/* Always render Navigation when showNavigation is true */}
      {showNavigation ? <Navigation /> : null}
    </div>
  );
};

// Simplified protected route - temporarily disabled wallet authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // For now, just render children without authentication
  return <>{children}</>;
};

// A wrapper component that has access to navigate (must be inside Router context)
function App() {
  return (
    <SolanaWalletProvider>
      <Router>
        <SoundLoader />
        <Routes>
          <Route path="/startpage" element={<AppLayout showNavigation={false}><StartPage /></AppLayout>} />
          <Route path="/" element={<Navigate to="/startpage" replace />} />
          <Route path="/home" element={<ProtectedRoute><AppLayout showNavigation={true}><HomePage /></AppLayout></ProtectedRoute>} />
          <Route path="/deck-builder" element={<ProtectedRoute><AppLayout showNavigation={true}><DeckBuilderPage /></AppLayout></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><AppLayout showNavigation={true}><ShopPage /></AppLayout></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><AppLayout showNavigation={true}><LibraryPage /></AppLayout></ProtectedRoute>} />
          <Route path="/arena" element={<ProtectedRoute><AppLayout showNavigation={true}><ArenaPage /></AppLayout></ProtectedRoute>} />
          <Route path="/game" element={<ProtectedRoute><AppLayout showNavigation={false}><Game /></AppLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </SolanaWalletProvider>
  );
};

// Home route with navigation
const HomeRoute = () => {
  const navigate = useNavigate();
  return <HomePage />;
};

export default App;
