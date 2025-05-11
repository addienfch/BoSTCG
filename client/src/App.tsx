import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import GameBoard2D from "./game/components2D/GameBoard2D";
import GameModePage from "./pages/GameModePage";
import DeckBuilderPage from "./pages/DeckBuilderPage";
import ShopPage from "./pages/ShopPage";
import { useGameMode } from "./game/stores/useGameMode";

// Define control keys for the game
const controls = [
  { name: "select", keys: ["KeyX", "Space"] },
  { name: "confirm", keys: ["KeyZ", "Enter"] },
  { name: "nextPhase", keys: ["KeyC", "Tab"] }
];

function SoundLoader() {
  const playHit = useAudio(state => state.playHit);
  const playButton = useAudio(state => state.playButton);
  
  useEffect(() => {
    // Just preload sounds - we do this quietly now to avoid autoplay issues
    try {
      // Only preload if user has already interacted with page
      if (document.hasFocus()) {
        playHit();
        playButton();
      }
    } catch (e) {
      console.warn('Audio preload not available yet');
    }
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

// Main App component with routing - removed as it has issues with navigate
// We're using AppWithRouting instead

// A wrapper component that has access to navigate (must be inside Router context)
const AppWithRouting = () => {
  return (
    <Router>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#121224' }}>
        <Toaster position="top-center" richColors />
        <SoundLoader />
        
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/game" element={<Game />} />
          <Route path="/deck-builder" element={<DeckBuilderPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Home route with navigation
const HomeRoute = () => {
  const navigate = useNavigate();
  return <GameModePage onStartGame={() => navigate('/game')} />;
};

export default AppWithRouting;
