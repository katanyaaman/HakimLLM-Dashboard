'use client';
import React, { useEffect, useState } from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, message, onClose }) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    let frameId: number;
    if (isOpen) {
      frameId = requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
    } else {
      setIsAnimatingIn(false);
    }
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      setIsAnimatingIn(false); 
    };
  }, [isOpen]);

  if (!isOpen && !isAnimatingIn) { 
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
      hidden={!isOpen && !isAnimatingIn}
    >
      <div 
        className={`bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${
          isAnimatingIn && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 id="error-modal-title" className="text-xl sm:text-2xl font-semibold text-red-600 mb-4">
          Kesalahan Pemrosesan
        </h2>
        <p id="error-modal-description" className="text-slate-700 mb-6 text-sm sm:text-base">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
