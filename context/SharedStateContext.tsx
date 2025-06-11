'use client';
import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
import { EvaluatedQuestion, HistoryEntry, HistoryEventType, AnalyticsData } from '@/types';
import { MAX_HISTORY_ENTRIES, HISTORY_STORAGE_KEY } from '@/constants';
import type { User as FirebaseUser } from 'firebase/auth'; // Import Firebase User type

interface SharedState {
  questionsData: EvaluatedQuestion[];
  setQuestionsData: React.Dispatch<React.SetStateAction<EvaluatedQuestion[]>>;
  reportHtmlForPreview: string | null;
  setReportHtmlForPreview: React.Dispatch<React.SetStateAction<string | null>>;
  reportTesterNameForPreview: string;
  setReportTesterNameForPreview: React.Dispatch<React.SetStateAction<string>>;
  reportProjectNameForPreview: string;
  setReportProjectNameForPreview: React.Dispatch<React.SetStateAction<string>>;
  historyEntries: HistoryEntry[];
  setHistoryEntries: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  addHistoryEntry: (
    eventType: HistoryEventType,
    details: string,
    reportHtmlContent?: string,
    reportDetails?: {
      projectName: string;
      testerName: string;
      totalItems: number;
      succeedCount: number;
      notAppropriateCount: number;
      durationFormatted: string;
      analyticsSnapshot?: AnalyticsData;
    }
  ) => void;
  clearAllHistoryEntries: () => void;
  deleteHistoryEntry: (id: string) => void;
  historicalAnalyticsToShow: AnalyticsData | null;
  setHistoricalAnalyticsToShow: React.Dispatch<React.SetStateAction<AnalyticsData | null>>;
  loadedFileName: string | null;
  setLoadedFileName: React.Dispatch<React.SetStateAction<string | null>>;
  isFileLoading: boolean;
  setIsFileLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: FirebaseUser | null; // Added for auth state
  setCurrentUser: React.Dispatch<React.SetStateAction<FirebaseUser | null>>; // Added for auth state
}

const SharedStateContext = createContext<SharedState | undefined>(undefined);

export const SharedStateProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [questionsData, setQuestionsData] = useState<EvaluatedQuestion[]>([]);
  const [reportHtmlForPreview, setReportHtmlForPreview] = useState<string | null>(null);
  const [reportTesterNameForPreview, setReportTesterNameForPreview] = useState<string>("Tester Otomatis");
  const [reportProjectNameForPreview, setReportProjectNameForPreview] = useState<string>("Proyek Otomatis");
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [historicalAnalyticsToShow, setHistoricalAnalyticsToShow] = useState<AnalyticsData | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null); // Added for auth state

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistoryEntries(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Gagal memuat riwayat dari localStorage:", error);
      setHistoryEntries([]);
    }
  }, []);

  const addHistoryEntry = useCallback((
    eventType: HistoryEventType,
    details: string,
    reportHtmlContent?: string,
    reportDetails?: {
        projectName: string;
        testerName: string;
        totalItems: number;
        succeedCount: number;
        notAppropriateCount: number;
        durationFormatted: string;
        analyticsSnapshot?: AnalyticsData;
    }
  ) => {
    setHistoryEntries(prevEntries => {
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        eventType,
        details,
        reportHtmlContent: eventType === 'Laporan Diekspor' ? reportHtmlContent : undefined,
        reportProjectName: eventType === 'Laporan Diekspor' ? reportDetails?.projectName : undefined,
        reportTesterName: eventType === 'Laporan Diekspor' ? reportDetails?.testerName : undefined,
        reportTotalItems: eventType === 'Laporan Diekspor' ? reportDetails?.totalItems : undefined,
        reportSucceedCount: eventType === 'Laporan Diekspor' ? reportDetails?.succeedCount : undefined,
        reportNotAppropriateCount: eventType === 'Laporan Diekspor' ? reportDetails?.notAppropriateCount : undefined,
        reportDurationFormatted: eventType === 'Laporan Diekspor' ? reportDetails?.durationFormatted : undefined,
        analyticsSnapshot: eventType === 'Laporan Diekspor' ? reportDetails?.analyticsSnapshot : undefined,
      };
      const updatedEntries = [newEntry, ...prevEntries].slice(0, MAX_HISTORY_ENTRIES);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedEntries));
      } catch (error) {
        console.error("Gagal menyimpan riwayat ke localStorage:", error);
      }
      return updatedEntries;
    });
  }, []);

  const clearAllHistoryEntries = useCallback(() => {
    addHistoryEntry('Riwayat Dihapus', 'Semua entri riwayat telah dihapus oleh pengguna.');
    setHistoryEntries([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error("Gagal menghapus riwayat dari localStorage:", error);
    }
  }, [addHistoryEntry]);

  const deleteHistoryEntry = useCallback((id: string) => {
    const entryToDelete = historyEntries.find(entry => entry.id === id);
    let detailMessage = `Entri riwayat (ID: ${id}) telah dihapus.`;
    if (entryToDelete) {
        detailMessage = `Entri riwayat '${entryToDelete.eventType}' untuk Proyek '${entryToDelete.reportProjectName || 'N/A'}' (dibuat pada ${new Date(entryToDelete.timestamp).toLocaleDateString()}) telah dihapus.`;
    }

    setHistoryEntries(prevEntries => {
      const updatedEntries = prevEntries.filter(entry => entry.id !== id);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedEntries));
      } catch (error) {
        console.error("Gagal menyimpan riwayat ke localStorage setelah menghapus entri:", error);
      }
      return updatedEntries;
    });
    console.log(detailMessage); 
  }, [historyEntries]);


  return (
    <SharedStateContext.Provider value={{
      questionsData, setQuestionsData,
      reportHtmlForPreview, setReportHtmlForPreview,
      reportTesterNameForPreview, setReportTesterNameForPreview,
      reportProjectNameForPreview, setReportProjectNameForPreview,
      historyEntries, setHistoryEntries, addHistoryEntry, clearAllHistoryEntries, deleteHistoryEntry,
      historicalAnalyticsToShow, setHistoricalAnalyticsToShow,
      loadedFileName, setLoadedFileName,
      isFileLoading, setIsFileLoading,
      currentUser, setCurrentUser, // Added for auth state
    }}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = (): SharedState => {
  const context = useContext(SharedStateContext);
  if (context === undefined) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};