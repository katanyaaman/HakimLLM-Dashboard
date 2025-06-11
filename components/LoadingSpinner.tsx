
import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'w-8 h-8' }) => {
  return (
    <div className={`animate-spin rounded-full border-4 border-sky-500 border-t-transparent ${size}`} role="status">
      <span className="sr-only">Memuat...</span>
    </div>
  );
};

export default LoadingSpinner;
