import { useRef, useEffect, useState } from 'react';
import { useCardGame } from '../stores/useCardGame';
import Card from './Card';
import { useAudio } from '@/lib/stores/useAudio';
import { toast } from 'sonner';
import { Group } from 'three';
import { Text } from '@react-three/drei';

interface BattlefieldProps {
  position?: [number, number, number];
}

const Battlefield = ({ position = [0, 0, 0] }: BattlefieldProps) => {
  const battlefieldRef = useRef<Group>(null);
  const cardGame = useCardGame();
  const { 
    playerActiveAvatar,
    playerReserveAvatars, 
    playerFieldCards,
    playerLifeCards,
    playerEnergyPile,
    opponentActiveAvatar,
    opponentReserveAvatars,
    opponentFieldCards,
    opponentLifeCards,
    opponentEnergyPile,
    currentPlayer, 
    selectedCard,
    selectedTarget, 
    selectTarget,
    useAvatarSkill,
    gamePhase
  } = cardGame;
  const { playHit } = useAudio();
  
  // For highlighting possible attack targets
  const [attackTargets, setAttackTargets] = useState<string[]>([]);
  
  // Calculate field positions
  const calculateFieldPositions = (count: number, zOffset: number) => {
    const spacing = 1.5;
    const totalWidth = (count - 1) * spacing;
    const startX = -totalWidth / 2;
    
    return Array.from({ length: count }).map((_, index) => {
      return [startX + (index * spacing) + position[0], position[1], zOffset + position[2]] as [number, number, number];
    });
  };
  
  // Update attackable targets during battle phase
  useEffect(() => {
    if (currentPlayer === 'player' && gamePhase === 'battle' && playerActiveAvatar && !playerActiveAvatar.tapped) {
      // Can attack the opponent's active avatar
      if (opponentActiveAvatar) {
        setAttackTargets(['opponent-avatar']);
      } else {
        // Can't attack if opponent has no avatar
        setAttackTargets([]);
      }
    } else {
      setAttackTargets([]);
    }
  }, [currentPlayer, gamePhase, playerActiveAvatar, opponentActiveAvatar]);
  
  // Define zone positions for different card types
  // Player zones
  const playerAvatarPosition: [number, number, number] = [0, 0, 3]; // Center front
  const playerReserveZonePosition: [number, number, number] = [3, 0, 3]; // Right of avatar
  const playerEnergyZonePosition: [number, number, number] = [-3, 0, 3]; // Left of avatar
  const playerFieldZonePosition: [number, number, number] = [0, 0, 1.5]; // In front of avatar
  const playerLifeCardsPosition: [number, number, number] = [-4, 0, 2]; // Far left
  
  // Opponent zones
  const opponentAvatarPosition: [number, number, number] = [0, 0, -3]; // Center back
  const opponentReserveZonePosition: [number, number, number] = [3, 0, -3]; // Right of avatar
  const opponentEnergyZonePosition: [number, number, number] = [-3, 0, -3]; // Left of avatar  
  const opponentFieldZonePosition: [number, number, number] = [0, 0, -1.5]; // In front of avatar
  const opponentLifeCardsPosition: [number, number, number] = [-4, 0, -2]; // Far left
  
  // Calculate positions for field cards - now positioned in the field zone area
  const playerFieldPositions = playerFieldCards.length > 0
    ? playerFieldCards.map((_, index) => {
      const offset = (index - (playerFieldCards.length - 1) / 2) * 1.3;
      return [
        playerFieldZonePosition[0] + offset,
        playerFieldZonePosition[1],
        playerFieldZonePosition[2]
      ] as [number, number, number];
    })
    : [];
    
  const opponentFieldPositions = opponentFieldCards.length > 0
    ? opponentFieldCards.map((_, index) => {
      const offset = (index - (opponentFieldCards.length - 1) / 2) * 1.3;
      return [
        opponentFieldZonePosition[0] + offset,
        opponentFieldZonePosition[1],
        opponentFieldZonePosition[2]
      ] as [number, number, number];
    })
    : [];
  
  // Handle attacking opponent's avatar
  const handleAttackOpponentAvatar = () => {
    if (currentPlayer === 'player' && 
        gamePhase === 'battle' && 
        playerActiveAvatar && 
        !playerActiveAvatar.tapped && 
        opponentActiveAvatar) {
      
      // Use skill 1 for attacking (simplified battle system)
      if (playerActiveAvatar.skill1) {
        useAvatarSkill(1, 'opponent-avatar');
        playHit();
        toast.info(`${playerActiveAvatar.name} uses ${playerActiveAvatar.skill1.name} to attack!`);
      } else {
        toast.error('This avatar has no attack skill.');
      }
    }
  };
  
  // Handle selecting player's avatar for targetable actions
  const handlePlayerAvatarClick = () => {
    if (selectedCard !== null && (gamePhase === 'main1' || gamePhase === 'main2')) {
      selectTarget('player-avatar');
      playHit();
    }
  };
  
  // Calculate positions within zones
  const playerReservePositions = playerReserveAvatars.length > 0 
    ? playerReserveAvatars.map((_, index) => {
      return [
        playerReserveZonePosition[0] + (index * 0.3), 
        playerReserveZonePosition[1] + (index * 0.05), 
        playerReserveZonePosition[2]
      ] as [number, number, number];
    }) 
    : [];
    
  const opponentReservePositions = opponentReserveAvatars.length > 0
    ? opponentReserveAvatars.map((_, index) => {
      return [
        opponentReserveZonePosition[0] + (index * 0.3), 
        opponentReserveZonePosition[1] + (index * 0.05), 
        opponentReserveZonePosition[2]
      ] as [number, number, number];
    })
    : [];
  
  return (
    <group ref={battlefieldRef} position={[position[0], position[1], position[2]]}>
      {/* Render the player's active avatar */}
      {playerActiveAvatar && (
        <Card
          key={`player-avatar-${playerActiveAvatar.id}`}
          card={playerActiveAvatar}
          position={playerAvatarPosition}
          scale={1.2} // Make avatar slightly larger
          isPlayable={currentPlayer === 'player' && (gamePhase === 'main1' || gamePhase === 'main2')}
          isTapped={playerActiveAvatar.tapped}
          onClick={handlePlayerAvatarClick}
        />
      )}
      
      {/* Render the player's reserve avatars */}
      {playerReserveAvatars.map((card, index) => (
        <Card
          key={`player-reserve-${card.id}`}
          card={card}
          position={playerReservePositions[index] || [2, 0, 3]}
          scale={0.8} // Make reserves slightly smaller
          isPlayable={false} // Cannot directly activate
          onClick={() => toast.info(`Reserve avatar: ${card.name}`)}
        />
      ))}
      
      {/* Render the player's field cards */}
      {playerFieldCards.map((card, index) => (
        <Card
          key={`player-field-${card.id}`}
          card={card}
          position={playerFieldPositions[index] || [0, 0, 1.5]}
          scale={0.9}
          isPlayable={false} // Field cards are passive
          onClick={() => toast.info(`Field card: ${card.name}`)}
        />
      ))}
      
      {/* Render player's life cards as stacked cards */}
      {playerLifeCards.length > 0 && (
        <group position={[playerLifeCardsPosition[0], playerLifeCardsPosition[1], playerLifeCardsPosition[2]]}>
          {/* Render a stack of card backs */}
          {[...Array(playerLifeCards.length)].map((_, index) => (
            <mesh 
              key={`player-life-card-${index}`}
              position={[index * 0.05, index * 0.05, 0]} 
              scale={[0.7, 1, 0.05]}
            >
              <boxGeometry />
              <meshStandardMaterial color="#802626" />
            </mesh>
          ))}
          <Text
            position={[0, 0.5, 0.5]}
            fontSize={0.3}
            color="white"
          >
            {playerLifeCards.length}
          </Text>
        </group>
      )}
      
      {/* Render player's energy cards as stacked cards */}
      {playerEnergyPile.length > 0 && (
        <group position={[playerEnergyZonePosition[0], playerEnergyZonePosition[1], playerEnergyZonePosition[2]]}>
          {/* Render a stack of card backs */}
          {[...Array(Math.min(playerEnergyPile.length, 5))].map((_, index) => (
            <mesh 
              key={`player-energy-${index}`}
              position={[index * 0.05, index * 0.05, 0]} 
              scale={[0.7, 1, 0.05]}
            >
              <boxGeometry />
              <meshStandardMaterial color="#802a73" />
            </mesh>
          ))}
          <Text
            position={[0, 0.5, 0.5]}
            fontSize={0.3}
            color="white"
          >
            {playerEnergyPile.length}
          </Text>
        </group>
      )}
      
      {/* Render the opponent's active avatar */}
      {opponentActiveAvatar && (
        <Card
          key={`opponent-avatar-${opponentActiveAvatar.id}`}
          card={opponentActiveAvatar}
          position={opponentAvatarPosition}
          rotation={[0, Math.PI, 0]} // Flip cards to face the player
          scale={1.2} // Make avatar slightly larger
          isPlayable={attackTargets.includes('opponent-avatar')}
          isTapped={opponentActiveAvatar.tapped}
          onClick={handleAttackOpponentAvatar}
        />
      )}
      
      {/* Render the opponent's reserve avatars */}
      {opponentReserveAvatars.map((card, index) => (
        <Card
          key={`opponent-reserve-${card.id}`}
          card={card}
          position={opponentReservePositions[index] || [2, 0, -3]}
          rotation={[0, Math.PI, 0]} // Flip cards to face the player
          scale={0.8} // Make reserves slightly smaller
          isPlayable={false} // Cannot target reserves
          onClick={() => toast.info(`Opponent's reserve avatar: ${card.name}`)}
        />
      ))}
      
      {/* Render the opponent's field cards */}
      {opponentFieldCards.map((card, index) => (
        <Card
          key={`opponent-field-${card.id}`}
          card={card}
          position={opponentFieldPositions[index] || [0, 0, -1.5]}
          rotation={[0, Math.PI, 0]} // Flip cards to face the player
          scale={0.9}
          isPlayable={false} // Field cards cannot be targeted (for simplicity)
          onClick={() => toast.info(`Opponent's field card: ${card.name}`)}
        />
      ))}
      
      {/* Render opponent's life cards as stacked cards */}
      {opponentLifeCards.length > 0 && (
        <group position={[opponentLifeCardsPosition[0], opponentLifeCardsPosition[1], opponentLifeCardsPosition[2]]}>
          {/* Render a stack of card backs */}
          {[...Array(opponentLifeCards.length)].map((_, index) => (
            <mesh 
              key={`opponent-life-card-${index}`}
              position={[index * 0.05, index * 0.05, 0]} 
              scale={[0.7, 1, 0.05]}
            >
              <boxGeometry />
              <meshStandardMaterial color="#802626" />
            </mesh>
          ))}
          <Text
            position={[0, 0.5, 0.5]}
            fontSize={0.3}
            color="white"
          >
            {opponentLifeCards.length}
          </Text>
        </group>
      )}
      
      {/* Render opponent's energy cards as stacked cards */}
      {opponentEnergyPile.length > 0 && (
        <group position={[opponentEnergyZonePosition[0], opponentEnergyZonePosition[1], opponentEnergyZonePosition[2]]}>
          {/* Render a stack of card backs */}
          {[...Array(Math.min(opponentEnergyPile.length, 5))].map((_, index) => (
            <mesh 
              key={`opponent-energy-${index}`}
              position={[index * 0.05, index * 0.05, 0]} 
              scale={[0.7, 1, 0.05]}
            >
              <boxGeometry />
              <meshStandardMaterial color="#802a73" />
            </mesh>
          ))}
          <Text
            position={[0, 0.5, 0.5]}
            fontSize={0.3}
            color="white"
          >
            {opponentEnergyPile.length}
          </Text>
        </group>
      )}
      
      {/* Battlefield grid */}
      <mesh 
        position={[0, -0.05, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial 
          color="#1e415c"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Zone indicators with labels */}
      {/* Player Avatar Zone */}
      <mesh 
        position={[playerAvatarPosition[0], -0.04, playerAvatarPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerAvatarPosition[0], -0.03, playerAvatarPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ACTIVE AVATAR
      </Text>
      
      {/* Player Reserve Zone */}
      <mesh 
        position={[playerReserveZonePosition[0], -0.04, playerReserveZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#2a7d80" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerReserveZonePosition[0], -0.03, playerReserveZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        RESERVE
      </Text>
      
      {/* Player Energy Zone */}
      <mesh 
        position={[playerEnergyZonePosition[0], -0.04, playerEnergyZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#802a73" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerEnergyZonePosition[0], -0.03, playerEnergyZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ENERGY
      </Text>
      
      {/* Player Field Zone */}
      <mesh 
        position={[playerFieldZonePosition[0], -0.04, playerFieldZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[7, 1.5]} />
        <meshStandardMaterial color="#608026" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerFieldZonePosition[0], -0.03, playerFieldZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        FIELD CARDS
      </Text>
      
      {/* Player Life Cards Zone */}
      <mesh 
        position={[playerLifeCardsPosition[0], -0.04, playerLifeCardsPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerLifeCardsPosition[0], -0.03, playerLifeCardsPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        LIFE CARDS
      </Text>
      
      {/* Opponent Avatar Zone */}
      <mesh 
        position={[opponentAvatarPosition[0], -0.04, opponentAvatarPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentAvatarPosition[0], -0.03, opponentAvatarPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ACTIVE AVATAR
      </Text>
      
      {/* Opponent Reserve Zone */}
      <mesh 
        position={[opponentReserveZonePosition[0], -0.04, opponentReserveZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#2a7d80" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentReserveZonePosition[0], -0.03, opponentReserveZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        RESERVE
      </Text>
      
      {/* Opponent Energy Zone */}
      <mesh 
        position={[opponentEnergyZonePosition[0], -0.04, opponentEnergyZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#802a73" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentEnergyZonePosition[0], -0.03, opponentEnergyZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ENERGY
      </Text>
      
      {/* Opponent Field Zone */}
      <mesh 
        position={[opponentFieldZonePosition[0], -0.04, opponentFieldZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[7, 1.5]} />
        <meshStandardMaterial color="#608026" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentFieldZonePosition[0], -0.03, opponentFieldZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        FIELD CARDS
      </Text>
      
      {/* Opponent Life Cards Zone */}
      <mesh 
        position={[opponentLifeCardsPosition[0], -0.04, opponentLifeCardsPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentLifeCardsPosition[0], -0.03, opponentLifeCardsPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        LIFE CARDS
      </Text>
    </group>
  );
};

export default Battlefield;
