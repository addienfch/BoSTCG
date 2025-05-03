import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useCardGame } from '../stores/useCardGame';

interface PlayerStatsProps {
  player: 'player' | 'opponent';
  position: [number, number, number];
}

const PlayerStats = ({ player, position }: PlayerStatsProps) => {
  const statsRef = useRef<THREE.Group>(null);
  const { 
    playerHealth, 
    opponentHealth, 
    mana, 
    maxMana, 
    opponentMana, 
    opponentMaxMana,
    currentPlayer
  } = useCardGame();
  
  // Get appropriate stats based on which player this is
  const health = player === 'player' ? playerHealth : opponentHealth;
  const currentMana = player === 'player' ? mana : opponentMana;
  const playerMaxMana = player === 'player' ? maxMana : opponentMaxMana;
  
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
      
      {/* Health display */}
      <group position={[-0.65, -0.1, 0.06]}>
        {/* Health icon */}
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
          {health}
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          HP
        </Text>
      </group>
      
      {/* Mana display */}
      <group position={[0.65, -0.1, 0.06]}>
        {/* Mana icon */}
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
          {`${currentMana}/${playerMaxMana}`}
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          MANA
        </Text>
      </group>
    </group>
  );
};

export default PlayerStats;
