import React from 'react';

interface PreviewButtonProps {
  onClick: () => void;
  className?: string;
}

// A small button that can be added to cards to trigger preview mode
const PreviewButton: React.FC<PreviewButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        onClick();
      }}
      className={`w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors ${className}`}
      aria-label="Preview card"
      title="Preview card"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
      </svg>
    </button>
  );
};

export default PreviewButton;