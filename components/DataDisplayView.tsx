'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { EvaluatedQuestion } from '../types';
import { FolderPlusIcon, ArrowLeftIcon, CircleStackIcon } from './IconComponents'; 

interface DataDisplayViewProps {
  data: EvaluatedQuestion[];
  // setActiveView diganti dengan navigasi Next.js, jadi tidak diperlukan
}

const DataDisplayView: React.FC<DataDisplayViewProps> = ({ data }) => {
  const router = useRouter();

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-xl p-8">
        <FolderPlusIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Data Dimuat</p>
        <p className="text-slate-500 mb-6">
          Untuk melihat data di sini, silakan unggah file CSV/Excel melalui tampilan 'Proyek'.
        </p>
        <button
          onClick={() => router.push('/proyek')}
          className="flex items-center justify-center mx-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out"
          aria-label="Kembali ke tampilan Proyek untuk mengunggah data"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Kembali ke Proyek
        </button>
      </div>
    );
  }

  const headers = ["NOMOR", "TITLE/TOPIK", "PERTANYAAN", "JAWABAN KB (KONTEKS)", "JAWABAN LLM (DARI FILE)"];

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <div className="flex items-center">
          <CircleStackIcon className="w-7 h-7 text-sky-600 mr-3" /> 
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Loaded Dataset ({data.length} item)</h2>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y-0">
          <thead className="bg-slate-50">
            <tr>
              {headers.map(header => (
                <th 
                  key={header} 
                  scope="col" 
                  className="px-5 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((item, index) => (
              <tr key={item.id || index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sky-50/70 transition-colors duration-150`}>
                <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap font-medium border-b border-slate-200">{item.number}</td>
                <td className="px-5 py-3 text-sm text-slate-600 whitespace-normal break-words min-w-[150px] max-w-[250px] border-b border-slate-200">{item.title}</td>
                <td className="px-5 py-3 text-sm text-slate-700 whitespace-normal break-words min-w-[200px] max-w-[350px] leading-relaxed border-b border-slate-200">{item.questionText}</td>
                <td className="px-5 py-3 text-sm text-slate-600 whitespace-normal break-words min-w-[250px] max-w-[400px] italic leading-relaxed border-b border-slate-200">{item.kbAnswer}</td>
                <td className="px-5 py-3 text-sm text-slate-700 whitespace-normal break-words min-w-[250px] max-w-[400px] leading-relaxed border-b border-slate-200">{item.previousLlmAnswer || <span className="text-slate-400 italic">(Kosong)</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
         <p className="text-xs text-slate-500 mt-4 text-center">Scroll ke samping untuk melihat semua kolom jika tabel terlalu lebar.</p>
      )}
    </div>
  );
};

export default DataDisplayView;
