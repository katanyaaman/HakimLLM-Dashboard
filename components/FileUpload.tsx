'use client';
import React, { useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadIcon, DownloadIcon, LifebuoyIcon } from './IconComponents';
import { SAMPLE_CSV_CONTENT, EXPECTED_HEADERS_INDONESIAN, SAMPLE_EXCEL_DATA_ROWS } from '@/constants';
import LoadingSpinner from './LoadingSpinner';
import { useSharedState } from '@/context/SharedStateContext';

interface FileUploadProps {
  onFileUpload: (content: string | ArrayBuffer, fileType: 'csv' | 'xlsx') => void;
  setErrorMessage: (message: string | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
    onFileUpload, 
    setErrorMessage, 
}) => {
  const { isFileLoading, setIsFileLoading, loadedFileName, setLoadedFileName } = useSharedState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChangeAndProcess = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType === 'csv' || fileType === 'xlsx') {
        setLoadedFileName(file.name);
        setErrorMessage(null);
        setIsFileLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          if (content) {
            onFileUpload(content, fileType as 'csv' | 'xlsx');
          } else {
            setErrorMessage("Tidak dapat membaca konten file. File mungkin kosong.");
            setLoadedFileName(null);
          }
          setIsFileLoading(false);
        };
        reader.onerror = () => {
          setErrorMessage("Kesalahan membaca konten file. File mungkin rusak atau tidak dapat dibaca.");
          setLoadedFileName(null);
          setIsFileLoading(false);
        };

        if (fileType === 'csv') {
          reader.readAsText(file);
        } else if (fileType === 'xlsx') {
          reader.readAsArrayBuffer(file);
        }
      } else {
        setErrorMessage("Format file tidak didukung. Harap unggah file .csv atau .xlsx.");
        setLoadedFileName(null);
      }
    }
    if (event.target) {
      event.target.value = '';
    }
  }, [onFileUpload, setErrorMessage, setIsFileLoading, setLoadedFileName]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadSampleCSV = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'contoh_format_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleDownloadSampleExcel = useCallback(() => {
    const worksheet = XLSX.utils.aoa_to_sheet(SAMPLE_EXCEL_DATA_ROWS);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contoh Data');
    XLSX.writeFile(workbook, 'contoh_format_data.xlsx');
  }, []);

  return (
    <div className="mb-6 bg-white rounded-xl shadow-xl transition-colors duration-300 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-start sm:items-center mb-3">
          <LifebuoyIcon className="w-7 h-7 text-sky-600 mr-3 flex-shrink-0" />
          <h2 className="text-xl font-bold text-slate-800">Pilih File (.csv/.xlsx)</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Header yang diharapkan: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 text-xs font-mono">{EXPECTED_HEADERS_INDONESIAN.join(', ')}</code>. Untuk file Excel, pastikan sheet pertama berisi data dengan header yang sama. Setiap baris setelah header akan dianggap sebagai entri pertanyaan.
        </p>
        
        <input
          type="file"
          id="fileUploadInput"
          accept=".csv,.xlsx"
          onChange={handleFileChangeAndProcess}
          className="hidden"
          ref={fileInputRef}
          aria-label="Pilih file .csv atau .xlsx untuk diunggah"
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={triggerFileInput}
            disabled={isFileLoading}
            className="flex-grow sm:flex-none flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
          >
            {isFileLoading ? (
              <>
                <LoadingSpinner size="w-5 h-5" />
                <span className="ml-2">Memproses...</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5 mr-2" />
                Unggah File
              </>
            )}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSampleCSV}
              className="flex items-center text-sky-600 hover:text-sky-500 hover:underline transition-colors duration-150 text-sm"
              aria-label="Unduh contoh format CSV"
            >
              <DownloadIcon className="w-4 h-4 mr-1" />
              Unduh Contoh CSV
            </button>
            <button
              onClick={handleDownloadSampleExcel}
              className="flex items-center text-sky-600 hover:text-sky-500 hover:underline transition-colors duration-150 text-sm"
              aria-label="Unduh contoh format Excel"
            >
              <DownloadIcon className="w-4 h-4 mr-1" />
              Unduh Contoh Excel
            </button>
          </div>
        </div>
        
        {loadedFileName && !isFileLoading && (
          <p className="text-xs text-slate-500 mt-3">
            File terpilih: <span className="font-medium text-sky-600">{loadedFileName}</span>. Data akan otomatis dimuat.
          </p>
        )}
         {isFileLoading && loadedFileName && (
           <p className="text-xs text-slate-500 mt-3">
             Sedang memproses file: <span className="font-medium text-sky-600">{loadedFileName}</span>...
           </p>
         )}
      </div>
    </div>
  );
};

export default FileUpload;
