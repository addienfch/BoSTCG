import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAudio } from '@/lib/stores/useAudio';
import { toast } from 'sonner';

// Define card types
export type CardType = 'avatar' | 'spell' | 'quickSpell' | 'ritualArmor' | 'field' | 'equipment' | 'item';
export type ElementType = 'fire' | 'water' | 'ground' | 'air' | 'neutral';
export type SubType = 'kobar' | 'borah' | 'kuhaka' | 'kujana';

// Card interface
export interface CardData {
  id: string;
  name: string;
  type: CardType;
  element?: ElementType;
  subType?: SubType;
  level?: 1 | 2;
  description: string;
  attack?: number;
  health?: number;
  skill1?: {
    name: string;
    energyCost: number;
    damage: number;
    effect?: string;
  };
  skill2?: {
    name: string;
    energyCost: number;
    damage: number;
    effect?: string;
  };
  energyCost?: number;
  effect?: string;
  art: string; // We'll use this for card texture
  
  // Counters for gameplay
  damageCounter?: number;
  bleedCounter?: number;
  shieldCounter?: number;
  
  // Animation state flags
  isBeingDrawn?: boolean; // Flag for draw card animation
}

interface CardProps {
  card: CardData;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isPlayable?: boolean;
  isInHand?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isTapped?: boolean; // For avatars and creatures that have used skills/attacked
  isBeingDrawn?: boolean; // For draw card animation
  drawAnimationDelay?: number; // Delay before draw animation starts
}

