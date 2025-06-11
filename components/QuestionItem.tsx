'use client';
import React from 'react';
import { EvaluatedQuestion, EvaluationStatus } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, PlayIcon } from './IconComponents';

interface QuestionItemProps {
  item: EvaluatedQuestion;
  onEvaluate: (id: string) => void;
  onAdoptSuggestion: (itemId: string, suggestedAnswer: string) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ item, onEvaluate, onAdoptSuggestion }) => {
  const getStatus = (): EvaluationStatus => {
    if (item.isEvaluating) return EvaluationStatus.Evaluating;
    if (item.evaluation?.error && item.evaluation.justification.includes("Tidak ada 'Jawaban LLM'")) return EvaluationStatus.Error; 
    if (item.evaluation?.error) return EvaluationStatus.Error;
    if (item.evaluation) return EvaluationStatus.Success;
    return EvaluationStatus.Pending;
  };

  const status = getStatus();
  const hasPreviousLlmAnswer = item.previousLlmAnswer && item.previousLlmAnswer.trim() !== "";

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-slate-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAdopt = () => {
    if (item.evaluation?.llmSuggestedAnswer) {
      onAdoptSuggestion(item.id, item.evaluation.llmSuggestedAnswer);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-lg mb-4 transition-all duration-300 ease-in-out hover:shadow-sky-400/20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3 gap-2">
        <div className="flex-grow">
          <span className="text-sm bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold mr-2">
            #{item.number}
          </span>
          <h3 className="text-lg font-semibold text-sky-700 inline mr-2">{item.title}</h3>
          {status === EvaluationStatus.Success && item.evaluation?.score !== undefined && (
            <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${getScoreColor(item.evaluation.score)} ${
                item.evaluation.score >= 0.8 ? 'bg-green-100' : item.evaluation.score >= 0.5 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              Skor: {item.evaluation.score.toFixed(2)}
            </span>
          )}
           {status === EvaluationStatus.Error && item.evaluation?.justification.includes("Tidak ada 'Jawaban LLM'") && (
             <span className="text-xs font-medium text-amber-600">(Jawaban LLM kosong)</span>
           )}
        </div>
        {status !== EvaluationStatus.Evaluating && (
          <button
            onClick={() => onEvaluate(item.id)}
            disabled={item.isEvaluating || !hasPreviousLlmAnswer}
            title={!hasPreviousLlmAnswer ? "Tidak ada 'Jawaban LLM' untuk dievaluasi pada item ini." : (item.evaluation ? 'Evaluasi Ulang Jawaban LLM' : 'Evaluasi Jawaban LLM')}
            className="flex items-center px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium rounded-md text-sm shadow-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap"
          >
            <SparklesIcon className="w-4 h-4 mr-1.5" />
            {item.evaluation && hasPreviousLlmAnswer ? 'Evaluasi Ulang' : 'Evaluasi'}
          </button>
        )}
      </div>

      {status === EvaluationStatus.Success && item.evaluation && (
        <div className="mb-3">
            <p className="text-sm font-medium text-slate-600 mb-1">Penilaian LLM (untuk Jawaban LLM Pengguna):</p>
            <div className={`flex items-center p-3 rounded-md text-sm ${
              item.evaluation.isAppropriate 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {item.evaluation.isAppropriate ? 
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" /> : 
                <XCircleIcon className="w-5 h-5 mr-2 text-red-500" />
              }
              <span className={item.evaluation.isAppropriate ? 'text-green-700' : 'text-red-700'}>
                {item.evaluation.isAppropriate ? 'Sesuai' : 'Tidak Sesuai'}
              </span>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
        <div className="md:col-span-1">
          <p className="font-medium text-slate-600 mb-1">Pertanyaan Lengkap:</p>
          <p className="text-slate-800 bg-slate-100 p-3 rounded-md whitespace-pre-wrap break-words max-h-48 overflow-y-auto">{item.questionText}</p>
        </div>
        
        <div className="md:col-span-1">
          <p className="font-medium text-slate-600 mb-1">Jawaban KB (Konteks):</p>
          <p className="text-slate-700 bg-slate-100/80 p-3 rounded-md whitespace-pre-wrap break-words italic max-h-48 overflow-y-auto">{item.kbAnswer}</p>
        </div>
        
        <div className="md:col-span-1">
          <p className="font-medium text-slate-600 mb-1">Jawaban LLM Pengguna (Dievaluasi):</p>
          {hasPreviousLlmAnswer ? (
              <p className="text-slate-800 bg-slate-100 p-3 rounded-md whitespace-pre-wrap break-words max-h-48 overflow-y-auto">{item.previousLlmAnswer}</p>
          ): (
              <p className="text-slate-500 bg-slate-100 p-3 rounded-md whitespace-pre-wrap italic max-h-48 overflow-y-auto">(Tidak ada jawaban LLM yang diberikan dalam file)</p>
          )}
        </div>
      </div>


      {status === EvaluationStatus.Evaluating && (
        <div className="flex items-center justify-center p-4 my-3 bg-slate-100 rounded-md">
          <LoadingSpinner size="w-6 h-6" />
          <span className="ml-2 text-slate-700">Mengevaluasi Jawaban LLM Pengguna...</span>
        </div>
      )}

      {status === EvaluationStatus.Error && item.evaluation?.error && !item.evaluation.justification.includes("Tidak ada 'Jawaban LLM'") && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700 font-semibold">Kesalahan Evaluasi:</p>
          <p className="text-sm text-red-600 whitespace-pre-wrap break-words">{item.evaluation.justification || item.evaluation.error}</p>
        </div>
      )}

      {status === EvaluationStatus.Success && item.evaluation && (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
           <h4 className="text-base font-semibold text-sky-600 mb-2">Detail Evaluasi untuk Jawaban LLM Pengguna:</h4>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Justifikasi Penilaian & Skor:</p>
            <p className="text-slate-700 bg-slate-100 p-3 rounded-md whitespace-pre-wrap break-words text-sm">{item.evaluation.justification}</p>
          </div>

          {item.evaluation.llmSuggestedAnswer && item.evaluation.isAppropriate === true && (
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-600 mb-1">Saran Jawaban dari HAKIM LLM:</p>
              <p className="text-slate-700 bg-sky-50 border border-sky-200 p-3 rounded-md whitespace-pre-wrap break-words text-sm">{item.evaluation.llmSuggestedAnswer}</p>
              <button
                onClick={handleAdopt}
                className="mt-2 flex items-center px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-xs shadow-sm transition-colors duration-150"
                title="Gunakan saran ini sebagai Jawaban LLM Pengguna dan hapus evaluasi saat ini"
              >
                <PlayIcon className="w-3.5 h-3.5 mr-1.5 transform rotate-0" />
                Gunakan Saran Ini
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
