import { useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import "@fontsource/inter";
import { Toaster } from "sonner";
import { CardData } from "./game/components/Card";
import SimpleGame2D from "./game/components2D/SimpleGame2D";

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

// Sample card data for testing
const sampleCards: CardData[] = [
  {
    id: "card1",
    name: "Fire Avatar",
    type: "avatar",
    element: "fire",
    level: 1,
    description: "A powerful fire avatar with strong attack skills",
    attack: 5,
    health: 7,
    skill1: {
      name: "Fire Blast",
      energyCost: 2,
      damage: 3,
      effect: "Deals 3 damage"
    },
    skill2: {
      name: "Fireball",
      energyCost: 3,
      damage: 5,
      effect: "Deals 5 damage"
    },
    art: "fire_avatar.jpg"
  },
  {
    id: "card2",
    name: "Water Sprite",
    type: "avatar",
    element: "water",
    level: 1,
    description: "A water-elemental being with healing abilities",
    attack: 3,
    health: 8,
    skill1: {
      name: "Water Jet",
      energyCost: 1,
      damage: 2,
      effect: "Deals 2 damage"
    },
    skill2: {
      name: "Healing Wave",
      energyCost: 2,
      damage: 0,
      effect: "Heals 3 health"
    },
    art: "water_avatar.jpg"
  },
  {
    id: "card3",
    name: "Fireball Spell",
    type: "spell",
    element: "fire",
    description: "Deals 4 damage to an enemy avatar",
    energyCost: 2,
    effect: "Deals 4 damage to target",
    art: "fireball.jpg"
  },
  {
    id: "card4",
    name: "Earth Guardian",
    type: "avatar",
    element: "ground",
    level: 1,
    description: "A strong defensive avatar with high health",
    attack: 2,
    health: 10,
    skill1: {
      name: "Rock Throw",
      energyCost: 1,
      damage: 2,
      effect: "Deals 2 damage"
    },
    skill2: {
      name: "Stone Shield",
      energyCost: 2,
      damage: 0,
      effect: "Adds 3 shield counters"
    },
    art: "earth_guardian.jpg"
  },
  {
    id: "card5",
    name: "Ritual Robe",
    type: "ritualArmor",
    element: "neutral",
    description: "Increases attached avatar's health by 3",
    energyCost: 1,
    effect: "+3 health to avatar",
    art: "ritual_robe.jpg"
  }
];

// Simple 2D App component for now
function App() {
  const { phase, start } = useGame();
  const { isMuted, toggleMute } = useAudio();
  
  // Start the game when the component mounts
  useEffect(() => {
    if (phase === "ready") {
      start();
    }
  }, [phase, start]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#121224' }}>
      <Toaster position="top-center" richColors />
      
      <SoundLoader />
      
      {/* Use our new SimpleGame2D component */}
      <SimpleGame2D playerCards={sampleCards} />
      
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
