'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlusIcon, ArrowLeftIcon, DownloadIcon, DocumentPlusIcon, RefreshIcon } from './IconComponents'; 
import { useSharedState } from '@/context/SharedStateContext';
import ErrorModal from './ErrorModal'; // Assuming ErrorModal is also a client component

interface ReportPreviewProps {
  onExportReportRequest: () => void; // This will trigger the modal from ProyekPage
}

const ReportPreviewPageContent: React.FC<ReportPreviewProps> = ({ onExportReportRequest }) => {
  const router = useRouter();
  const { 
    reportHtmlForPreview, 
    reportTesterNameForPreview, 
    reportProjectNameForPreview,
    setQuestionsData,
    setReportHtmlForPreview,
    setReportTesterNameForPreview,
    setReportProjectNameForPreview,
    setHistoricalAnalyticsToShow,
    setLoadedFileName,
    setIsFileLoading,
    addHistoryEntry,
    questionsData,
  } = useSharedState();

  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleBackAndClear = () => {
    setQuestionsData([]);
    setReportHtmlForPreview(null);
    setReportTesterNameForPreview("Tester Otomatis");
    setReportProjectNameForPreview("Proyek Otomatis");
    setHistoricalAnalyticsToShow(null);
    setLoadedFileName(null);
    setIsFileLoading(false);
    addHistoryEntry('Data Dihapus', 'Semua data dan hasil evaluasi telah dihapus saat kembali dari pratinjau laporan.');
    router.push('/proyek'); 
  };
  
  const handleRefreshReport = () => {
    // This logic might need to be re-evaluated as generateAndSetReportPreview was in App.tsx
    // For now, it might involve re-fetching or re-calculating report data.
    // Placeholder alert, actual logic needs to be tied to data generation.
     if (questionsData.length > 0) {
        // A simplified version, actual report regeneration may need more context
        // This is a conceptual refresh. For a real refresh, ProyekPage would regenerate report data.
        addHistoryEntry('Pratinjau Laporan Dibuat', `Pratinjau laporan di-refresh (konseptual)`);
        setErrorMessage("Refresh pratinjau laporan. Fungsi ini mungkin perlu penyesuaian untuk meregenerasi data laporan aktual dari ProyekPage.");
        setErrorModalOpen(true);

    } else {
        setErrorMessage("Tidak ada data untuk me-refresh laporan.");
        setErrorModalOpen(true);
        setReportHtmlForPreview(null);
    }
  };

  useEffect(() => {
    if (questionsData.length === 0 && reportHtmlForPreview) {
      setReportHtmlForPreview(null); // Clear preview if data is cleared elsewhere
    }
  }, [questionsData, reportHtmlForPreview, setReportHtmlForPreview]);


  if (!reportHtmlForPreview) {
    return (
      <>
        <div className="text-center py-16 bg-white rounded-xl shadow-xl p-8">
          <FolderPlusIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Laporan</p>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Untuk melihat laporan di sini, silakan unggah data di halaman Proyek dan hasilkan laporan. Anda juga bisa melihat laporan dari Riwayat.
          </p>
          <button
            onClick={() => router.push('/proyek')} 
            className="flex items-center justify-center mx-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out"
            aria-label="Kembali ke tampilan Proyek"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Kembali ke Proyek
          </button>
        </div>
        <ErrorModal isOpen={errorModalOpen} message={errorMessage} onClose={() => setErrorModalOpen(false)} />
      </>
    );
  }

  return (
    <>
    <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full flex flex-col">
        <div className="p-4 sm:p-5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
                <DocumentPlusIcon className="w-7 h-7 text-sky-600 mr-3 hidden sm:block"/>
                <div>
                    <h2 className="text-xl font-bold text-sky-700">Pratinjau Laporan</h2>
                    {reportTesterNameForPreview && reportProjectNameForPreview && (
                        <p className="text-xs sm:text-sm text-slate-500">
                            Tester: <span className="font-medium text-slate-700">{reportTesterNameForPreview}</span> | Project: <span className="font-medium text-slate-700">{reportProjectNameForPreview}</span>
                        </p>
                    )}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                 <button
                    onClick={handleRefreshReport} // The actual report data generation would happen in ProyekPage
                    className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                    title="Refresh pratinjau laporan dengan data terkini"
                    aria-label="Refresh pratinjau laporan"
                >
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    Refresh
                </button>
                <button
                    onClick={onExportReportRequest} // This should trigger the modal in ProyekPage
                    className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                    title="Ekspor laporan ini sebagai file HTML"
                    aria-label="Ekspor hasil sebagai HTML"
                >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Ekspor HTML
                </button>
                <button
                  onClick={handleBackAndClear}
                  className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                  title="Kembali ke tampilan unggah dan hapus semua data serta laporan ini"
                  aria-label="Kembali ke tampilan Proyek dan hapus semua data"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Kembali & Hapus
                </button>
            </div>
        </div>
      <div 
        className="report-preview-content flex-grow p-0.5 sm:p-1" 
        style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
        aria-live="polite" 
        aria-atomic="true"
      >
        <iframe
            srcDoc={reportHtmlForPreview}
            title={`Laporan Evaluasi - ${reportProjectNameForPreview} oleh ${reportTesterNameForPreview}`}
            className="w-full h-full border-none rounded-b-md"
            sandbox="allow-scripts allow-same-origin" // Allow scripts for report interactivity
        />
      </div>
    </div>
    <ErrorModal isOpen={errorModalOpen} message={errorMessage} onClose={() => setErrorModalOpen(false)} />
    </>
  );
};

// This wrapper component is needed if ReportPreviewPageContent uses hooks from 'next/navigation'
// or other client-side specific hooks, and it's intended to be a page.
// The main page component will call this.
const ReportPreviewPage: React.FC = () => {
    const { questionsData } = useSharedState();
    // Logic to open report info modal would typically be in ProyekPage,
    // which then calls handleConfirmAndGenerateReport which sets the report HTML and navigates.
    // For direct navigation to /laporan, we rely on existing state.
    
    // A simplified onExportReportRequest for this page context:
    const handleExportFromPreview = () => {
        // This is tricky. The ReportInfoModal is part of ProyekPage.
        // Ideally, this button might navigate back to ProyekPage with a query param to open the modal,
        // or the modal logic itself becomes a shared component.
        // For now, let's just alert.
        alert("Fungsi Ekspor HTML di halaman pratinjau ini akan meminta info tester/proyek. Idealnya, ini memicu modal dari Proyek.");
    };

    return <ReportPreviewPageContent onExportReportRequest={handleExportFromPreview} />;
};

export default ReportPreviewPage;
