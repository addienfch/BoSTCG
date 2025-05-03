import fs from 'fs';

// Read the battlefield file
const filePath = 'client/src/game/components/Card.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Function to ensure cards are not lineart
function updateCardMaterials() {
  // Look for any wireframe material that might have been applied to cards and change it back
  const wireframePattern = /<meshBasicMaterial color="([^"]+)" wireframe={true} \/>/g;
  
  // Replace with standard materials (non-wireframe)
  content = content.replace(wireframePattern, (match, color) => {
    return `<meshStandardMaterial color="${color}" />`;
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Card materials restored to solid (non-wireframe)!");
}

updateCardMaterials();
