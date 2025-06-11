
'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EvaluatedQuestion, QuestionEntry, EvaluationResult, HistoryEventType, AnalyticsData } from '@/types';
import { parseCSV } from '@/services/csvParserService';
import { parseXLSX } from '@/services/excelParserService';
import { generateHTMLReport, formatDuration } from '@/services/reportService';
import { DEFAULT_EVALUATION_PROMPT } from '@/constants';
import FileUpload from '@/components/FileUpload';
import EvaluationControls from '@/components/EvaluationControls';
import QuestionItem from '@/components/QuestionItem';
import ErrorModal from '@/components/ErrorModal';
import ReportInfoModal from '@/components/ReportInfoModal';
import BatchEvaluationModal from '@/components/BatchEvaluationModal';
import { FolderPlusIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, TrashIcon } from '@/components/IconComponents';
import { useSharedState } from '@/context/SharedStateContext';

async function evaluateAnswerWithLLMNext(
  questionText: string,
  llmAnswerToEvaluate: string | undefined,
  kbAnswerAsContext: string,
  customEvaluationPrompt: string
): Promise<EvaluationResult> {
  const response = await fetch('/api/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionText,
      llmAnswerToEvaluate,
      kbAnswerAsContext,
      customEvaluationPrompt,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ justification: "Kesalahan server tidak diketahui.", error: `HTTP error! status: ${response.status}`}));
    console.error("Kesalahan API evaluasi:", errorData);
    return {
      isAppropriate: false,
      score: 0,
      justification: errorData.justification || `Gagal mendapatkan evaluasi. Server: ${response.statusText}`,
      error: errorData.error || `HTTP error! status: ${response.status}`,
      llmSuggestedAnswer: undefined,
      evaluationDurationMs: 0, 
    };
  }
  return response.json();
}


