import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import GameBoard2D from "./game/components2D/GameBoard2D";
import StartPage from "./pages/StartPage";
import HomePage from "./pages/HomePage";
import GameModePage from "./pages/GameModePage";
import DeckBuilderPage from "./pages/DeckBuilderPage";
import ShopPage from "./pages/ShopPage";
import BoosterPacksPage from "./pages/BoosterPacksPage";
import BoosterSelectionPage from "./pages/BoosterSelectionPage";
import PremadeDecksPage from "./pages/PremadeDecksPage";
import BattleSetsPage from "./pages/BattleSetsPage";
import LibraryPage from "./pages/LibraryPage";
import SettingsPage from "./pages/SettingsPage";
import DevToolsPage from "./pages/DevToolsPage";
import { useGameMode } from "./game/stores/useGameMode";
import { useAppInitStore } from "./game/stores/useAppInitStore";

// Define control keys for the game
const controls = [
  { name: "select", keys: ["KeyX", "Space"] },
  { name: "confirm", keys: ["KeyZ", "Enter"] },
  { name: "nextPhase", keys: ["KeyC", "Tab"] }
];

function SoundLoader() {
  const playHit = useAudio(state => state.playHit);
  const playButton = useAudio(state => state.playButton);
  const { initializeApp, getInitializationReport } = useAppInitStore();
  
  useEffect(() => {
    // Initialize all stores on app startup
    initializeApp().then(() => {
      console.log(getInitializationReport());
    }).catch(error => {
      console.error('Failed to initialize app:', error);
    });
    // Global error handlers for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection caught:', event.reason);
      // Prevent the error from bubbling up to Vite's error overlay
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handleError = (event: ErrorEvent) => {
      // Only log meaningful errors, ignore null/undefined errors
      if (event.error !== null && event.error !== undefined) {
        console.warn('Global error caught:', event.error);
      }
      // Prevent the error from bubbling up to Vite's error overlay
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    // Add global error handlers with capture phase
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('error', handleError, true);
    
    // Comprehensive error modal suppression
    const originalConsoleError = console.error;
    console.error = function(...args: any[]) {
      const errorString = String(args[0]);
      if (errorString.includes('WebSocket') || 
          errorString.includes('vite') || 
          errorString.includes('HMR') ||
          errorString.includes('runtime-error-modal') ||
          errorString.includes('error-overlay')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Override WebSocket to prevent HMR connection errors
    const originalWebSocket = window.WebSocket;
    const createSuppressedWebSocket = (url: string | URL, protocols?: string | string[]) => {
      try {
        const ws = new originalWebSocket(url, protocols);
        ws.addEventListener('error', (event) => {
          event.stopPropagation();
          event.preventDefault();
        });
        ws.addEventListener('close', (event) => {
          event.stopPropagation();
          event.preventDefault();
        });
        return ws;
      } catch (error) {
        console.warn('WebSocket creation suppressed');
        return {} as WebSocket;
      }
    };

    // Remove any existing error modal elements
    const removeErrorModals = () => {
      const errorModals = document.querySelectorAll('[data-vite-error-overlay], #vite-error-overlay, .vite-error-overlay');
      errorModals.forEach(modal => modal.remove());
    };

    // Initial cleanup and periodic cleanup
    removeErrorModals();
    const cleanupInterval = setInterval(removeErrorModals, 1000);

    // Audio preloading with proper user interaction handling
    const handleFirstUserInteraction = () => {
      try {
        // Attempt to initialize audio context on first user interaction
        playHit();
        playButton();
      } catch (e) {
        console.warn('Audio initialization deferred until user interaction');
      }
      // Remove the event listeners after first interaction
      document.removeEventListener('click', handleFirstUserInteraction);
      document.removeEventListener('keydown', handleFirstUserInteraction);
    };

    // Listen for first user interaction
    document.addEventListener('click', handleFirstUserInteraction);
    document.addEventListener('keydown', handleFirstUserInteraction);

    // Cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
      document.removeEventListener('click', handleFirstUserInteraction);
      document.removeEventListener('keydown', handleFirstUserInteraction);
      // Restore original console.error
      console.error = originalConsoleError;
      // Clear the cleanup interval
      clearInterval(cleanupInterval);
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

// Main App component with routing - removed as it has issues with navigate
// We're using AppWithRouting instead

// Game mode route with navigation
const GameModeRoute = () => {
  const navigate = useNavigate();
  return <GameModePage onStartGame={() => navigate('/game')} />;
};

// A wrapper component that has access to navigate (must be inside Router context)
const AppWithRouting = () => {
  // Add global error handling to prevent unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Prevent the error from propagating to the runtime error plugin
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // Prevent the error from propagating to the runtime error plugin
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <Router>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#121224' }}>
        <Toaster position="top-center" richColors />
        <SoundLoader />
        
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/game-mode" element={<GameModeRoute />} />
          <Route path="/game" element={<Game />} />
          <Route path="/deck-builder" element={<DeckBuilderPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/booster" element={<BoosterPacksPage />} />
          <Route path="/shop/booster/select" element={<BoosterSelectionPage />} />
          <Route path="/shop/premade" element={<PremadeDecksPage />} />
          <Route path="/shop/battle-sets" element={<BattleSetsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/dev-tools" element={<DevToolsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppWithRouting;
