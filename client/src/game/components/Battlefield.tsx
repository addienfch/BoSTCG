import { useRef, useEffect, useState } from 'react';
import { useCardGame } from '../stores/useCardGame';
import Card from './Card';
import { useAudio } from '@/lib/stores/useAudio';
import { toast } from 'sonner';
import { Group } from 'three';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

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
    playerDeck,
    playerGraveyard,
    playerHand,
    opponentActiveAvatar,
    opponentReserveAvatars,
    opponentFieldCards,
    opponentLifeCards,
    opponentEnergyPile,
    opponentDeck,
    opponentGraveyard,
    opponentHand,
    currentPlayer, 
    selectedCard,
    selectedTarget, 
    selectCard,
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
  
  // Define fixed zone positions for different card types - mobile optimized, square layout
  // Distance between player and opponent zones - even closer
  const zDistance = 1.0; // Very close for direct face-off
  
  // Player zones (red) - MUST BE AT BOTTOM
  const playerAvatarPosition: [number, number, number] = [0, 0, zDistance]; // Center front (bottom)
  const playerReserveZonePosition: [number, number, number] = [0, 0, zDistance * 2]; // Behind active avatar
  const playerEnergyZonePosition: [number, number, number] = [zDistance, 0, zDistance]; // Right of avatar
  const playerUsedEnergyZonePosition: [number, number, number] = [zDistance * 2, 0, zDistance]; // Far right
  const playerFieldZonePosition: [number, number, number] = [-zDistance, 0, zDistance]; // Left of avatar
  const playerLifeCardsPosition: [number, number, number] = [-zDistance * 2, 0, zDistance]; // Far left
  const playerDeckPosition: [number, number, number] = [-zDistance * 2, 0, zDistance * 2]; // Back left
  const playerGraveyardPosition: [number, number, number] = [zDistance * 2, 0, zDistance * 2]; // Back right
  const playerHandPosition: [number, number, number] = [0, 0, zDistance * 2.5]; // Bottom center, further back
  
  // Opponent zones (blue) - MUST BE AT TOP
  const opponentAvatarPosition: [number, number, number] = [0, 0, -zDistance]; // Center back (top)
  const opponentReserveZonePosition: [number, number, number] = [0, 0, -zDistance * 2]; // Behind active avatar
  const opponentEnergyZonePosition: [number, number, number] = [zDistance, 0, -zDistance]; // Right of avatar
  const opponentUsedEnergyZonePosition: [number, number, number] = [zDistance * 2, 0, -zDistance]; // Far right
  const opponentFieldZonePosition: [number, number, number] = [-zDistance, 0, -zDistance]; // Left of avatar
  const opponentLifeCardsPosition: [number, number, number] = [-zDistance * 2, 0, -zDistance]; // Far left
  const opponentDeckPosition: [number, number, number] = [-zDistance * 2, 0, -zDistance * 2]; // Back left
  const opponentGraveyardPosition: [number, number, number] = [zDistance * 2, 0, -zDistance * 2]; // Back right
  const opponentHandPosition: [number, number, number] = [0, 0, -zDistance * 2.5]; // Top center, further back
  
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
              <meshStandardMaterial color="#2a5480" />
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
      
      {/* Render player deck */}
      <group position={[playerDeckPosition[0], playerDeckPosition[1], playerDeckPosition[2]]}>
        {playerDeck.length > 0 && (
          <>
            {/* Stack of cards */}
            {[...Array(Math.min(5, playerDeck.length))].map((_, index) => (
              <mesh 
                key={`player-deck-${index}`}
                position={[index * 0.02, index * 0.03, 0]} 
                scale={[0.8, 1.2, 0.05]}
              >
                <boxGeometry />
                <meshStandardMaterial color="#802626" />
              </mesh>
            ))}
            <Text
              position={[0, 0.6, 0.5]}
              fontSize={0.3}
              color="white"
            >
              {playerDeck.length}
            </Text>
          </>
        )}
      </group>
      
      {/* Render opponent deck */}
      <group position={[opponentDeckPosition[0], opponentDeckPosition[1], opponentDeckPosition[2]]}>
        {opponentDeck.length > 0 && (
          <>
            {/* Stack of cards */}
            {[...Array(Math.min(5, opponentDeck.length))].map((_, index) => (
              <mesh 
                key={`opponent-deck-${index}`}
                position={[index * 0.02, index * 0.03, 0]} 
                scale={[0.8, 1.2, 0.05]}
              >
                <boxGeometry />
                <meshStandardMaterial color="#2a5480" />
              </mesh>
            ))}
            <Text
              position={[0, 0.6, 0.5]}
              fontSize={0.3}
              color="white"
            >
              {opponentDeck.length}
            </Text>
          </>
        )}
      </group>
      
      {/* Render player graveyard */}
      <group position={[playerGraveyardPosition[0], playerGraveyardPosition[1], playerGraveyardPosition[2]]}>
        {playerGraveyard.length > 0 && (
          <>
            {/* Top card face-up */}
            <mesh scale={[0.8, 1.2, 0.05]}>
              <boxGeometry />
              <meshStandardMaterial color="#8A6642" />
            </mesh>
            <Text
              position={[0, 0.6, 0.2]}
              fontSize={0.2}
              color="white"
            >
              {playerGraveyard.length}
            </Text>
          </>
        )}
      </group>
      
      {/* Render opponent graveyard */}
      <group position={[opponentGraveyardPosition[0], opponentGraveyardPosition[1], opponentGraveyardPosition[2]]}>
        {opponentGraveyard.length > 0 && (
          <>
            {/* Top card face-up */}
            <mesh scale={[0.8, 1.2, 0.05]}>
              <boxGeometry />
              <meshStandardMaterial color="#4A6682" />
            </mesh>
            <Text
              position={[0, 0.6, 0.2]}
              fontSize={0.2}
              color="white"
            >
              {opponentGraveyard.length}
            </Text>
          </>
        )}
      </group>
      
      {/* Render player hand */}
      <group position={[playerHandPosition[0], playerHandPosition[1], playerHandPosition[2]]}>
        {playerHand.length > 0 && (
          <>
            {/* Fan out cards in hand */}
            {playerHand.map((card, index) => {
              const totalCards = playerHand.length;
              const fanSpread = 5; // Total width of the fan
              const offset = (index - (totalCards - 1) / 2) * (fanSpread / Math.max(totalCards, 1));
              const cardRotation = offset * 0.1; // Small rotation for fan effect
              
              return (
                <Card
                  key={`player-hand-${card.id}`}
                  card={card}
                  position={[offset, 0, 0]}
                  rotation={[0, cardRotation, 0]}
                  scale={0.8}
                  isPlayable={currentPlayer === 'player' && (gamePhase === 'main1' || gamePhase === 'main2')}
                  isInHand={true}
                  onClick={() => selectCard(index)}
                />
              );
            })}
            
            {/* Hand indicator */}
            <mesh 
              position={[0, -0.1, -2]} 
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[6, 1.5]} />
              <meshStandardMaterial color="#802626" transparent opacity={0.3} />
            </mesh>
            <Text
              position={[0, -0.2, -2]}
              fontSize={0.2}
              color="white"
            >
              HAND
            </Text>
          </>
        )}
      </group>
      
      {/* Render opponent hand (face down) */}
      <group position={[opponentHandPosition[0], opponentHandPosition[1], opponentHandPosition[2]]}>
        {opponentHand.length > 0 && (
          <>
            {/* Fan out cards in hand (face down) */}
            {[...Array(opponentHand.length)].map((_, index) => {
              const totalCards = opponentHand.length;
              const fanSpread = 5; // Total width of the fan
              const offset = (index - (totalCards - 1) / 2) * (fanSpread / Math.max(totalCards, 1));
              const cardRotation = offset * 0.1; // Small rotation for fan effect
              
              return (
                <mesh 
                  key={`opponent-hand-${index}`}
                  position={[offset, 0, 0]} 
                  rotation={[0, Math.PI + cardRotation, 0]}
                  scale={[0.7, 1, 0.05]}
                >
                  <boxGeometry />
                  <meshStandardMaterial color="#2a5480" />
                </mesh>
              );
            })}
            
            {/* Hand indicator */}
            <mesh 
              position={[0, -0.1, 2]} 
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[6, 1.5]} />
              <meshStandardMaterial color="#2a5480" transparent opacity={0.3} />
            </mesh>
            <Text
              position={[0, -0.2, 2]}
              fontSize={0.2}
              color="white"
            >
              OPPONENT HAND: {opponentHand.length}
            </Text>
          </>
        )}
      </group>
      
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
      {/* PLAYER ZONES (RED) */}
      
      {/* Player Avatar Zone */}
      <mesh 
        position={[playerAvatarPosition[0], -0.04, playerAvatarPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
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
      
      {/* Player Reserve Zones */}
      <mesh 
        position={[playerReserveZonePosition[0], -0.04, playerReserveZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerReserveZonePosition[0], -0.03, playerReserveZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        RESERVE AVATARS
      </Text>
      
      {/* Player Energy Zone */}
      <mesh 
        position={[playerEnergyZonePosition[0], -0.04, playerEnergyZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerEnergyZonePosition[0], -0.03, playerEnergyZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ENERGY PILE
      </Text>
      
      {/* Player Used Energy Zone */}
      <mesh 
        position={[playerUsedEnergyZonePosition[0], -0.04, playerUsedEnergyZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerUsedEnergyZonePosition[0], -0.03, playerUsedEnergyZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        USED ENERGY
      </Text>
      
      {/* Player Field Zone */}
      <mesh 
        position={[playerFieldZonePosition[0], -0.04, playerFieldZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerFieldZonePosition[0], -0.03, playerFieldZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        FIELD CARD
      </Text>
      
      {/* Player Life Cards Zone */}
      <mesh 
        position={[playerLifeCardsPosition[0], -0.04, playerLifeCardsPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 2]} />
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
      
      {/* Player Deck Zone */}
      <mesh 
        position={[playerDeckPosition[0], -0.04, playerDeckPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerDeckPosition[0], -0.03, playerDeckPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        DECK
      </Text>
      
      {/* Player Graveyard Zone */}
      <mesh 
        position={[playerGraveyardPosition[0], -0.04, playerGraveyardPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#802626" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[playerGraveyardPosition[0], -0.03, playerGraveyardPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        GRAVEYARD
      </Text>
      
      {/* OPPONENT ZONES (BLUE) */}
      
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
      
      {/* Opponent Reserve Zones */}
      <mesh 
        position={[opponentReserveZonePosition[0], -0.04, opponentReserveZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentReserveZonePosition[0], -0.03, opponentReserveZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        RESERVE AVATARS
      </Text>
      
      {/* Opponent Energy Zone */}
      <mesh 
        position={[opponentEnergyZonePosition[0], -0.04, opponentEnergyZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentEnergyZonePosition[0], -0.03, opponentEnergyZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ENERGY PILE
      </Text>
      
      {/* Opponent Used Energy Zone */}
      <mesh 
        position={[opponentUsedEnergyZonePosition[0], -0.04, opponentUsedEnergyZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentUsedEnergyZonePosition[0], -0.03, opponentUsedEnergyZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        USED ENERGY
      </Text>
      
      {/* Opponent Field Zone */}
      <mesh 
        position={[opponentFieldZonePosition[0], -0.04, opponentFieldZonePosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentFieldZonePosition[0], -0.03, opponentFieldZonePosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        FIELD CARD
      </Text>
      
      {/* Opponent Life Cards Zone */}
      <mesh 
        position={[opponentLifeCardsPosition[0], -0.04, opponentLifeCardsPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
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
      
      {/* Opponent Deck Zone */}
      <mesh 
        position={[opponentDeckPosition[0], -0.04, opponentDeckPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentDeckPosition[0], -0.03, opponentDeckPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        DECK
      </Text>
      
      {/* Opponent Graveyard Zone */}
      <mesh 
        position={[opponentGraveyardPosition[0], -0.04, opponentGraveyardPosition[2]]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#2a5480" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[opponentGraveyardPosition[0], -0.03, opponentGraveyardPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        GRAVEYARD
      </Text>
    </group>
  );
};

export default Battlefield;
