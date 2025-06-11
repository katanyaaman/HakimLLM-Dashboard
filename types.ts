
export interface QuestionEntry {
  id: string;
  number: string; // 'nomor'
  title: string; // 'title' (Topik/Judul singkat)
  questionText: string; // 'pertanyaan' (Teks pertanyaan lengkap)
  kbAnswer: string; // 'jawaban kb' (Jawaban dari Knowledge Base, untuk konteks/referensi)
  previousLlmAnswer?: string; // 'jawaban llm' (Jawaban LLM dari file, untuk dievaluasi)
}

export interface EvaluationResult {
  isAppropriate: boolean | null;
  score?: number; // Skor numerik dari LLM (0.0 - 1.0)
  justification: string;
  llmSuggestedAnswer?: string; // Saran jawaban BARU dari LLM setelah evaluasi
  error?: string;
  evaluationDurationMs?: number; // Durasi panggilan LLM untuk evaluasi ini
}

export interface EvaluatedQuestion extends QuestionEntry {
  evaluation?: EvaluationResult;
  isEvaluating?: boolean;
}

export enum EvaluationStatus {
  Pending = 'Pending',
  Evaluating = 'Evaluating',
  Success = 'Success',
  Error = 'Error',
}

export type HistoryEventType = 
  | 'Unggah Data' 
  | 'Evaluasi Item' 
  | 'Evaluasi Batch' 
  | 'Pratinjau Laporan Dibuat' 
  | 'Laporan Diekspor' 
  | 'Data Dihapus'
  | 'Saran LLM Digunakan'
  | 'Riwayat Dihapus'
  | 'Analitik Dilihat'; // Added new event type

export interface HistoryEntry {
  id: string;
  timestamp: string; // ISO string for easier sorting and storage
  eventType: HistoryEventType;
  details: string; // Combined information about the event
  reportHtmlContent?: string; // For 'Laporan Diekspor' events, to store the actual HTML

  // New fields for 'Laporan Diekspor' to match the new UI
  reportProjectName?: string;
  reportTesterName?: string;
  reportTotalItems?: number;
  reportSucceedCount?: number;
  reportNotAppropriateCount?: number;
  reportDurationFormatted?: string;
  analyticsSnapshot?: AnalyticsData; // Snapshot of analytics data at the time of export
}

// Moved from AnalitikView.tsx for global access
export interface AnalyticsData {
  totalItems: number;
  evaluatedItemCount: number;
  averageScore: number;
  scoreInterpretation: string;
  proporsi: {
    sesuai: number;
    tidakSesuai: number;
    errorLlmAktual: number;
  };
  kinerjaPerTopik: Array<{
    topik: string;
    skorRataRata: number;
    totalItem: number;
    sesuai: number;
    tidakSesuai: number;
    errorLlmAktual: number;
    llmAnswerKosong: number;
    belumDievaluasi: number;
  }>;
  itemSkorTerendah: Array<{
    id: string;
    number: string;
    title: string;
    justification: string;
    score: number;
  }>;
  scoreDistribution: {
    bins: Array<{ label: string; min: number; max: number; count: number; color: string; }>;
    maxCount: number;
  };
  unprocessedSummary: {
    belumDievaluasiSamaSekali: number;
    llmAnswerKosong: number;
  };
  averageTextLengths: {
    pertanyaan: string;
    jawabanKb: string;
    jawabanLlm: string;
  };
  topikBermasalah: Array<{
    topik: string;
    totalBermasalah: number;
    detailTidakSesuai: number;
    detailErrorAktual: number;
  }>;
}