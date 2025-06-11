'use client';
import React from 'react';
import { SparklesIcon, UploadIcon } from './IconComponents'; 

interface EvaluationControlsProps {
  evaluationPrompt: string;
  setEvaluationPrompt: (prompt: string) => void;
  onTriggerBatchEvaluation: () => void;
  onExportHTML: () => void;
  hasData: boolean;
  hasEvaluatedItems: boolean; 
  isEvaluatingAny: boolean;
}

const EvaluationControls: React.FC<EvaluationControlsProps> = ({
  evaluationPrompt,
  setEvaluationPrompt,
  onTriggerBatchEvaluation,
  onExportHTML,
  hasData,
  hasEvaluatedItems, 
  isEvaluatingAny,
}) => {
  const isEvaluateButtonActive = hasData && !isEvaluatingAny;
  const isExportButtonActive = hasData && hasEvaluatedItems && !isEvaluatingAny;

  return (
    <div className="mb-6 p-5 sm:p-6 bg-white rounded-xl shadow-xl transition-colors duration-300">
      <h2 className="text-xl font-bold mb-1 text-slate-800">Konfigurasi Evaluasi</h2>
      <p className="text-sm text-slate-500 mb-4">Atur kriteria evaluasi dan jalankan proses.</p>
      
      <div>
        <label htmlFor="evaluationPrompt" className="block text-sm font-medium text-slate-700 mb-1.5">
          Prompt Kriteria Evaluasi LLM:
        </label>
        <textarea
          id="evaluationPrompt"
          value={evaluationPrompt}
          onChange={(e) => setEvaluationPrompt(e.target.value)}
          rows={5} 
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-800 placeholder-slate-400 text-sm transition-colors duration-300"
          placeholder="Kriteria utama untuk 'Jawaban LLM yang Diberikan': Jawaban harus benar secara faktual..."
        />
      </div>
      <div className="mt-5 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onTriggerBatchEvaluation}
          disabled={!isEvaluateButtonActive}
          className={`sm:flex-none flex items-center justify-center px-5 py-2.5 font-medium rounded-md shadow-sm 
                     ${isEvaluateButtonActive 
                       ? 'bg-green-600 hover:bg-green-700 text-white' 
                       : 'bg-blue-600 hover:bg-blue-700 text-white' 
                     }
                     disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed 
                     transition-colors duration-150 ease-in-out`}
          aria-label="Mulai evaluasi pilihan"
        >
          <SparklesIcon className={`w-5 h-5 mr-2 ${isEvaluateButtonActive && !isEvaluatingAny ? 'text-white' : 'text-slate-500'}`} />
          {isEvaluatingAny ? 'Sedang Mengevaluasi...' : 'Mulai Evaluasi Pilihan'}
        </button>
        <button
          onClick={onExportHTML}
          disabled={!isExportButtonActive}
          className={`sm:flex-none flex items-center justify-center px-5 py-2.5 font-medium rounded-md shadow-sm 
                     ${isExportButtonActive
                       ? 'bg-blue-600 hover:bg-blue-700 text-white'
                       : 'bg-white border border-slate-300 text-slate-700' 
                     }
                     disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed 
                     transition-colors duration-150 ease-in-out`}
          aria-label="Ekspor hasil sebagai HTML"
        >
          <UploadIcon className={`w-5 h-5 mr-2 ${isExportButtonActive ? 'text-white' : 'text-slate-400'}`} />
          Ekspor Hasil sebagai HTML
        </button>
      </div>
    </div>
  );
};

export default EvaluationControls;
