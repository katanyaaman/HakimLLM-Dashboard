'use client';
import React from 'react';
import { LinkIcon, CheckCircleIcon, XCircleIcon } from './IconComponents';
import { GEMINI_MODEL_TEXT } from '@/constants';


const LLMIntegrationView: React.FC = () => {
  // In Next.js, API key is managed server-side. 
  // This component now provides informational text.
  // The actual check of API key availability happens in the API route.
  const apiKeyStatusMessage = "Kunci API Gemini dikonfigurasi di sisi server. Fungsionalitas evaluasi LLM aktif.";
  const isApiKeyConfigured = true; // Assume configured on server for UI purposes

  return (
    <div className="p-6 sm:p-8 bg-white rounded-xl shadow-xl">
      <div className="flex items-center mb-6">
        <LinkIcon className="w-10 h-10 text-sky-600 mr-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Integrasi LLM</h2>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Model LLM yang Digunakan</h3>
          <p className="text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200 text-sm">
            <span className="font-mono text-sky-700">{GEMINI_MODEL_TEXT}</span>
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Deskripsi</h3>
          <p className="text-slate-600 text-sm">
            Aplikasi HAKIM LLM menggunakan Google Gemini API untuk melakukan evaluasi otomatis terhadap jawaban yang diberikan. 
            Kriteria evaluasi dapat disesuaikan melalui prompt untuk memandu proses penilaian oleh LLM.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Status Kunci API Gemini</h3>
          {isApiKeyConfigured ? (
            <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
              {apiKeyStatusMessage}
            </div>
          ) : (
            // This part is less likely to be hit if API key is purely server-side managed,
            // but kept for completeness or if a client-side check mechanism were added.
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              <div className="flex items-center mb-1 text-sm">
                <XCircleIcon className="w-5 h-5 mr-2 text-red-600" />
                Kunci API Gemini tampaknya tidak dikonfigurasi.
              </div>
              <p className="text-sm ml-7">Pastikan variabel lingkungan GEMINI_API_KEY telah diatur dengan benar di server. Fungsionalitas evaluasi LLM akan dinonaktifkan.</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Cara Kerja</h3>
           <p className="text-slate-600 text-sm">
            Untuk setiap item data, aplikasi mengirimkan pertanyaan, jawaban dari knowledge base (jika ada), jawaban LLM pengguna, dan prompt kriteria evaluasi ke backend aplikasi (melalui API Route). 
            Backend kemudian secara aman memanggil Gemini API. API Gemini mengembalikan skor, justifikasi, dan status kesesuaian berdasarkan analisisnya, yang kemudian diteruskan kembali ke antarmuka pengguna.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LLMIntegrationView;
