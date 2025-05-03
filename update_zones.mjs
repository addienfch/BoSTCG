import fs from 'fs';
import path from 'path';

// Read the battlefield file
const filePath = 'client/src/game/components/Battlefield.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace zone sizes (but not hand indicators which are part of the Hand component)
// Note: We're using specific context around each replacement to ensure we're targeting zones
const replacements = [
  // Player avatar zone
  { 
    from: '<planeGeometry args={[1.5, 1.5]} />\n        <meshStandardMaterial color="#e53935"', 
    to: '<planeGeometry args={[0.9, 0.9]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#e53935"' 
  },
  // Opponent avatar zone
  { 
    from: '<planeGeometry args={[1.5, 1.5]} />\n        <meshStandardMaterial color="#2196f3"', 
    to: '<planeGeometry args={[0.9, 0.9]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#2196f3"' 
  },
  // Player reserve zone
  { 
    from: '<planeGeometry args={[2, 1.5]} />\n        <meshStandardMaterial color="#802626"', 
    to: '<planeGeometry args={[1.4, 0.9]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#802626"' 
  },
  // Opponent reserve zone
  { 
    from: '<planeGeometry args={[2, 1.5]} />\n        <meshStandardMaterial color="#2a5480"', 
    to: '<planeGeometry args={[1.4, 0.9]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#2a5480"' 
  },
  // Player energy zone
  { 
    from: '<planeGeometry args={[1.2, 1.2]} />\n        <meshStandardMaterial color="#802626"', 
    to: '<planeGeometry args={[0.8, 0.8]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#802626"' 
  },
  // Opponent energy zone
  { 
    from: '<planeGeometry args={[1.2, 1.2]} />\n        <meshStandardMaterial color="#2a5480"', 
    to: '<planeGeometry args={[0.8, 0.8]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#2a5480"' 
  },
  // Player used energy zone
  { 
    from: '<planeGeometry args={[1.2, 1.2]} />\n        <meshStandardMaterial color="#802626" transparent opacity={0.4}', 
    to: '<planeGeometry args={[0.8, 0.8]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#802626" transparent opacity={0.4}' 
  },
  // Opponent used energy zone
  { 
    from: '<planeGeometry args={[1.2, 1.2]} />\n        <meshStandardMaterial color="#2a5480" transparent opacity={0.4}', 
    to: '<planeGeometry args={[0.8, 0.8]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#2a5480" transparent opacity={0.4}' 
  },
  // Player field zone
  { 
    from: '<planeGeometry args={[3, 1.5]} />\n        <meshStandardMaterial color="#802626"', 
    to: '<planeGeometry args={[2.0, 0.9]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#802626"' 
  },
  // Opponent field zone
  { 
    from: '<planeGeometry args={[3, 1.5]} />\n        <meshStandardMaterial color="#2a5480"', 
    to: '<planeGeometry args={[2.0, 0.9]} /> {/* Smaller zone */}\n        <meshStandardMaterial color="#2a5480"' 
  },
];

// Apply all replacements
replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');
console.log("Zone sizes have been updated!");
