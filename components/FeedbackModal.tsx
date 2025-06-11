'use client';
import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon } from './IconComponents';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string, message: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let frameId: number;
    if (isOpen) {
      setName('');
      setEmail('');
      setMessage('');
      setErrorMessage(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Semua field (Nama, Email, dan Masukan) tidak boleh kosong.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        setErrorMessage("Format email tidak valid.");
        return;
    }
    setErrorMessage(null);
    onSubmit(name.trim(), email.trim(), message.trim());
  };

  if (!isOpen && !isAnimatingIn) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      hidden={!isOpen && !isAnimatingIn}
    >
      <div
        className={`bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${
          isAnimatingIn && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 id="feedback-modal-title" className="text-xl sm:text-2xl font-semibold text-sky-700 mb-5 text-center">
          Beri Masukan
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="feedbackName" className="block text-sm font-medium text-slate-700 mb-1">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="feedbackName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Nama Anda"
              required
              aria-required="true"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="feedbackEmail" className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="feedbackEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Email Anda"
              required
              aria-required="true"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="feedbackMessage" className="block text-sm font-medium text-slate-700 mb-1">
              Kolom Masukan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedbackMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Tulis masukan Anda di sini..."
              required
              aria-required="true"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-600 mb-4 bg-red-50 p-2 rounded-md text-center">{errorMessage}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim() || !message.trim()}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Kirim Masukan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
