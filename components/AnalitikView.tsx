
'use client';
import React, { useMemo } from 'react';
import { EvaluatedQuestion, AnalyticsData } from '@/types';
import { 
    ChartBarIcon, 
    ClockIcon, 
    CalendarDaysIcon, 
    TableCellsIcon, 
    ArrowTrendingDownIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    ExclamationTriangleIcon, 
    QuestionMarkCircleIcon 
} from '@/components/IconComponents'; // Ensure path alias is correct

// Helper function (if it was part of original AnalitikView logic)
const calculateAverage = (arr: number[]): number => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

interface AnalitikViewProps {
  questionsData: EvaluatedQuestion[];
  historicalSnapshot: AnalyticsData | null;
  onSwitchToLiveAnalytics: () => void;
}

export const AnalitikView: React.FC<AnalitikViewProps> = ({ questionsData, historicalSnapshot, onSwitchToLiveAnalytics }) => {
  
  const analyticsData = useMemo((): AnalyticsData | null => {
    if (historicalSnapshot) return historicalSnapshot;
    if (!questionsData || questionsData.length === 0) return null;

    const evaluatedItems = questionsData.filter(q => q.evaluation);
    if (evaluatedItems.length === 0) {
        // Return a structure indicating no evaluated items if needed by UI
        return {
            totalItems: questionsData.length,
            evaluatedItemCount: 0,
            averageScore: 0,
            scoreInterpretation: "Belum ada item yang dievaluasi.",
            proporsi: { sesuai: 0, tidakSesuai: 0, errorLlmAktual: 0 },
            kinerjaPerTopik: [],
            itemSkorTerendah: [],
            scoreDistribution: { bins: [], maxCount: 0 },
            unprocessedSummary: { 
                belumDievaluasiSamaSekali: questionsData.length, 
                llmAnswerKosong: questionsData.filter(q => !q.previousLlmAnswer || q.previousLlmAnswer.trim() === "").length 
            },
            averageTextLengths: { pertanyaan: "0", jawabanKb: "0", jawabanLlm: "0" },
            topikBermasalah: [],
        };
    }

    const scores = evaluatedItems.map(q => q.evaluation?.score).filter(s => typeof s === 'number') as number[];
    const averageScore = calculateAverage(scores);
    
    // This is a simplified calculation logic. 
    // A full implementation would involve more detailed calculations similar to the original App.tsx.
    // For now, focusing on providing a working component structure.
    const PlaceholderAnalytics: AnalyticsData = {
      totalItems: questionsData.length,
      evaluatedItemCount: evaluatedItems.length,
      averageScore: averageScore,
      scoreInterpretation: averageScore >= 0.8 ? "Sangat Baik" : averageScore >= 0.5 ? "Cukup Baik" : "Perlu Peningkatan Signifikan",
      proporsi: {
        sesuai: evaluatedItems.filter(q => q.evaluation?.isAppropriate === true).length,
        tidakSesuai: evaluatedItems.filter(q => q.evaluation?.isAppropriate === false).length,
        errorLlmAktual: evaluatedItems.filter(q => q.evaluation?.error && q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "" && !q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'")).length,
      },
      kinerjaPerTopik: [], // Placeholder for detailed topic performance
      itemSkorTerendah: [], // Placeholder for lowest scored items
      scoreDistribution: { // Basic score distribution
        bins: [
          { label: "0-0.4", min:0, max:0.4, count: scores.filter(s => s <= 0.4).length, color: "bg-red-500"},
          { label: "0.5-0.7",min:0.5, max:0.7, count: scores.filter(s => s > 0.4 && s <= 0.7).length, color: "bg-yellow-500"},
          { label: "0.8-1.0",min:0.8, max:1.0, count: scores.filter(s => s > 0.7).length, color: "bg-green-500"},
        ],
        maxCount: Math.max(
            scores.filter(s => s <= 0.4).length, 
            scores.filter(s => s > 0.4 && s <= 0.7).length,
            scores.filter(s => s > 0.7).length
        ) || 1, // Avoid division by zero if all counts are 0
      },
      unprocessedSummary: {
        belumDievaluasiSamaSekali: questionsData.length - evaluatedItems.length,
        llmAnswerKosong: questionsData.filter(q => q.evaluation?.error && q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'")).length,
      },
      averageTextLengths: { // Simplified
        pertanyaan: (calculateAverage(questionsData.map(q => q.questionText.length))).toFixed(0),
        jawabanKb: (calculateAverage(questionsData.map(q => q.kbAnswer.length))).toFixed(0),
        jawabanLlm: (calculateAverage(questionsData.map(q => (q.previousLlmAnswer || "").length).filter(l => l > 0))).toFixed(0),
      },
      topikBermasalah: [], // Placeholder
    };
    return PlaceholderAnalytics;
  }, [questionsData, historicalSnapshot]);

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <div className="text-center py-10">
          <ChartBarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">Data Analitik Tidak Tersedia</p>
          <p className="text-slate-500">Unggah file dan lakukan evaluasi untuk melihat analitik data.</p>
        </div>
      </div>
    );
  }
  
  const { 
    totalItems, evaluatedItemCount, averageScore, scoreInterpretation, 
    proporsi, scoreDistribution, unprocessedSummary, averageTextLengths 
  } = analyticsData;

  const getProgressBarColor = (score?: number) => {
    if (score === undefined || score === null || isNaN(score)) return 'bg-slate-300';
    if (score >= 0.8) return 'bg-sky-500';
    if (score >= 0.5) return 'bg-sky-400';
    return 'bg-sky-300';
  };

  const scoreValueForDisplay = (averageScore * 100).toFixed(0);

  return (
    <div className="bg-white rounded-xl shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2">
            <h2 className="text-xl font-bold text-sky-700 flex items-center">
                <ChartBarIcon className="w-7 h-7 mr-3" />
                {historicalSnapshot ? "Snapshot Analitik Historis" : "Analitik Data Saat Ini"}
            </h2>
            {historicalSnapshot && (
                <button 
                    onClick={onSwitchToLiveAnalytics}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium hover:underline px-3 py-1.5 rounded-md hover:bg-sky-50 transition-colors"
                >
                    Beralih ke Analitik Data Saat Ini
                </button>
            )}
        </div>
        <div className="p-4 sm:p-6 space-y-6">
            {/* Overall Score */}
            <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                        <ClockIcon className="w-4 h-4 mr-2" /> SKOR KUALITAS KESELURUHAN
                    </div>
                    <p className="text-4xl font-bold text-sky-600">{scoreValueForDisplay}%</p>
                    <div className="mt-2 h-2.5 w-full bg-slate-200 rounded-full">
                        <div 
                            className={`h-2.5 rounded-full ${getProgressBarColor(averageScore)}`}
                            style={{ width: `${scoreValueForDisplay}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Interpretasi: {scoreInterpretation}</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <div className="flex items-center text-sm font-medium text-slate-500 mb-2">
                        <CalendarDaysIcon className="w-4 h-4 mr-2" /> TOTAL EVALUASI
                    </div>
                    <p className="text-4xl font-bold text-slate-700">{evaluatedItemCount}</p>
                    <p className="text-xs text-slate-500 mt-1">{totalItems} total item dalam dataset.</p>
                </div>
            </div>

            {/* Proportions and Unprocessed */}
             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> PROPORSI HASIL EVALUASI
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span>Sesuai:</span> <span className="font-medium text-green-600">{proporsi.sesuai}</span></div>
                        <div className="flex justify-between"><span>Tidak Sesuai:</span> <span className="font-medium text-red-600">{proporsi.tidakSesuai}</span></div>
                        <div className="flex justify-between"><span>Error Aktual LLM:</span> <span className="font-medium text-yellow-600">{proporsi.errorLlmAktual}</span></div>
                    </div>
                </div>
                 <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
                        <QuestionMarkCircleIcon className="w-4 h-4 mr-2 text-slate-500" /> STATUS PEMROSESAN
                    </div>
                     <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span>Belum Dievaluasi:</span> <span className="font-medium">{unprocessedSummary.belumDievaluasiSamaSekali}</span></div>
                        <div className="flex justify-between"><span>Jawaban LLM Kosong:</span> <span className="font-medium">{unprocessedSummary.llmAnswerKosong}</span></div>
                    </div>
                </div>
            </div>
            
            {/* Score Distribution and Text Lengths */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
                        <ChartBarIcon className="w-4 h-4 mr-2" /> DISTRIBUSI SKOR
                    </div>
                    <div className="space-y-1">
                        {scoreDistribution.bins.map((bin, idx) => (
                            <div key={idx} className="flex items-center text-xs">
                                <span className="w-16 text-slate-600">{bin.label}</span>
                                <div className="flex-1 h-4 bg-slate-200 rounded-sm mr-2">
                                    <div 
                                        className={`h-4 rounded-sm ${bin.color}`}
                                        style={{ width: `${scoreDistribution.maxCount > 0 ? (bin.count / scoreDistribution.maxCount) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span className="w-8 text-right font-medium">{bin.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                     <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
                        <TableCellsIcon className="w-4 h-4 mr-2" /> RATA-RATA PANJANG TEKS (KARAKTER)
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span>Pertanyaan:</span> <span className="font-medium">{averageTextLengths.pertanyaan}</span></div>
                        <div className="flex justify-between"><span>Jawaban KB:</span> <span className="font-medium">{averageTextLengths.jawabanKb}</span></div>
                        <div className="flex justify-between"><span>Jawaban LLM Pengguna:</span> <span className="font-medium">{averageTextLengths.jawabanLlm}</span></div>
                    </div>
                </div>
            </div>

            {/* Kinerja per Topik and Topik Bermasalah can be added here if data is available and calculations are done */}
            {/* Example:
            {analyticsData.kinerjaPerTopik && analyticsData.kinerjaPerTopik.length > 0 && (
                <div><h3>Kinerja per Topik</h3> ... table ... </div>
            )}
            */}
            
            {evaluatedItemCount === 0 && questionsData.length > 0 && (
                <p className="text-center text-slate-500 text-sm py-4">
                    Tidak ada item yang dievaluasi. Silakan lakukan evaluasi di halaman Proyek untuk melihat analitik detail.
                </p>
            )}
        </div>
    </div>
  );
};
