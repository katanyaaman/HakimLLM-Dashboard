'use client';
import React, { useState, useEffect, useCallback } from 'react';

type EvaluationMode = 'all' | 'range' | 'specific';

interface BatchEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    mode: EvaluationMode,
    params?: { startNumStr?: string; endNumStr?: string; specificNumStrs?: string }
  ) => void;
  availableItemNumbers?: string[]; 
}

const BatchEvaluationModal: React.FC<BatchEvaluationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  availableItemNumbers 
}) => {
  const [mode, setMode] = useState<EvaluationMode>('all');
  const [startNumStr, setStartNumStr] = useState<string>('');
  const [endNumStr, setEndNumStr] = useState<string>('');
  const [specificNumStrs, setSpecificNumStrs] = useState<string>('');
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearErrorMessageOnChange = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  useEffect(() => {
    let frameId: number;
    if (isOpen) {
      setMode('all');
      setStartNumStr('');
      setEndNumStr('');
      setSpecificNumStrs('');
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

  const validateInputs = useCallback(() => {
    if (mode === 'range') {
      if (!startNumStr.trim() || !endNumStr.trim()) {
        return "Nomor awal dan akhir untuk rentang harus diisi.";
      }
      const start = parseInt(startNumStr, 10);
      const end = parseInt(endNumStr, 10);
      if (isNaN(start) || isNaN(end)) {
        return "Nomor awal dan akhir untuk rentang harus berupa angka.";
      }
      if (start <= 0 || end <= 0) {
          return "Nomor awal dan akhir rentang harus positif."
      }
      if (start > end) {
        return "Nomor awal tidak boleh lebih besar dari nomor akhir untuk rentang.";
      }

      if (availableItemNumbers && availableItemNumbers.length > 0) {
        const numericAvailableItems = availableItemNumbers
          .map(n => parseInt(n, 10))
          .filter(n => !isNaN(n) && n > 0)
          .sort((a, b) => a - b);

        if (numericAvailableItems.length === 0) {
          return "Tidak ada item dengan nomor numerik & positif yang valid ditemukan dalam data untuk validasi rentang.";
        }

        const minAvailableNumeric = numericAvailableItems[0];
        const maxAvailableNumeric = numericAvailableItems[numericAvailableItems.length - 1];

        if (end > maxAvailableNumeric) {
          return `Nomor akhir rentang (${end}) melebihi nomor item maksimum yang tersedia (${maxAvailableNumeric}). Harap masukkan maksimal ${maxAvailableNumeric}.`;
        }
        if (start < minAvailableNumeric) {
           return `Nomor awal rentang (${start}) lebih rendah dari nomor item minimum yang tersedia (${minAvailableNumeric}). Harap mulai dari minimal ${minAvailableNumeric}.`;
        }
        
        if (start > maxAvailableNumeric || end < minAvailableNumeric) {
            return `Rentang yang dimasukkan (${start}-${end}) tidak mencakup nomor item numerik yang tersedia (${minAvailableNumeric}-${maxAvailableNumeric}).`;
        }
      } else if (availableItemNumbers) { 
        return "Tidak ada nomor item yang tersedia untuk validasi rentang.";
      }
      
    } else if (mode === 'specific') {
      const trimmedSpecificNumStrs = specificNumStrs.trim();
      if (!trimmedSpecificNumStrs) {
        return "Daftar nomor spesifik harus diisi.";
      }
      const individualNumStrings = trimmedSpecificNumStrs.split(',');
      
      if (individualNumStrings.some(s => s.trim() === '')) {
        return "Format nomor spesifik tidak valid. Pastikan tidak ada koma ganda atau nomor kosong di antara koma.";
      }
      
      const validSpecificNums = individualNumStrings.map(s => s.trim()).filter(s => s !== '');

      if (validSpecificNums.length === 0) { 
        return "Masukkan setidaknya satu nomor spesifik yang valid.";
      }

      if (availableItemNumbers && availableItemNumbers.length > 0) {
        const availableSet = new Set(availableItemNumbers);
        const notFoundNumbers = validSpecificNums.filter(submittedNum => !availableSet.has(submittedNum));

        if (notFoundNumbers.length > 0) {
          if (notFoundNumbers.length === validSpecificNums.length) {
            return `Semua nomor item yang dimasukkan (${notFoundNumbers.join(', ')}) tidak ditemukan dalam data. Harap periksa kembali.`;
          }
          return `Nomor item berikut tidak ditemukan dalam data: ${notFoundNumbers.join(', ')}. Harap periksa kembali.`;
        }
      } else if (availableItemNumbers) { 
        return "Tidak ada nomor item yang tersedia untuk validasi nomor spesifik.";
      }
    }
    return null;
  }, [mode, startNumStr, endNumStr, specificNumStrs, availableItemNumbers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setErrorMessage(null);
    onSubmit(mode, { startNumStr, endNumStr, specificNumStrs });
  };
  
  const isSubmitDisabled = !!errorMessage || 
    (mode === 'range' && (!startNumStr.trim() || !endNumStr.trim())) ||
    (mode === 'specific' && !specificNumStrs.trim());


  if (!isOpen && !isAnimatingIn) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-eval-modal-title"
      hidden={!isOpen && !isAnimatingIn}
    >
      <div
        className={`bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${
          isAnimatingIn && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 id="batch-eval-modal-title" className="text-xl sm:text-2xl font-semibold text-sky-700 mb-6 text-center">
          Pilih Mode Evaluasi
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <label className="flex items-center p-3 border border-slate-300 rounded-md hover:bg-sky-50 transition-colors cursor-pointer has-[:checked]:bg-sky-100 has-[:checked]:border-sky-500">
              <input
                type="radio"
                name="evaluationMode"
                value="all"
                checked={mode === 'all'}
                onChange={() => { setMode('all'); clearErrorMessageOnChange(); }}
                className="h-4 w-4 text-sky-600 border-slate-400 focus:ring-sky-500"
              />
              <span className="ml-3 text-sm font-medium text-slate-700">Evaluasi Semua Item</span>
            </label>

            <label className="block p-3 border border-slate-300 rounded-md hover:bg-sky-50 transition-colors has-[:checked]:bg-sky-100 has-[:checked]:border-sky-500">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="evaluationMode"
                  value="range"
                  checked={mode === 'range'}
                  onChange={() => { setMode('range'); clearErrorMessageOnChange(); }}
                  className="h-4 w-4 text-sky-600 border-slate-400 focus:ring-sky-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">Evaluasi Rentang Nomor</span>
              </div>
              {mode === 'range' && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                  <div>
                    <label htmlFor="startNum" className="block text-sm font-medium text-slate-600 mb-1">
                      Dari Nomor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="startNum"
                      value={startNumStr}
                      onChange={(e) => { setStartNumStr(e.target.value); clearErrorMessageOnChange();}}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
                      placeholder="Cth: 1"
                      aria-label="Nomor awal untuk rentang evaluasi"
                    />
                  </div>
                  <div>
                    <label htmlFor="endNum" className="block text-sm font-medium text-slate-600 mb-1">
                      Sampai Nomor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="endNum"
                      value={endNumStr}
                      onChange={(e) => { setEndNumStr(e.target.value); clearErrorMessageOnChange(); }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
                      placeholder="Cth: 50"
                      aria-label="Nomor akhir untuk rentang evaluasi"
                    />
                  </div>
                </div>
              )}
            </label>

            <label className="block p-3 border border-slate-300 rounded-md hover:bg-sky-50 transition-colors has-[:checked]:bg-sky-100 has-[:checked]:border-sky-500">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="evaluationMode"
                  value="specific"
                  checked={mode === 'specific'}
                  onChange={() => { setMode('specific'); clearErrorMessageOnChange(); }}
                  className="h-4 w-4 text-sky-600 border-slate-400 focus:ring-sky-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">Evaluasi Nomor Tertentu</span>
              </div>
              {mode === 'specific' && (
                <div className="mt-2 pl-7">
                  <label htmlFor="specificNums" className="block text-sm font-medium text-slate-600 mb-1">
                    Nomor Item (pisahkan dengan koma) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="specificNums"
                    value={specificNumStrs}
                    onChange={(e) => { setSpecificNumStrs(e.target.value); clearErrorMessageOnChange(); }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
                    placeholder="Cth: 1, 5, 12, 23b"
                    aria-label="Nomor item spesifik, dipisahkan koma"
                  />
                </div>
              )}
            </label>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-600 mb-4 bg-red-50 p-2 rounded-md text-center" role="alert">{errorMessage}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out"
              aria-label="Batal dan tutup modal"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out disabled:bg-slate-400 disabled:cursor-not-allowed"
              aria-label="Mulai proses evaluasi berdasarkan pilihan"
            >
              Mulai Evaluasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchEvaluationModal;
