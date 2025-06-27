import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ to = '/home', onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 bg-gray-800 bg-opacity-80 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
      title="Back to Home"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>
  );
};

export default BackButton;