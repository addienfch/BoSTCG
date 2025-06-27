/**
 * Asset validation utilities to prevent broken images and 3D models
 */

// Cache for validated assets to avoid repeated checks
const assetCache = new Map<string, boolean>();

/**
 * Validates if an asset exists before using it
 */
export const validateAssetPath = async (path: string): Promise<boolean> => {
  // Check cache first
  if (assetCache.has(path)) {
    return assetCache.get(path)!;
  }

  try {
    const response = await fetch(path, { 
      method: 'HEAD',
      cache: 'force-cache' // Use browser cache
    });
    
    const isValid = response.ok;
    assetCache.set(path, isValid);
    return isValid;
  } catch (error) {
    console.warn(`Asset validation failed for ${path}:`, error);
    assetCache.set(path, false);
    return false;
  }
};

/**
 * Validates card image with fallback
 */
export const validateCardImage = async (imagePath: string): Promise<string> => {
  const fullPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  const isValid = await validateAssetPath(fullPath);
  if (isValid) {
    return fullPath;
  }

  // Fallback to default card image
  const fallbackPath = '/images/cards/default-card.png';
  const fallbackValid = await validateAssetPath(fallbackPath);
  
  if (fallbackValid) {
    console.warn(`Using fallback image for ${imagePath}`);
    return fallbackPath;
  }

  // Ultimate fallback - generate SVG placeholder
  console.warn(`No valid image found for ${imagePath}, using SVG placeholder`);
  return generateCardPlaceholder();
};

/**
 * Validates texture path for 3D models
 */
export const validateTexture = async (texturePath: string): Promise<string | null> => {
  const fullPath = texturePath.startsWith('/textures/') ? texturePath : `/textures/${texturePath}`;
  
  const isValid = await validateAssetPath(fullPath);
  if (isValid) {
    return fullPath;
  }

  console.warn(`Texture not found: ${texturePath}`);
  return null; // Return null for missing textures - Three.js can handle this
};

/**
 * Generates a placeholder SVG for missing card images
 */
const generateCardPlaceholder = (): string => {
  const svg = `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="280" fill="#1a1a1a" stroke="#444" stroke-width="2" rx="12"/>
      <text x="100" y="140" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">
        Card Image
      </text>
      <text x="100" y="160" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">
        Not Found
      </text>
    </svg>
  `)}`;
  
  return svg;
};

/**
 * Preloads and validates critical assets
 */
export const preloadCriticalAssets = async (): Promise<void> => {
  const criticalAssets = [
    '/images/cards/default-card.png',
    '/textures/asphalt.png',
    '/images/ui/logo.png'
  ];

  const validationPromises = criticalAssets.map(async (asset) => {
    const isValid = await validateAssetPath(asset);
    if (!isValid) {
      console.warn(`Critical asset missing: ${asset}`);
    }
    return { asset, isValid };
  });

  const results = await Promise.all(validationPromises);
  const missingAssets = results.filter(r => !r.isValid);
  
  if (missingAssets.length > 0) {
    console.warn('Missing critical assets:', missingAssets.map(r => r.asset));
  }
};

/**
 * Batch validates multiple assets
 */
export const validateAssetBatch = async (paths: string[]): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};
  
  const validationPromises = paths.map(async (path) => {
    const isValid = await validateAssetPath(path);
    results[path] = isValid;
    return { path, isValid };
  });

  await Promise.all(validationPromises);
  return results;
};