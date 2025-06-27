import React, { useState, useEffect } from 'react';
import { validateCardImage } from '../lib/assetValidation';

interface SafeCardImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

const SafeCardImage: React.FC<SafeCardImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '' 
}) => {
  const [validatedSrc, setValidatedSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const validateImage = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const validSrc = await validateCardImage(src);
        
        if (!isCancelled) {
          setValidatedSrc(validSrc);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Image validation error:', err);
          setError(true);
          setLoading(false);
        }
      }
    };

    validateImage();

    return () => {
      isCancelled = true;
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center`}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${fallbackClassName} bg-gray-900 border-2 border-red-500 rounded-lg flex items-center justify-center`}>
        <div className="text-red-400 text-sm text-center">
          <div>Image Error</div>
          <div className="text-xs">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={validatedSrc} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default SafeCardImage;