import fs from 'fs';

// Read the battlefield file
const filePath = 'client/src/game/components/Battlefield.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Function to replace zone materials with lineart (wireframe)
function updateMaterials() {
  // Pattern to match meshStandardMaterial for zones
  const colorPattern = /<meshStandardMaterial color="([^"]+)" (?:transparent opacity=\{[0-9.]+\} )?\/>/g;
  
  // Replace with wireframe materials
  content = content.replace(colorPattern, (match, color) => {
    return `<meshBasicMaterial color="${color}" wireframe={true} />`; 
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Zone materials updated to lineart (wireframe)!");
}

updateMaterials();
