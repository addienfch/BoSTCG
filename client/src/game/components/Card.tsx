import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useAudio } from '@/lib/stores/useAudio';

// Define card types
export type CardType = 'creature' | 'spell';

// Card interface
export interface CardData {
  id: string;
  name: string;
  type: CardType;
  description: string;
  attack?: number;
  health?: number;
  effect?: string;
  cost: number;
  art: string; // We'll use this for card texture
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
  isTapped?: boolean; // For creatures that attacked this turn
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
  isTapped = false
}: CardProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
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
  
  // Hover effect - card rises slightly when hovered
  useEffect(() => {
    if (isInHand) {
      setTargetY(hovered ? position[1] + 0.3 : position[1]);
    }
  }, [hovered, position, isInHand]);
  
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
    
    // If card is being dragged, it should follow a different logic
    if (isDragging && meshRef.current) {
      // This is handled by the parent component through position prop
    }
  });
  
  // Color based on card type
  const cardColor = card.type === 'creature' ? '#2a6b42' : '#5b3089';
  const cardColorHover = card.type === 'creature' ? '#348253' : '#7340ab';
  
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
    if (onClick) {
      playHit();
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
      
      {/* Card stats for creatures */}
      {card.type === 'creature' && (
        <>
          {/* Attack */}
          <mesh position={[-width * 0.3, -height * 0.4, depth / 1.8 + 0.003]}>
            <circleGeometry args={[0.15 * scale, 32]} />
            <meshStandardMaterial color="#c92626" />
          </mesh>
          <Text
            position={[-width * 0.3, -height * 0.4, depth / 1.8 + 0.004]}
            fontSize={0.12 * scale}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {card.attack}
          </Text>
          
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
            {card.health}
          </Text>
        </>
      )}
      
      {/* Mana cost */}
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
        {card.cost}
      </Text>
    </group>
  );
};

export default Card;