const Card = ({
  card,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  isPlayable = false,
  isInHand = false,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
  isTapped = false,
  isBeingDrawn = false,
  drawAnimationDelay = 0
}: CardProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { playHit } = useAudio();
  
  // Use wood texture for the card back
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Card dimensions
  const width = 1 * scale;
  const height = 1.4 * scale;
  const depth = 0.05 * scale;
  
  // Animation values
  const [targetY, setTargetY] = useState(position[1]);
  const [targetRotationX, setTargetRotationX] = useState(rotation[0]);
  const [targetRotationZ, setTargetRotationZ] = useState(rotation[2]);
  const [targetScale, setTargetScale] = useState(scale);
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Draw card animation
  useEffect(() => {
    if (isBeingDrawn && !animationStarted) {
      // Card starts offscreen and comes in with animation
      if (meshRef.current) {
        // Start position (off-screen)
        meshRef.current.position.set(position[0] - 5, position[1] + 3, position[2] - 2);
        meshRef.current.rotation.set(Math.PI / 2, 0, 0);
        meshRef.current.scale.set(0.5, 0.5, 0.5);
        
        // After delay, start animation
        setTimeout(() => {
          // Move to target position
          setTargetY(position[1]);
          setTargetRotationX(rotation[0]);
          setTargetScale(scale);
          
          // Play sound effect
          playHit();
        }, drawAnimationDelay);
        
        setAnimationStarted(true);
      }
    }
  }, [isBeingDrawn, animationStarted, position, rotation, scale, drawAnimationDelay, playHit]);
  
  // Hover effect - card rises slightly when hovered
  useEffect(() => {
    if (isInHand && !isBeingDrawn) {
      setTargetY(hovered ? position[1] + 0.3 : position[1]);
    }
  }, [hovered, position, isInHand, isBeingDrawn]);
  
  // When card is tapped (has attacked), rotate it
  useEffect(() => {
    setTargetRotationZ(isTapped ? Math.PI / 4 : rotation[2]);
  }, [isTapped, rotation]);
  
  // Card animation
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Smoothly interpolate position and rotation for animations
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y, 
      targetY, 
      0.1
    );
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x, 
      targetRotationX, 
      0.1
    );
    
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z, 
      targetRotationZ, 
      0.1
    );
    
    // Handle scale animation (for card draw)
    if (isBeingDrawn) {
      meshRef.current.scale.x = THREE.MathUtils.lerp(
        meshRef.current.scale.x, 
        targetScale, 
        0.05
      );
      
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y, 
        targetScale, 
        0.05
      );
      
      meshRef.current.scale.z = THREE.MathUtils.lerp(
        meshRef.current.scale.z, 
        targetScale, 
        0.05
      );
    }
    
    // If card is being dragged, it should follow a different logic
    if (isDragging && meshRef.current) {
      // This is handled by the parent component through position prop
    }
  });
  
  // Color based on element type for avatars or card type for actions
  let cardColor = '#5b3089'; // Default color for action cards
  let cardColorHover = '#7340ab';
  
  // Element-based colors for avatars
  if (card.type === 'avatar') {
    switch (card.element) {
      case 'fire':
        cardColor = '#c92626';
        cardColorHover = '#e83232';
        break;
      case 'water':
        cardColor = '#2671c9';
        cardColorHover = '#3285e8';
        break;
      case 'ground':
        cardColor = '#8c5e2a';
        cardColorHover = '#a6722f';
        break;
      case 'air':
        cardColor = '#26a4c9';
        cardColorHover = '#32c1e8';
        break;
      default:
        cardColor = '#6b6b6b'; // neutral color
        cardColorHover = '#848484';
    }
  } else {
    // Colors for action cards based on type
    switch (card.type) {
      case 'spell':
        cardColor = '#5b3089';
        cardColorHover = '#7340ab';
        break;
      case 'quickSpell':
        cardColor = '#892a80';
        cardColorHover = '#ab349e';
        break;
      case 'ritualArmor':
        cardColor = '#295c8a';
        cardColorHover = '#3273ad';
        break;
      case 'field':
        cardColor = '#2a8a53';
        cardColorHover = '#34ad67';
        break;
      case 'equipment':
        cardColor = '#8a892a';
        cardColorHover = '#adad34';
        break;
      case 'item':
        cardColor = '#8a5c2a';
        cardColorHover = '#ad7334';
        break;
    }
  }
  
  // Highlight color based on playability
  const borderColor = isPlayable ? '#f5d76a' : '#666666';
  
  const handlePointerDown = () => {
    if (isPlayable && onDragStart) {
      playHit();
      onDragStart();
    }
  };
  
  const handlePointerUp = () => {
    if (isPlayable && onDragEnd) {
      onDragEnd();
    }
  };
  
  const handleClick = () => {
    if (isPlayable && card.type === 'avatar' && isInHand) {
      // For avatar cards, toggle the popup menu instead of default action
      playHit();
      setShowPopup(!showPopup);
    } else if (onClick) {
      playHit();
      onClick();
    }
  };
  
  // Handle the avatar action selection from popup
  const handleAvatarAction = (action: 'active' | 'reserve' | 'energy') => {
    setShowPopup(false);
    
    // Notify the action was taken
    switch(action) {
      case 'active':
        toast.success(`${card.name} will be played as active avatar`);
        // This will be handled by the parent component via onClick
        break;
      case 'reserve':
        toast.success(`${card.name} will be played as reserve avatar`);
        // This will be handled by the parent component via onClick
        break;
      case 'energy':
        // Directly call setEnergyCard from the parent component
        if (onClick) {
          // We'll use a custom event to indicate this is an energy action
          const event = new CustomEvent('cardAction', { detail: { action: 'energy' } });
          document.dispatchEvent(event);
        }
        return; // Skip the default onClick
    }
    
    // Call the main click handler for other actions
    if (onClick) {
      onClick();
    }
  };

  return (
    <group
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={hovered ? cardColorHover : cardColor} 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Card border */}
      <mesh position={[0, 0, depth / 1.8 + 0.001]}>
        <planeGeometry args={[width * 0.95, height * 0.95]} />
        <meshStandardMaterial 
          color={borderColor} 
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      
      {/* Card art area */}
      <mesh position={[0, height * 0.15, depth / 1.8 + 0.002]}>
        <planeGeometry args={[width * 0.8, height * 0.5]} />
        <meshStandardMaterial 
          map={woodTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Card name */}
      <Text
        position={[0, height * 0.45, depth / 1.8 + 0.003]}
        fontSize={0.12 * scale}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.8}
      >
        {card.name}
      </Text>
      
      {/* Card description */}
      <Text
        position={[0, -height * 0.15, depth / 1.8 + 0.003]}
        fontSize={0.08 * scale}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.8}
      >
        {card.description.length > 40
          ? card.description.substring(0, 40) + '...'
          : card.description}
      </Text>
      
      {/* Avatar card stats */}
      {card.type === 'avatar' && (
        <>
          {/* First skill if exists */}
          {card.skill1 && (
            <>
              <mesh position={[-width * 0.3, -height * 0.3, depth / 1.8 + 0.003]}>
                <circleGeometry args={[0.15 * scale, 32]} />
                <meshStandardMaterial color="#c92626" />
              </mesh>
              <Text
                position={[-width * 0.3, -height * 0.3, depth / 1.8 + 0.004]}
                fontSize={0.1 * scale}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {card.skill1.damage}
              </Text>
            </>
          )}
          
          {/* Second skill if exists */}
          {card.skill2 && (
            <>
              <mesh position={[-width * 0.3, -height * 0.5, depth / 1.8 + 0.003]}>
                <circleGeometry args={[0.15 * scale, 32]} />
                <meshStandardMaterial color="#8c2676" />
              </mesh>
              <Text
                position={[-width * 0.3, -height * 0.5, depth / 1.8 + 0.004]}
                fontSize={0.1 * scale}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {card.skill2.damage}
              </Text>
            </>
          )}
          
          {/* Health */}
          <mesh position={[width * 0.3, -height * 0.4, depth / 1.8 + 0.003]}>
            <circleGeometry args={[0.15 * scale, 32]} />
            <meshStandardMaterial color="#3a8dcc" />
          </mesh>
          <Text
            position={[width * 0.3, -height * 0.4, depth / 1.8 + 0.004]}
            fontSize={0.12 * scale}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {card.health || 0}
          </Text>
          
          {/* Level */}
          <mesh position={[width * 0.3, height * 0.3, depth / 1.8 + 0.003]}>
            <circleGeometry args={[0.15 * scale, 32]} />
            <meshStandardMaterial color="#8c8c26" />
          </mesh>
          <Text
            position={[width * 0.3, height * 0.3, depth / 1.8 + 0.004]}
            fontSize={0.12 * scale}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {card.level || 1}
          </Text>
        </>
      )}
      
      {/* Action Card Energy Cost */}
      {card.type !== 'avatar' && (
        <>
          <mesh position={[width * 0.3, height * 0.45, depth / 1.8 + 0.003]}>
            <circleGeometry args={[0.15 * scale, 32]} />
            <meshStandardMaterial color="#3a70cc" />
          </mesh>
          <Text
            position={[width * 0.3, height * 0.45, depth / 1.8 + 0.004]}
            fontSize={0.12 * scale}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {card.energyCost || 0}
          </Text>
        </>
      )}
      
      {/* Popup menu for avatar cards */}
      {showPopup && isPlayable && card.type === 'avatar' && isInHand && (
        <Html position={[0, height * 0.7, depth / 1.8 + 0.01]} center>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            width: '200px',
            border: '2px solid #f5d76a',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center',
              fontSize: '16px'
            }}>
              {card.name}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button 
                onClick={() => handleAvatarAction('active')}
                style={{
                  backgroundColor: '#e83232',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Place as Active Avatar
              </button>
              <button 
                onClick={() => handleAvatarAction('reserve')}
                style={{
                  backgroundColor: '#3285e8',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Place as Reserve Avatar
              </button>
              <button 
                onClick={() => handleAvatarAction('energy')}
                style={{
                  backgroundColor: '#a6722f',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Use as Energy
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Card;
