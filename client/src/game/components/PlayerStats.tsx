import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useCardGame } from '../stores/useCardGame';
import { Group } from 'three';

interface PlayerStatsProps {
  player: 'player' | 'opponent';
  position: [number, number, number];
}

const PlayerStats = ({ player, position }: PlayerStatsProps) => {
  const statsRef = useRef<Group>(null);
  const { 
    playerLifeCards,
    opponentLifeCards,
    playerEnergyPile,
    opponentEnergyPile,
    playerDeck,
    opponentDeck,
    currentPlayer
  } = useCardGame();
  
  // Get appropriate stats based on which player this is
  const lifeCards = player === 'player' ? playerLifeCards : opponentLifeCards;
  const energyPile = player === 'player' ? playerEnergyPile : opponentEnergyPile;
  
  // Determine if this is the current active player
  const isActive = currentPlayer === player;
  
  // Colors
  const bgColor = isActive ? '#2a4778' : '#3a3a3a';
  
  return (
    <group ref={statsRef} position={position}>
      {/* Background panel */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial color={bgColor} />
      </mesh>
      
      {/* Player label */}
      <Text
        position={[0, 0.25, 0.06]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {player === 'player' ? 'You' : 'Opponent'}
      </Text>
      
      {/* Life Cards display */}
      <group position={[-0.65, -0.1, 0.06]}>
        {/* Life Cards icon */}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.18, 32]} />
          <meshStandardMaterial color="#c92626" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {lifeCards?.length || 0}
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          LIFE
        </Text>
      </group>
      
      {/* Energy display */}
      <group position={[0.65, -0.1, 0.06]}>
        {/* Energy icon */}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.18, 32]} />
          <meshStandardMaterial color="#3a70cc" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {energyPile?.length || 0}
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ENERGY
        </Text>
      </group>
    </group>
  );
};

export default PlayerStats;