export default function ProyekPage() {
  const router = useRouter();
  const {
    questionsData, setQuestionsData,
    setReportHtmlForPreview,
    setReportTesterNameForPreview,
    setReportProjectNameForPreview,
    addHistoryEntry,
    setHistoricalAnalyticsToShow,
    loadedFileName, setLoadedFileName,
    isFileLoading, setIsFileLoading,
  } = useSharedState();

  const [evaluationPrompt, setEvaluationPrompt] = useState<string>(DEFAULT_EVALUATION_PROMPT);
  const [isEvaluatingAll, setIsEvaluatingAll] = useState<boolean>(false);
  const [isCsvErrorModalOpen, setIsCsvErrorModalOpen] = useState<boolean>(false);
  const [csvErrorModalMessage, setCsvErrorModalMessage] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalToProcess, setTotalToProcess] = useState<number>(0);
  const [isReportInfoModalOpen, setIsReportInfoModalOpen] = useState<boolean>(false);
  const [isBatchEvaluationModalOpen, setIsBatchEvaluationModalOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(isPaused);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);


  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleCloseCsvErrorModal = () => {
    setIsCsvErrorModalOpen(false);
    setCsvErrorModalMessage(null);
  };

  const handleFileUpload = useCallback((fileContent: string | ArrayBuffer, fileType: 'csv' | 'xlsx') => {
    let fileNameForHistory = loadedFileName || "File tidak diketahui";
    try {
      let parsedData: QuestionEntry[];
      if (fileType === 'csv') {
        parsedData = parseCSV(fileContent as string);
      } else if (fileType === 'xlsx') {
        parsedData = parseXLSX(fileContent as ArrayBuffer);
      } else {
        throw new Error("Tipe file tidak didukung untuk parsing.");
      }

      if (parsedData.length === 0 && fileContent) {
        const noDataMessage = `File ${fileType.toUpperCase()} diproses, tetapi tidak ada baris data yang valid ditemukan. Harap periksa konten file, pastikan baris sesuai struktur header, dan tidak ada baris kosong berlebihan.`;
        setCsvErrorModalMessage(noDataMessage);
        setIsCsvErrorModalOpen(true);
        setQuestionsData([]);
        setTestStartTime(null);
        setReportHtmlForPreview(null);
        addHistoryEntry('Unggah Data', `Gagal memuat ${fileNameForHistory}: Tidak ada data valid ditemukan.`);
        return;
      }
      setQuestionsData(parsedData.map(q => ({ ...q, isEvaluating: false })));
      if (parsedData.length > 0) {
        setTestStartTime(Date.now());
        addHistoryEntry('Unggah Data', `Berhasil memuat ${parsedData.length} item dari ${fileNameForHistory} (tipe: ${fileType.toUpperCase()}).`);
      } else {
        setTestStartTime(null);
        addHistoryEntry('Unggah Data', `${fileNameForHistory} (tipe: ${fileType.toUpperCase()}) kosong atau tidak mengandung data valid.`);
      }
      setCsvErrorModalMessage(null);
      setReportHtmlForPreview(null);
      setHistoricalAnalyticsToShow(null);
      if (parsedData.length > 0) {
        setIsCsvErrorModalOpen(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Gagal mem-parsing file ${fileType.toUpperCase()}.`;
      console.error(`Kesalahan Parsing ${fileType.toUpperCase()}:`, error);
      setCsvErrorModalMessage(errorMessage);
      setIsCsvErrorModalOpen(true);
      setQuestionsData([]);
      setTestStartTime(null);
      setReportHtmlForPreview(null);
      setHistoricalAnalyticsToShow(null);
      addHistoryEntry('Unggah Data', `Gagal memuat ${fileNameForHistory}: ${errorMessage}`);
    }
  }, [addHistoryEntry, loadedFileName, setQuestionsData, setReportHtmlForPreview, setHistoricalAnalyticsToShow, setTestStartTime]);

  const handleEvaluateSingle = useCallback(async (id: string) => {
    setQuestionsData(prev => prev.map(q => q.id === id ? { ...q, isEvaluating: true, evaluation: undefined } : q));
    setHistoricalAnalyticsToShow(null);

    const questionToEvaluate = questionsData.find(q => q.id === id);
    if (questionToEvaluate) {
      if (questionToEvaluate.previousLlmAnswer === undefined || questionToEvaluate.previousLlmAnswer.trim() === "") {
        const noLlmAnswerMsg = "Tidak ada 'Jawaban LLM' yang diberikan dalam file untuk dievaluasi pada item ini.";
        setQuestionsData(prev => prev.map(q => q.id === id ? { ...q, evaluation: { isAppropriate: false, score: 0, justification: noLlmAnswerMsg, error: noLlmAnswerMsg, evaluationDurationMs: 0 }, isEvaluating: false } : q));
        setCsvErrorModalMessage(`Peringatan untuk item #${questionToEvaluate.number}: ${noLlmAnswerMsg}`);
        setIsCsvErrorModalOpen(true);
        addHistoryEntry('Evaluasi Item', `Gagal untuk item #${questionToEvaluate.number}: ${noLlmAnswerMsg}`);
        return;
      }
      let result: EvaluationResult;
      try {
        result = await evaluateAnswerWithLLMNext(
          questionToEvaluate.questionText,
          questionToEvaluate.previousLlmAnswer,
          questionToEvaluate.kbAnswer,
          evaluationPrompt
        );
        setQuestionsData(prev => prev.map(q => q.id === id ? { ...q, evaluation: result, isEvaluating: false } : q));
        addHistoryEntry('Evaluasi Item', `Selesai untuk item #${questionToEvaluate.number}. Skor: ${result.score?.toFixed(2) ?? 'N/A'}. Penilaian: ${result.isAppropriate ? 'Sesuai' : 'Tidak Sesuai'}. Durasi: ${result.evaluationDurationMs}ms`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui selama evaluasi."
        const errorDuration = (err as any)?.evaluationDurationMs || 0;
        result = { isAppropriate: null, score: 0, justification: `Evaluasi gagal: ${errorMessage}`, error: errorMessage, evaluationDurationMs: errorDuration };
        setQuestionsData(prev => prev.map(q => q.id === id ? { ...q, evaluation: result, isEvaluating: false } : q));
        setCsvErrorModalMessage(`Kesalahan evaluasi untuk item #${questionToEvaluate.number}: ${errorMessage}`);
        setIsCsvErrorModalOpen(true);
        addHistoryEntry('Evaluasi Item', `Gagal untuk item #${questionToEvaluate.number}: ${errorMessage}. Durasi: ${errorDuration}ms`);
      }
    }
  }, [questionsData, evaluationPrompt, addHistoryEntry, setQuestionsData, setHistoricalAnalyticsToShow]);
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executeBulkEvaluation = useCallback(async (itemsToProcess: EvaluatedQuestion[], mode: 'all' | 'range' | 'specific', batchParams?: string) => {
    if (itemsToProcess.length === 0) {
        setCsvErrorModalMessage("Tidak ada item dengan 'Jawaban LLM' yang valid untuk dievaluasi berdasarkan pilihan Anda.");
        setIsCsvErrorModalOpen(true);
        setIsEvaluatingAll(false);
        setProcessedCount(0);
        setTotalToProcess(0);
        addHistoryEntry('Evaluasi Batch', `Dibatalkan: Tidak ada item valid untuk diproses (Mode: ${mode}${batchParams ? ', Params: ' + batchParams : ''}).`);
        return;
    }

    abortControllerRef.current = new AbortController();
    const currentAbortSignal = abortControllerRef.current.signal;
    
    let totalBatchDurationMs = 0;

    setIsEvaluatingAll(true); 
    setIsPaused(false);
    isPausedRef.current = false;
    setTotalToProcess(itemsToProcess.length);
    setProcessedCount(0);
    setHistoricalAnalyticsToShow(null); 

    setQuestionsData(prev => prev.map(q => {
        if (itemsToProcess.some(itp => itp.id === q.id)) {
            return { ...q, isEvaluating: true, evaluation: undefined };
        }
        if ((!q.previousLlmAnswer || q.previousLlmAnswer.trim() === "") && !q.evaluation) {
           return { ...q, 
                    isEvaluating: false, 
                    evaluation: { isAppropriate: false, score: 0, justification: "Tidak ada 'Jawaban LLM' yang diberikan dalam file untuk dievaluasi.", error: "Jawaban LLM kosong", evaluationDurationMs: 0} 
                  };
        }
        return q; 
    }));


    const results: { id: string, result: EvaluationResult }[] = [];
    let currentProcessed = 0;
    let localSucceedCount = 0;
    let localNotAppropriateCount = 0;
    let localErrorCount = 0;
    let batchErrorMessages = "";

    try {
        for (const item of itemsToProcess) {
            if (currentAbortSignal.aborted) {
                batchErrorMessages += "Proses evaluasi semua item telah dibatalkan oleh pengguna. ";
                break; 
            }

            while (isPausedRef.current && !currentAbortSignal.aborted) {
                await delay(300); 
            }

            if (currentAbortSignal.aborted) {
                batchErrorMessages += "Proses evaluasi semua item telah dibatalkan oleh pengguna. ";
                break;
            }
            let evalResult: EvaluationResult;
            try {
                evalResult = await evaluateAnswerWithLLMNext(
                    item.questionText,
                    item.previousLlmAnswer, 
                    item.kbAnswer,
                    evaluationPrompt
                );
                results.push({ id: item.id, result: evalResult });
                totalBatchDurationMs += evalResult.evaluationDurationMs || 0;
                if (evalResult.isAppropriate === true) localSucceedCount++;
                else if (evalResult.isAppropriate === false) localNotAppropriateCount++;
                if (evalResult.error) localErrorCount++;
                setQuestionsData(prev => prev.map(q => q.id === item.id ? { ...q, evaluation: evalResult, isEvaluating: false } : q));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui selama evaluasi."
                const errorDuration = (err as any)?.evaluationDurationMs || 0;
                totalBatchDurationMs += errorDuration;
                evalResult = {isAppropriate: null, score:0, justification: `Evaluasi gagal: ${errorMessage}`, error: errorMessage, evaluationDurationMs: errorDuration};
                results.push({ id: item.id, result: evalResult });
                localErrorCount++;
                setQuestionsData(prev => prev.map(q => q.id === item.id ? { ...q, evaluation: evalResult, isEvaluating: false } : q));
                batchErrorMessages += `Kesalahan untuk item #${item.number}: ${errorMessage}. `;
            }
            currentProcessed++;
            setProcessedCount(currentProcessed);
            await delay(100); 
        }
    } catch (loopError) {
        console.error("Kesalahan tak terduga dalam loop evaluasi semua:", loopError);
        batchErrorMessages += "Terjadi kesalahan tak terduga selama proses evaluasi semua. ";
    } finally {
        setIsEvaluatingAll(false);
        setIsPaused(false);
        isPausedRef.current = false;
        
        setQuestionsData(prev => prev.map(q => {
            const foundResult = results.find(r => r.id === q.id);
            if (foundResult) {
                return { ...q, evaluation: foundResult.result, isEvaluating: false };
            }
            if (q.isEvaluating) { 
                return { ...q, isEvaluating: false, evaluation: q.evaluation || {isAppropriate: null, score: 0, justification: "Evaluasi dibatalkan sebelum diproses.", error: "Dibatalkan", evaluationDurationMs: 0} };
            }
            return q; 
        }));
        
        if (batchErrorMessages.trim() !== "") {
          setCsvErrorModalMessage(batchErrorMessages.trim());
          setIsCsvErrorModalOpen(true);
        }

        let historyDetail = `Evaluasi batch (Mode: ${mode}${batchParams ? ', Params: ' + batchParams : ''}) selesai. Diproses: ${currentProcessed}/${itemsToProcess.length}. `;
        historyDetail += `Sukses: ${localSucceedCount}, Tidak Sesuai: ${localNotAppropriateCount}, Error: ${localErrorCount}. Total Durasi LLM: ${formatDuration(totalBatchDurationMs)}.`;
        
        if (currentAbortSignal.aborted) {
            const cancelMsg = "Proses evaluasi telah dibatalkan oleh pengguna.";
            setCsvErrorModalMessage(prev => prev ? `${prev} ${cancelMsg}` : cancelMsg);
            setIsCsvErrorModalOpen(true);
            historyDetail = `Evaluasi batch (Mode: ${mode}${batchParams ? ', Params: ' + batchParams : ''}) DIBATALKAN. Diproses: ${currentProcessed}/${itemsToProcess.length}. Total Durasi LLM: ${formatDuration(totalBatchDurationMs)}.`;
        }
        addHistoryEntry('Evaluasi Batch', historyDetail);
        abortControllerRef.current = null;
    }
  }, [evaluationPrompt, addHistoryEntry, setQuestionsData, setHistoricalAnalyticsToShow ]);


  const handleStartBatchEvaluation = useCallback(async (
    mode: 'all' | 'range' | 'specific',
    params?: { startNumStr?: string; endNumStr?: string; specificNumStrs?: string }
  ) => {
    setIsBatchEvaluationModalOpen(false);
    setHistoricalAnalyticsToShow(null); 
  
    let itemsToProcess: EvaluatedQuestion[] = [];
    const allEvaluableItems = questionsData.filter(q => q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "");
    let batchParamsStr = "";

    if (allEvaluableItems.length === 0) {
        setCsvErrorModalMessage("Tidak ada item yang memiliki 'Jawaban LLM' untuk dievaluasi dalam data yang dimuat.");
        setIsCsvErrorModalOpen(true);
        return;
    }
  
    if (mode === 'all') {
      itemsToProcess = allEvaluableItems;
      batchParamsStr = "Semua";
    } else if (mode === 'range' && params?.startNumStr && params?.endNumStr) {
      const startNumVal = parseInt(params.startNumStr, 10);
      const endNumVal = parseInt(params.endNumStr, 10);
      batchParamsStr = `Rentang: ${params.startNumStr}-${params.endNumStr}`;
  
      if (isNaN(startNumVal) || isNaN(endNumVal) || startNumVal <=0 || endNumVal <=0) {
        setCsvErrorModalMessage("Nomor awal atau akhir untuk rentang tidak valid (bukan angka positif).");
        setIsCsvErrorModalOpen(true);
        return;
      }
      if (startNumVal > endNumVal) {
        setCsvErrorModalMessage("Nomor awal untuk rentang tidak boleh lebih besar dari nomor akhir.");
        setIsCsvErrorModalOpen(true);
        return;
      }
  
      itemsToProcess = allEvaluableItems.filter(q => {
        const itemNumVal = parseInt(q.number, 10);
        return !isNaN(itemNumVal) && itemNumVal >= startNumVal && itemNumVal <= endNumVal;
      });
    } else if (mode === 'specific' && params?.specificNumStrs) {
      const specificNumSet = new Set(
        params.specificNumStrs.split(',')
          .map(s => s.trim())
          .filter(s => s !== '')
      );
      batchParamsStr = `Spesifik: ${params.specificNumStrs}`;
      if (specificNumSet.size === 0) {
        setCsvErrorModalMessage("Tidak ada nomor spesifik yang valid dimasukkan.");
        setIsCsvErrorModalOpen(true);
        return;
      }
      itemsToProcess = allEvaluableItems.filter(q => specificNumSet.has(q.number));
    }
  
    if (itemsToProcess.length === 0) {
      setCsvErrorModalMessage("Tidak ada item yang cocok dengan kriteria evaluasi yang dipilih, atau item yang cocok tidak memiliki 'Jawaban LLM'.");
      setIsCsvErrorModalOpen(true);
      return;
    }
  
    await executeBulkEvaluation(itemsToProcess, mode, batchParamsStr);
  }, [questionsData, executeBulkEvaluation, setQuestionsData, setHistoricalAnalyticsToShow]);

  const handlePauseEvaluation = () => setIsPaused(true);
  const handleResumeEvaluation = () => setIsPaused(false);
  const handleCancelEvaluation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const openReportInfoModal = useCallback(() => {
    if (questionsData.length === 0) {
      setCsvErrorModalMessage("Tidak ada data untuk diekspor.");
      setIsCsvErrorModalOpen(true);
      return;
    }
    const hasAnyEvaluation = questionsData.some(q => q.evaluation);
    if (!hasAnyEvaluation) {
      setCsvErrorModalMessage("Tidak ada item yang telah dievaluasi. Harap evaluasi setidaknya satu item sebelum mengekspor laporan.");
      setIsCsvErrorModalOpen(true);
      return;
    }
    setIsReportInfoModalOpen(true);
  }, [questionsData]);

  const openBatchEvaluationModalHandler = useCallback(() => {
    if (questionsData.length === 0) {
      setCsvErrorModalMessage("Tidak ada data yang dimuat untuk dievaluasi.");
      setIsCsvErrorModalOpen(true);
      return;
    }
    const evaluableItemsCount = questionsData.filter(q => q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "").length;
    if (evaluableItemsCount === 0) {
        setCsvErrorModalMessage("Tidak ada item yang memiliki 'Jawaban LLM' untuk dievaluasi dalam data yang dimuat.");
        setIsCsvErrorModalOpen(true);
        return;
    }
    setIsBatchEvaluationModalOpen(true);
  }, [questionsData]);

  
  const calculateAnalyticsSnapshot = (data: EvaluatedQuestion[]): AnalyticsData | undefined => {
    if (!data || data.length === 0) return undefined;
    
    const evaluatedItemsList = data.filter(q => q.evaluation);
    const validScoresList = evaluatedItemsList.map(q => q.evaluation?.score).filter(s => typeof s === 'number') as number[];
    const avgScore = validScoresList.length > 0 ? validScoresList.reduce((a, b) => a + b, 0) / validScoresList.length : 0;
    
    return {
        totalItems: data.length,
        evaluatedItemCount: evaluatedItemsList.length,
        averageScore: avgScore,
        scoreInterpretation: "Snapshot historis, lihat detail di Analitik.", 
        proporsi: { 
            sesuai: evaluatedItemsList.filter(q => q.evaluation?.isAppropriate === true).length,
            tidakSesuai: evaluatedItemsList.filter(q => q.evaluation?.isAppropriate === false).length,
            errorLlmAktual: evaluatedItemsList.filter(q => q.evaluation?.error && q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "" && !q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'")).length,
        },
        kinerjaPerTopik: [], 
        itemSkorTerendah: [], 
        scoreDistribution: { bins: [], maxCount: 0 }, 
        unprocessedSummary: { 
            belumDievaluasiSamaSekali: data.length - evaluatedItemsList.length,
            llmAnswerKosong: data.filter(q => q.evaluation?.error && q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'")).length,
        },
        averageTextLengths: { pertanyaan: "N/A", jawabanKb: "N/A", jawabanLlm: "N/A" }, 
        topikBermasalah: [], 
    };
  };


  const handleConfirmAndGenerateReport = useCallback((testerName: string, projectName: string) => {
    const totalEvaluationDurationMs = questionsData.reduce((acc, q) => acc + (q.evaluation?.evaluationDurationMs || 0), 0);
    const formattedDurationStr = formatDuration(totalEvaluationDurationMs);
    const evaluatedItemsForReport = questionsData.filter(q => q.evaluation);
    const succeedCountForReport = evaluatedItemsForReport.filter(q => q.evaluation!.isAppropriate === true).length;
    const notAppropriateCountForReport = evaluatedItemsForReport.filter(q => q.evaluation!.isAppropriate === false).length;
    const totalQuestionsForReport = questionsData.length;
    const analyticsSnapshotForHistory = calculateAnalyticsSnapshot(questionsData);

    const htmlContent = generateHTMLReport(
        questionsData, testerName, projectName,
        succeedCountForReport, notAppropriateCountForReport, totalQuestionsForReport, totalEvaluationDurationMs
    );
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_evaluasi_HAKIM_LLM_${projectName.replace(/\s+/g, '_')}_${testerName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    setReportTesterNameForPreview(testerName);
    setReportProjectNameForPreview(projectName);
    setReportHtmlForPreview(htmlContent);
    setHistoricalAnalyticsToShow(null);
    
    const historyDetailsString = `Proyek='${projectName}', Tester='${testerName}'. ${totalQuestionsForReport} item. Total Durasi LLM: ${formattedDurationStr}.`;
    addHistoryEntry(
        'Laporan Diekspor', historyDetailsString, htmlContent, 
        { 
            projectName: projectName, testerName: testerName, totalItems: totalQuestionsForReport,
            succeedCount: succeedCountForReport, notAppropriateCount: notAppropriateCountForReport,
            durationFormatted: formattedDurationStr, analyticsSnapshot: analyticsSnapshotForHistory, 
        }
    );
    
    setIsReportInfoModalOpen(false);
    router.push('/laporan');
  }, [questionsData, addHistoryEntry, setReportHtmlForPreview, setReportProjectNameForPreview, setReportTesterNameForPreview, setHistoricalAnalyticsToShow, router]);

  const handleClearAllData = () => {
    if (isEvaluatingAll && abortControllerRef.current) {
        abortControllerRef.current.abort(); 
    }
    const itemCountBeforeClear = questionsData.length;
    setQuestionsData([]);
    setCsvErrorModalMessage(null);
    setIsCsvErrorModalOpen(false);
    setProcessedCount(0);
    setTotalToProcess(0);
    setIsEvaluatingAll(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setTestStartTime(null); 
    setReportHtmlForPreview(null); 
    setReportTesterNameForPreview("Tester Otomatis");
    setReportProjectNameForPreview("Proyek Otomatis");
    setHistoricalAnalyticsToShow(null);
    setLoadedFileName(null);
    setIsFileLoading(false);
    if (itemCountBeforeClear > 0) {
      addHistoryEntry('Data Dihapus', `Semua data (${itemCountBeforeClear} item) dan hasil evaluasi telah dihapus.`);
    }
    // No need to change view, already on Proyek page or router will handle view changes.
  };

  const handleAdoptSuggestion = useCallback((itemId: string, suggestedAnswer: string) => {
    const item = questionsData.find(q=>q.id === itemId);
    const itemNumber = item?.number || itemId;
    setQuestionsData(prev => prev.map(q =>
      q.id === itemId
        ? { ...q, previousLlmAnswer: suggestedAnswer, evaluation: undefined, isEvaluating: false }
        : q
    ));
    setCsvErrorModalMessage(`Jawaban untuk item #${itemNumber} telah diperbarui dengan saran LLM. Anda dapat mengevaluasinya kembali.`);
    setIsCsvErrorModalOpen(true);
    addHistoryEntry('Saran LLM Digunakan', `Saran jawaban dari LLM digunakan untuk item #${itemNumber} (Topik: ${item?.title}). Evaluasi sebelumnya dihapus.`);
    setHistoricalAnalyticsToShow(null); 
  }, [questionsData, addHistoryEntry, setQuestionsData, setHistoricalAnalyticsToShow]);

  const isAnyItemIndividuallyEvaluating = questionsData.some(q => q.isEvaluating && !isEvaluatingAll);
  const isAnyProcessing = isAnyItemIndividuallyEvaluating || isEvaluatingAll || isFileLoading;
  const hasEvaluatedItems = questionsData.some(q => q.evaluation);

  let succeedCount = 0;
  let notAppropriateCount = 0;
  let errorCount = 0;

  if (questionsData.length > 0) {
      const evaluatedItems = questionsData.filter(q => q.evaluation);
      succeedCount = evaluatedItems.filter(q => q.evaluation!.isAppropriate === true).length;
      notAppropriateCount = evaluatedItems.filter(q => q.evaluation!.isAppropriate === false).length;
      errorCount = evaluatedItems.filter(q => 
          q.evaluation!.error &&
          q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "" &&
          !q.evaluation!.justification.includes("Tidak ada 'Jawaban LLM'") &&
          !q.evaluation!.justification.includes("Jawaban LLM kosong")
      ).length;
  }

  return (
    <>
      <FileUpload 
        onFileUpload={handleFileUpload} 
        setErrorMessage={(msg) => { setCsvErrorModalMessage(msg); setIsCsvErrorModalOpen(!!msg); }}
      />
      <EvaluationControls
        evaluationPrompt={evaluationPrompt}
        setEvaluationPrompt={setEvaluationPrompt}
        onTriggerBatchEvaluation={openBatchEvaluationModalHandler}
        onExportHTML={openReportInfoModal}
        hasData={questionsData.length > 0}
        hasEvaluatedItems={hasEvaluatedItems}
        isEvaluatingAny={isAnyProcessing}
      />
      
      {questionsData.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 bg-white rounded-xl shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h3 className="text-lg font-semibold text-sky-700 mb-2 sm:mb-0">
              Antrean Evaluasi ({questionsData.length} item)
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xs text-slate-600 flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                Sesuai: <span className="font-medium ml-1 text-green-700">{succeedCount}</span>
              </span>
              <span className="text-xs text-slate-600 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1 text-red-500" />
                Tdk Sesuai: <span className="font-medium ml-1 text-red-700">{notAppropriateCount}</span>
              </span>
              <span className="text-xs text-slate-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-yellow-500" />
                Error: <span className="font-medium ml-1 text-yellow-700">{errorCount}</span>
              </span>
              <button
                onClick={handleClearAllData}
                disabled={isAnyProcessing}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md text-xs shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                title="Hapus semua data dan hasil evaluasi"
              >
                <TrashIcon className="w-3.5 h-3.5 mr-1 inline-block" />
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {questionsData.length === 0 && (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-xl p-6">
          <FolderPlusIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-1">Belum Ada Data</p>
          <p className="text-slate-500">Unggah file untuk memulai.</p>
        </div>
      )}
        {questionsData.length > 0 && (
          <div className="mt-0 space-y-5">
              {questionsData.map(item => (
                  <QuestionItem
                  key={item.id}
                  item={item}
                  onEvaluate={handleEvaluateSingle}
                  onAdoptSuggestion={handleAdoptSuggestion}
                  />
              ))}
          </div>
      )}
      <ErrorModal
          isOpen={isCsvErrorModalOpen}
          message={csvErrorModalMessage || "Terjadi kesalahan yang tidak ditentukan dengan file."}
          onClose={handleCloseCsvErrorModal}
      />
      <ReportInfoModal
        isOpen={isReportInfoModalOpen}
        onClose={() => setIsReportInfoModalOpen(false)}
        onSubmit={handleConfirmAndGenerateReport}
      />
      <BatchEvaluationModal
          isOpen={isBatchEvaluationModalOpen}
          onClose={() => setIsBatchEvaluationModalOpen(false)}
          onSubmit={handleStartBatchEvaluation}
          availableItemNumbers={questionsData.map(q => q.number)}
      />
      {isEvaluatingAll && ( 
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-live="assertive" role="dialog" aria-modal="true">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl flex flex-col items-center text-center w-full max-w-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4" role="status">
                  <span className="sr-only">Memuat...</span>
              </div>
              <p className="text-lg text-slate-800 mb-2" aria-label="Status evaluasi">
                {isPaused
                  ? `Dijeda. Mengevaluasi ${processedCount} dari ${totalToProcess} item...`
                  : totalToProcess > 0
                    ? `Mengevaluasi ${processedCount} dari ${totalToProcess} item...`
                    : "Memproses evaluasi..."}
              </p>
              <p className="text-sm text-slate-600 mt-1 mb-6">Harap tunggu, ini mungkin memakan waktu beberapa saat.</p>
              <div className="flex space-x-3 w-full">
                  {isPaused ? (
                      <button
                          onClick={handleResumeEvaluation}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm transition-colors duration-150"
                      >
                          Lanjutkan
                      </button>
                  ) : (
                      <button
                          onClick={handlePauseEvaluation}
                          className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium rounded-md shadow-sm transition-colors duration-150"
                      >
                          Jeda
                      </button>
                  )}
                  <button
                      onClick={handleCancelEvaluation}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150"
                  >
                      Batalkan
                  </button>
              </div>
          </div>
        </div>
      )}
    </>
  );
}
