import { useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import Game2D from "./game/components2D/Game2D";
import "@fontsource/inter";
import { Toaster } from "sonner";

// Define control keys for the game
const controls = [
  { name: "select", keys: ["KeyX", "Space"] },
  { name: "confirm", keys: ["KeyZ", "Enter"] },
  { name: "nextPhase", keys: ["KeyC", "Tab"] }
];

function SoundLoader() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    setSuccessSound(success);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  return null;
}

// Main App component
function App() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Toaster position="top-center" richColors />
      
      <SoundLoader />
      
      {/* 2D Game Interface */}
      <div className="w-full h-full">
        <Game2D />
      </div>
      
      {/* Sound controls */}
      <button 
        onClick={toggleMute} 
        className="absolute top-2 right-2 z-50 p-2 bg-opacity-70 bg-gray-800 text-white rounded-full"
        style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

export default App;
