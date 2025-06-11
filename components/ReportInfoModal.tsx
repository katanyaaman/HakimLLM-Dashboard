'use client';
import React, { useState, useEffect } from 'react';

interface ReportInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testerName: string, projectName: string) => void;
}

const ReportInfoModal: React.FC<ReportInfoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [testerName, setTesterName] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let frameId: number;
    if (isOpen) {
      setTesterName('');
      setProjectName('');
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
    if (!testerName.trim() || !projectName.trim()) {
      setErrorMessage("Nama Tester dan Project tidak boleh kosong.");
      return;
    }
    setErrorMessage(null);
    onSubmit(testerName.trim(), projectName.trim());
  };

  if (!isOpen && !isAnimatingIn) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-info-modal-title"
      aria-describedby="report-info-modal-description"
      hidden={!isOpen && !isAnimatingIn}
    >
      <div
        className={`bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${
          isAnimatingIn && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 id="report-info-modal-title" className="text-xl sm:text-2xl font-semibold text-sky-700 mb-5 text-center">
          Informasi Laporan
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="testerName" className="block text-sm font-medium text-slate-700 mb-1">
              Nama Tester <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="testerName"
              value={testerName}
              onChange={(e) => setTesterName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Masukkan nama Anda"
              required
              aria-required="true"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 mb-1">
              Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Masukkan nama project"
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
              disabled={!testerName.trim() || !projectName.trim()}
              className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              Lanjutkan Ekspor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportInfoModal;
