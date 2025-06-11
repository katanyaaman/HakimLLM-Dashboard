
import { EvaluatedQuestion, AnalyticsData } from '../types'; // Import AnalyticsData type from types.ts

const getScoreCellStyle = (score?: number): string => {
  if (score === undefined || score === null) return 'color: #64748b;'; // slate-500
  if (score >= 0.8) return 'color: #16a34a; font-weight: bold;'; // green-600
  if (score >= 0.5) return 'color: #ca8a04; font-weight: bold;'; // yellow-600
  return 'color: #dc2626; font-weight: bold;'; // red-600
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '00:00:00';
  let totalSeconds = Math.floor(ms / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// SVGs for Evaluation Report
const successIconSvg = `
  <svg class="summary-icon" width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#16a34a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z" stroke="#16a34a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M20 28L24 22L28 28" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
const failedIconSvg = `
  <svg class="summary-icon" width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L45 40H3L24 4Z" stroke="#dc2626" stroke-width="3" stroke-linejoin="round" fill="rgba(220,38,38,0.1)"/>
    <path d="M24 20V28" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 34V35" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
const totalTopicIconSvg = `
  <svg class="summary-icon" width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="36" height="36" rx="3" stroke="#0ea5e9" stroke-width="3" stroke-linejoin="round" fill="rgba(14,165,233,0.1)"/>
    <path d="M14 18L20 24L14 30" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 32H32" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
const totalQuestionIconSvg = `
  <svg class="summary-icon" width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 16V32H10C8.89543 32 8 31.1046 8 30V18C8 16.8954 8.89543 16 10 16H15Z" stroke="#10b981" stroke-width="3" stroke-linejoin="round" fill="rgba(16,185,129,0.1)"/>
    <path d="M15 24H29.7391C30.8287 24 31.7806 23.2722 31.9579 22.1961L33.7268 10.1961C33.9563 8.77826 35.1697 7.76923 36.5995 7.9411L37.2308 8.02308C38.9775 8.23974 40 9.94027 40 11.7037V24.5C40 26.9853 37.9853 29 35.5 29H32" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
const durationIconSvgEval = `
  <svg class="summary-icon" width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round" fill="rgba(245,158,11,0.1)"/>
    <path d="M24 12V24L32 28" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const searchIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 pointer-events-none group-focus-within:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>`;
const clearIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 hover:text-slate-700 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>`;

const cuteCsvTableDownloadIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5">
  <circle cx="12" cy="12" r="11" fill="#BAE6FD"/>
  <path fill="#FFFFFF" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
</svg>
`;

// SVGs for Analytics Report (copied and adapted from IconComponents.tsx)
const analyticsChartBarIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>`;
const analyticsClockIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
const analyticsCalendarDaysIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" /></svg>`;
const analyticsTableCellsIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM3.75 12h16.5M12 3.75v16.5" /></svg>`;
const analyticsArrowTrendingDownIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" /></svg>`;
const analyticsCheckCircleIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
const analyticsXCircleIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
const analyticsExclamationTriangleIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`;
const analyticsQuestionMarkCircleIconSvg = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>`;


export const generateHTMLReport = (
  evaluatedQuestions: EvaluatedQuestion[], 
  testerName: string, 
  projectName: string,
  succeedCount: number,
  notAppropriateCount: number,
  totalQuestions: number, // this is evaluatedQuestions.length
  durationMs: number
): string => {
  const uniqueTopics = Array.from(new Set(evaluatedQuestions.map(item => item.title))).sort();
  const tableHeaders = ["Nomor", "Title/Topik", "Pertanyaan", "Jawaban KB (Konteks)", "Jawaban LLM (Dievaluasi)", "Skor (0-1)", "Penilaian", "Justifikasi"];
  
  const rows = evaluatedQuestions.map(item => {
    const evaluation = item.evaluation;
    const scoreDisplay = (evaluation?.score !== undefined && evaluation.score !== null)
        ? evaluation.score.toFixed(2)
        : (evaluation?.error && evaluation.justification && evaluation.justification.includes("Tidak ada jawaban LLM yang diberikan")) 
        ? 'N/A (Kosong)'
        : (evaluation?.error ? 'Error' : 'N/E');

    const appropriatenessText = evaluation?.isAppropriate === true
        ? 'Sesuai'
        : evaluation?.isAppropriate === false
        ? 'Tidak Sesuai'
        : (evaluation?.error && evaluation.justification && evaluation.justification.includes("Tidak ada jawaban LLM yang diberikan"))
        ? 'N/A (Kosong)'
        : (evaluation?.error ? 'Error' : 'Belum Dievaluasi');

    const appropriatenessClass = evaluation?.isAppropriate === true
        ? 'sesuai'
        : evaluation?.isAppropriate === false
        ? 'tidak-sesuai'
        : (evaluation?.error ? 'error-text' : ''); 

    return `
    <tr data-nomor="${escapeHtml(item.number)}" data-title="${escapeHtml(item.title)}" data-pertanyaan="${escapeHtml(item.questionText)}" data-status="${escapeHtml(appropriatenessText)}">
      <td>${escapeHtml(item.number)}</td>
      <td>${escapeHtml(item.title)}</td>
      <td><div class="content-cell">${escapeHtml(item.questionText)}</div></td>
      <td><div class="content-cell">${escapeHtml(item.kbAnswer)}</div></td>
      <td><div class="content-cell">${escapeHtml(item.previousLlmAnswer || (evaluation?.error && evaluation.justification && evaluation.justification.includes("Tidak ada jawaban LLM diberikan") ? '(Tidak ada jawaban LLM diberikan)' : 'N/A'))}</div></td>
      <td style="${getScoreCellStyle(evaluation?.score)}">${scoreDisplay}</td>
      <td class="${appropriatenessClass}">${appropriatenessText}</td>
      <td><div class="content-cell justification">${escapeHtml(evaluation?.justification || (evaluation?.error ? `Error: ${evaluation.error}` : 'N/A'))}</div></td>
    </tr>
  `}).join('');
  
  const formattedDuration = formatDuration(durationMs);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Evaluasi HAKIM LLM</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f1f5f9; /* slate-100 */
      color: #0f172a; /* slate-900 */
      line-height: 1.6;
    }
    .container {
      max-width: 95%;
      margin: 0 auto;
      background-color: #ffffff; /* white */
      padding: 20px 25px;
      border-radius: 8px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0; /* slate-200 */
    }
    h1 {
      color: #0369a1; /* sky-700 */
      text-align: center;
      margin-bottom: 8px;
      font-size: 1.8em;
      font-weight: 700;
    }
    .report-meta {
      text-align: center;
      margin-bottom: 25px;
      font-size: 0.9em;
      color: #64748b; /* slate-500 */
    }
    .report-meta p { margin: 4px 0; }
    .report-meta strong { color: #334155; /* slate-700 */ }
    p.timestamp {
      text-align: center;
      font-size: 0.85em;
      color: #64748b; /* slate-500 */
      margin-bottom: 5px;
    }

    /* Summary Cards Styles */
    .summary-dashboard {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      margin-bottom: 25px;
      padding: 20px;
      background-color: #f8fafc; /* slate-50 */
      border-radius: 8px;
      border: 1px solid #e2e8f0; /* slate-200 */
    }
    .summary-card {
      background-color: #ffffff; /* white */
      background-image: linear-gradient(135deg, rgba(100, 116, 139, 0.05) 25%, transparent 25%, transparent 50%, rgba(100, 116, 139, 0.05) 50%, rgba(100, 116, 139, 0.05) 75%, transparent 75%, transparent);
      background-size: 20px 20px;
      color: #1e293b; /* slate-800 */
      padding: 15px 20px;
      border-radius: 8px;
      min-width: 180px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
      border: 1px solid #e2e8f0; /* slate-200 */
    }
    .summary-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      height: 5px;
      width: 100%;
    }
    .summary-card.success::after { background-color: #16a34a; } /* green-600 */
    .summary-card.failed::after { background-color: #dc2626; } /* red-600 */
    .summary-card.topic::after { background-color: #0ea5e9; } /* sky-500 */
    .summary-card.question::after { background-color: #10b981; } /* emerald-500 */
    .summary-card.duration::after { background-color: #f59e0b; } /* amber-500 */

    /* Clickable summary cards */
    .summary-card.success, .summary-card.failed {
        cursor: pointer;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out;
    }
    .summary-card.success:hover, .summary-card.failed:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.12);
    }
    .summary-card.success:hover { background-color: #f0fdf4; /* green-50 */ }
    .summary-card.failed:hover { background-color: #fef2f2; /* red-50 */ }


    .card-header {
      font-size: 0.85em;
      color: #475569; /* slate-600 */
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .card-value {
      font-size: 2.2em;
      font-weight: 700;
      color: #0f172a; /* slate-900 */
      line-height: 1.1;
    }
    .summary-icon { opacity: 0.9; }

    /* Data Result Filter Section */
    .data-result-header {
      color: #0369a1; /* sky-700 */
      font-size: 1.5em; 
      font-weight: 600;
      margin-top: 20px;
      margin-bottom: 12px;
    }
    .filter-controls-panel {
      background-color: #f8fafc; /* slate-50 */
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto; 
      gap: 16px;
      align-items: end; 
      border: 1px solid #e2e8f0; /* slate-200 */
    }
    .filter-group {
      display: flex;
      flex-direction: column;
    }
    .filter-group label {
      font-size: 0.875em;
      color: #334155; /* slate-700 */
      margin-bottom: 6px;
    }
    .filter-group input[type="search"], .filter-group select {
      background-color: #ffffff; /* white */
      color: #0f172a; /* slate-900 */
      border: 1px solid #cbd5e1; /* slate-300 */
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 0.9em;
      height: 40px; 
      box-sizing: border-box;
    }
    .filter-group input[type="search"]:focus, .filter-group select:focus {
      outline: none;
      border-color: #0ea5e9; /* sky-500 */
      box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3); /* sky-500 with opacity */
    }
    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-input-wrapper .search-icon-svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none; 
    }
    .search-input-wrapper input[type="search"] {
      padding-left: 38px; 
      padding-right: 30px; 
      width: 100%;
    }
    .search-input-wrapper .clear-search-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      display: none; 
    }
    .download-filtered-csv-btn { 
      background-color: #0ea5e9; /* sky-500 */
      color: #ffffff; /* white */
      border: none;
      padding: 0;
      width: 40px; 
      height: 40px; 
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
    }
    .download-filtered-csv-btn svg {
        max-width: 100%;
        max-height: 100%;
    }
    .download-filtered-csv-btn:hover { 
      background-color: #0284c7; /* sky-600 */
    }
    @media (max-width: 1024px) { 
        .filter-controls-panel {
            grid-template-columns: 1fr 1fr; 
        }
        .filter-group:nth-child(1) { grid-column: 1 / 3; } 
        .filter-group:nth-child(2) { grid-column: 1 / 2; } 
        .filter-group:nth-child(3) { grid-column: 2 / 3; } 
        .download-filtered-csv-btn { grid-column: 1 / 3; justify-self: center; margin-top: 10px; width: calc(50% - 8px); } 
    }
    @media (max-width: 640px) { 
        .filter-controls-panel {
            grid-template-columns: 1fr; 
        }
        .download-filtered-csv-btn { 
            justify-self: stretch; 
            width: 100%;
            margin-top: 8px;
        }
    }
    
    table {
      width: 100%; border-collapse: separate; border-spacing: 0;
      margin-top: 15px; border: 1px solid #e2e8f0; /* slate-200 */
      border-radius: 6px; overflow: hidden;
      margin-bottom: 25px;
    }
    th, td {
      border-bottom: 1px solid #e2e8f0; /* slate-200 */
      padding: 10px 14px;
      text-align: left; vertical-align: top;
      text-align: justify; hyphens: auto; word-break: break-word;
    }
    td { border-left: 1px solid #e2e8f0; /* slate-200 */ color: #1e293b; /* slate-800 */ } 
    td:first-child { border-left: none; }
    th {
      background-color: #f1f5f9; /* slate-100 */
      color: #334155; /* slate-700 */
      font-weight: 600;
      font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.05em;
      border-left: 1px solid #e2e8f0; /* slate-200 */
    }
    th:first-child { border-left: none; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background-color: #f8fafc; /* slate-50 */ } 
    tr:hover { background-color: #e0f2fe; /* sky-100 */ } 

    .sesuai { color: #16a34a; font-weight: 500; } /* green-600 */
    .tidak-sesuai { color: #dc2626; font-weight: 500; } /* red-600 */
    .error-text { color: #d97706; font-style: italic; } /* amber-600 */

    td { font-size: 0.88em; }
    .content-cell {
      max-height: 180px; overflow-y: auto; white-space: pre-wrap;
      word-break: break-word; padding: 8px; 
      background-color: #f8fafc; /* slate-50 */
      border: 1px solid #e2e8f0; /* slate-200 */
      border-radius: 4px;
      color: #1e293b; /* slate-800 */
    }
    .justification { min-width: 180px; }
    .content-cell::-webkit-scrollbar { width: 6px; height: 6px; }
    .content-cell::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 8px;} /* slate-200 */
    .content-cell::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 8px;} /* slate-400 */
    .content-cell::-webkit-scrollbar-thumb:hover { background: #64748b; } /* slate-500 */

    @media print {
      body { background-color: #fff; padding: 0; margin: 0; color: #000; }
      .container, .filter-controls-panel, .summary-dashboard { display: none; }
      .report-meta { text-align: left; margin-bottom: 15px; color: #333; }
      h1 { color: #000 !important; }
      .data-result-header { display: none; }
      th {
        background-color: #e2e8f0 !important; color: #000 !important;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      td, .content-cell { color: #000 !important; background-color: transparent !important; }
      .content-cell { max-height: none; overflow-y: visible; border: none !important; }
      table { border: 1px solid #ccc; }
      th, td { border-color: #ccc; }
    }
    @media (max-width: 768px) { 
      .summary-card { min-width: calc(50% - 8px); }
    }
    @media (max-width: 480px) { 
      .summary-card { min-width: calc(100% - 8px); }
      .card-value { font-size: 1.8em; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>EVALUASI HAKIM LLM - Laporan Evaluasi</h1>
    <div class="report-meta">
      <p class="timestamp">Laporan Dihasilkan pada: ${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}</p>
      <p><strong>Nama Tester:</strong> ${escapeHtml(testerName)}</p>
      <p><strong>Project:</strong> ${escapeHtml(projectName)}</p>
    </div>

    <div class="summary-dashboard">
      <div class="summary-card success" id="summaryCardSuccess" title="Klik untuk memfilter status 'Sesuai'">
        <div class="card-header">Success</div>
        <div class="card-body">
          <span class="card-value">${succeedCount}</span>
          ${successIconSvg}
        </div>
      </div>
      <div class="summary-card failed" id="summaryCardFailed" title="Klik untuk memfilter status 'Tidak Sesuai'">
        <div class="card-header">Failed</div>
        <div class="card-body">
          <span class="card-value">${notAppropriateCount}</span>
          ${failedIconSvg}
        </div>
      </div>
      <div class="summary-card topic">
        <div class="card-header">Total Topic</div>
        <div class="card-body">
          <span class="card-value">${uniqueTopics.length}</span>
          ${totalTopicIconSvg}
        </div>
      </div>
      <div class="summary-card question">
        <div class="card-header">Total Question</div>
        <div class="card-body">
          <span class="card-value">${evaluatedQuestions.length}</span>
          ${totalQuestionIconSvg}
        </div>
      </div>
      <div class="summary-card duration">
        <div class="card-header">Duration</div>
        <div class="card-body">
          <span class="card-value">${formattedDuration}</span>
          ${durationIconSvgEval}
        </div>
      </div>
    </div>

    <h2 class="data-result-header">Data Result</h2>
    <div class="filter-controls-panel">
      <div class="filter-group">
        <label for="searchInput">Search:</label>
        <div class="search-input-wrapper">
          <span class="search-icon-svg">${searchIconSvg}</span>
          <input type="search" id="searchInput" placeholder="Cari pertanyaan, topik, nomor..." aria-label="Cari berdasarkan pertanyaan, topik, atau nomor">
          <span class="clear-search-btn" id="clearSearchBtn" title="Clear search">${clearIconSvg}</span>
        </div>
      </div>
      <div class="filter-group">
        <label for="statusFilter">Filter by Status:</label>
        <select id="statusFilter" aria-label="Filter berdasarkan status evaluasi">
          <option value="">All Statuses</option>
          <option value="Sesuai">Sesuai</option>
          <option value="Tidak Sesuai">Tidak Sesuai</option>
          <option value="Error">Error</option>
          <option value="N/A (Kosong)">N/A (Kosong)</option>
          <option value="Belum Dievaluasi">Belum Dievaluasi</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="topicFilter">Filter by Topic:</label>
        <select id="topicFilter" aria-label="Filter berdasarkan topik">
          <option value="">All Topic</option>
          ${uniqueTopics.map(topic => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join('')}
        </select>
      </div>
      <button class="download-filtered-csv-btn" id="downloadFilteredCsvBtn" title="Download Filtered Data (CSV)" aria-label="Download data yang difilter sebagai CSV">
        ${cuteCsvTableDownloadIconSvg}
      </button>
    </div>
    
    <table id="evaluationReportTable">
      <thead>
        <tr>
          ${tableHeaders.map(header => `<th>${escapeHtml(header)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    
  </div>
  <script>
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const topicFilter = document.getElementById('topicFilter');
    const tableBody = document.getElementById('evaluationReportTable').querySelector('tbody');
    const tableRows = Array.from(tableBody.querySelectorAll('tr'));
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    const summaryCardSuccess = document.getElementById('summaryCardSuccess');
    const summaryCardFailed = document.getElementById('summaryCardFailed');

    function filterTable() {
      const searchTerm = searchInput.value.toLowerCase().trim();
      const statusValue = statusFilter.value;
      const topicValue = topicFilter.value;
      
      clearSearchBtn.style.display = searchTerm ? 'block' : 'none';

      tableRows.forEach(row => {
        const numberText = row.dataset.nomor.toLowerCase();
        const titleText = row.dataset.title.toLowerCase();
        const questionText = row.dataset.pertanyaan.toLowerCase();
        const penilaianText = row.dataset.status; 

        const searchMatch = !searchTerm || 
                            numberText.includes(searchTerm) || 
                            titleText.includes(searchTerm) || 
                            questionText.includes(searchTerm);
        
        const statusMatch = !statusValue || penilaianText === statusValue;
        const topicMatch = !topicValue || row.dataset.title === topicValue;

        if (searchMatch && statusMatch && topicMatch) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    searchInput.addEventListener('input', filterTable);
    statusFilter.addEventListener('change', filterTable);
    topicFilter.addEventListener('change', filterTable);
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterTable(); 
        });
    }

    if (summaryCardSuccess) {
      summaryCardSuccess.addEventListener('click', () => {
        statusFilter.value = "Sesuai";
        filterTable();
      });
    }

    if (summaryCardFailed) {
      summaryCardFailed.addEventListener('click', () => {
        statusFilter.value = "Tidak Sesuai";
        filterTable();
      });
    }
    
    filterTable(); // Initial call


    function escapeCsvCell(cellData) {
        if (cellData === null || cellData === undefined) {
            return '';
        }
        let cellString = String(cellData);
        if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\\n') || cellString.includes('\\r')) {
            cellString = cellString.replace(/"/g, '""');
            return '"' + cellString + '"';
        }
        return cellString;
    }

    function downloadFile(filename, content, mimeType) { 
        const blob = new Blob(['\\uFEFF' + content], { type: mimeType }); 
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
    
    const tableHeadersJS = ${JSON.stringify(tableHeaders)};

    document.getElementById('downloadFilteredCsvBtn').addEventListener('click', function() { 
        let csvContent = tableHeadersJS.map(escapeCsvCell).join(',') + '\\r\\n';
        let hasVisibleRows = false;
        tableRows.forEach(row => {
            if (row.style.display !== 'none') {
                hasVisibleRows = true;
                const rowData = Array.from(row.cells).map(cell => {
                    const contentCell = cell.querySelector(".content-cell");
                    if (contentCell) { 
                         return escapeCsvCell(contentCell.innerText.trim());
                    }
                    return escapeCsvCell(cell.innerText.trim());
                });
                csvContent += rowData.join(',') + '\\r\\n';
            }
        });
        if (!hasVisibleRows) {
            alert("Tidak ada data yang ditampilkan berdasarkan filter saat ini untuk diunduh.");
            return;
        }

        let filenameParts = ['laporan_evaluasi'];
        const searchTermVal = searchInput.value.trim().toLowerCase();
        const statusValueVal = statusFilter.value;
        const topicValueVal = topicFilter.value;
        let filterActive = false;

        if (searchTermVal) {
            filenameParts.push('cari_' + searchTermVal.replace(/\\s+/g, '_').replace(/[^\\w-]/g, ''));
            filterActive = true;
        }
        if (statusValueVal) {
            filenameParts.push('status_' + statusValueVal.replace(/\\s+/g, '_').replace(/[^\\w-]/g, ''));
            filterActive = true;
        }
        if (topicValueVal) {
            filenameParts.push('topik_' + topicValueVal.replace(/\\s+/g, '_').replace(/[^\\w-]/g, ''));
            filterActive = true;
        }
        
        if (filterActive) {
            filenameParts.push('difilter');
        } else {
            filenameParts.push('semua_difilter');
        }
        const filename = filenameParts.join('_') + '.csv'; 

        downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
    });

  </script>
</body>
</html>
  `;
};


export const generateAnalyticsHTMLReport = (analyticsData: AnalyticsData): string => {
    const {
      evaluatedItemCount,
      averageScore,
      scoreInterpretation,
      proporsi,
      kinerjaPerTopik,
      itemSkorTerendah,
      scoreDistribution,
      unprocessedSummary,
      averageTextLengths,
      topikBermasalah,
      totalItems
    } = analyticsData;
  
    const scoreValueForDisplay = (averageScore * 100).toFixed(0);
  
    const getProgressBarColor = (score?: number) => {
      if (score === undefined || score === null || isNaN(score)) return 'background-color: #cbd5e1;'; // slate-300
      if (score >= 0.8) return 'background-color: #0ea5e9;'; // sky-500
      if (score >= 0.5) return 'background-color: #38bdf8;'; // sky-400
      return 'background-color: #7dd3fc;'; // sky-300
    };
  
    const getBinBarColor = (binColorClass: string) => {
        // Map Tailwind bg color to actual hex or CSS color name
        if (binColorClass.includes('red-500')) return '#ef4444';
        if (binColorClass.includes('red-400')) return '#f87171';
        if (binColorClass.includes('yellow-500')) return '#eab308';
        if (binColorClass.includes('yellow-400')) return '#facc15';
        if (binColorClass.includes('green-500')) return '#22c55e';
        return '#cbd5e1'; // default slate-300
      };
  
    return `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Analitik HAKIM LLM</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f1f5f9; color: #0f172a; line-height: 1.6; }
      .container { max-width: 1000px; margin: 0 auto; background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      h1, h2, h3 { color: #0369a1; margin-top:0; }
      h1 { text-align: center; font-size: 1.8em; margin-bottom: 5px; }
      h2 { font-size: 1.5em; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
      h3 { font-size: 1.2em; margin-bottom: 8px; color: #1e293b; }
      p { margin-bottom: 10px; text-align: justify; hyphens: auto; word-break: break-word; }
      .interpretation, .card-title, .list-item .label, .list-item .value { text-align: left; } /* override justify for specific elements */
      .score-display { text-align: left;}

      .timestamp { text-align: center; font-size: 0.85em; color: #64748b; margin-bottom: 20px; }
      .grid { display: grid; gap: 20px; }
      .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .card { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;}
      .card-title { display: flex; align-items: center; font-size: 0.9em; font-weight: 500; color: #475569; margin-bottom: 12px; text-transform: uppercase; }
      .card-title .icon { width: 18px; height: 18px; margin-right: 8px; stroke-width: 2; }
      .score-display { font-size: 2.8em; font-weight: 700; color: #0ea5e9; margin-bottom: 8px; }
      .progress-bar-bg { background-color: #e2e8f0; border-radius: 9999px; height: 12px; margin-bottom: 8px; overflow: hidden; }
      .progress-bar { height: 12px; border-radius: 9999px; }
      .interpretation { font-size: 0.8em; color: #64748b; }
      .list-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.9em; margin-bottom: 5px; }
      .list-item .label { color: #334155; }
      .list-item .value { font-weight: 600; color: #1e293b; }
      .table-container { overflow-x: auto; max-height: 350px; }
      table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
      th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
      th { background-color: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 0.75em; white-space: nowrap; }
      tr:last-child td { border-bottom: none; }
      tr:hover { background-color: #f0f9ff; }
      .truncate { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .score-dist-bar-bg { flex-grow: 1; background-color: #e2e8f0; border-radius: 9999px; height: 16px; margin-right: 8px; }
      .score-dist-bar { height: 16px; border-radius: 9999px; transition: width 0.5s ease-out; }
      .text-green-500 { color: #22c55e; } .bg-green-500 { background-color: #22c55e; }
      .text-red-500 { color: #ef4444; } .bg-red-500 { background-color: #ef4444; }
      .text-yellow-500 { color: #eab308; } .bg-yellow-500 { background-color: #eab308; }
      .text-sky-600 { color: #0284c7; }
      .text-amber-600 { color: #d97706; }
      .text-slate-400 { color: #94a3b8; } .italic { font-style: italic; }
      .font-medium { font-weight: 500; }
      .text-center { text-align: center; }
      .icon-inline { width: 1em; height: 1em; vertical-align: -0.125em; margin-right: 0.3em; display:inline-block; }
      @media (max-width: 768px) {
        .grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .card-title .icon { width: 16px; height: 16px; }
        .score-display { font-size: 2.2em; }
        h1 { font-size: 1.5em; } h2 { font-size: 1.3em; } h3 { font-size: 1.1em; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Laporan Analitik HAKIM LLM</h1>
      <p class="timestamp">Dihasilkan pada: ${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}</p>

      <div class="grid grid-cols-2">
        <div class="card">
          <div class="card-title">${analyticsClockIconSvg} SKOR KUALITAS KESELURUHAN</div>
          <p class="score-display">${scoreValueForDisplay}%</p>
          <div class="progress-bar-bg"><div class="progress-bar" style="${getProgressBarColor(averageScore)} width: ${scoreValueForDisplay}%;"></div></div>
          <p class="interpretation">Interpretasi: ${escapeHtml(scoreInterpretation)}</p>
        </div>

        <div class="card">
          <div class="card-title">${analyticsClockIconSvg} PROPORSI HASIL EVALUASI</div>
          ${[{ label: 'Sesuai', value: proporsi.sesuai, color: 'bg-green-500', icon: analyticsCheckCircleIconSvg, iconColor: 'text-green-500' },
             { label: 'Tidak Sesuai', value: proporsi.tidakSesuai, color: 'bg-red-500', icon: analyticsXCircleIconSvg, iconColor: 'text-red-500' },
             { label: 'Error Proses Aktual', value: proporsi.errorLlmAktual, color: 'bg-yellow-500', icon: analyticsExclamationTriangleIconSvg, iconColor: 'text-yellow-500' }]
             .map(item => `
            <div>
              <div class="list-item" style="margin-bottom: 4px;">
                <span class="label" style="display:flex; align-items:center;">
                  <span class="${item.iconColor}" style="display:inline-block; width:18px; height:18px; margin-right: 5px;">${item.icon}</span> 
                  ${escapeHtml(item.label)}
                </span>
                <span class="value">${item.value} (${evaluatedItemCount > 0 ? ((item.value / evaluatedItemCount) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div class="progress-bar-bg" style="height:6px;"><div class="progress-bar ${item.color}" style="height:6px; width: ${evaluatedItemCount > 0 ? (item.value / evaluatedItemCount) * 100 : 0}%;"></div></div>
            </div>`).join('')}
        </div>
      </div>

      <div class="grid grid-cols-2" style="margin-top: 20px;">
        <div class="card">
          <div class="card-title">${analyticsCalendarDaysIconSvg} TOTAL EVALUASI</div>
          <p class="score-display" style="font-size: 2.5em; color: #1e293b;">${evaluatedItemCount}</p>
          <p class="interpretation">item dari ${totalItems} total telah dievaluasi.</p>
        </div>
        <div class="card">
          <div class="card-title">${analyticsQuestionMarkCircleIconSvg} STATUS PEMROSESAN ITEM</div>
          <div class="list-item"><span class="label">Belum Dievaluasi:</span> <span class="value">${unprocessedSummary.belumDievaluasiSamaSekali} item</span></div>
          <div class="list-item"><span class="label">Jawaban LLM Kosong:</span> <span class="value">${unprocessedSummary.llmAnswerKosong} item</span></div>
        </div>
      </div>

      <div class="grid grid-cols-2" style="margin-top: 20px;">
        <div class="card">
          <div class="card-title">${analyticsChartBarIconSvg} DISTRIBUSI SKOR KUALITAS</div>
          ${scoreDistribution.maxCount > 0 ? scoreDistribution.bins.map(bin => `
            <div style="display: flex; align-items: center; font-size: 0.9em; margin-bottom: 6px;">
              <span style="width: 70px; color: #334155;">${escapeHtml(bin.label)}</span>
              <div class="score-dist-bar-bg"><div class="score-dist-bar" style="background-color: ${getBinBarColor(bin.color)}; width: ${scoreDistribution.maxCount > 0 ? (bin.count / scoreDistribution.maxCount) * 100 : 0}%;"></div></div>
              <span style="width: 30px; color: #1e293b; font-weight: 600; text-align: right;">${bin.count}</span>
            </div>`).join('') : '<p class="interpretation">Tidak ada data skor untuk ditampilkan.</p>'}
        </div>
        <div class="card">
          <div class="card-title">${analyticsTableCellsIconSvg} RATA-RATA PANJANG TEKS</div>
          <div class="list-item"><span class="label">Pertanyaan:</span> <span class="value">${averageTextLengths.pertanyaan} karakter</span></div>
          <div class="list-item"><span class="label">Jawaban KB:</span> <span class="value">${averageTextLengths.jawabanKb} karakter</span></div>
          <div class="list-item"><span class="label">Jawaban LLM Pengguna:</span> <span class="value">${averageTextLengths.jawabanLlm} karakter</span></div>
        </div>
      </div>

      <div class="grid grid-cols-1" style="margin-top: 20px;">
        <div class="card">
          <div class="card-title">${analyticsTableCellsIconSvg} ANALISIS KINERJA PER TOPIK</div>
          ${kinerjaPerTopik.length > 0 ? `
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>TOPIK</th>
                  <th style="width: 120px;">SKOR RATA-RATA</th>
                  <th class="text-center">SES</th>
                  <th class="text-center">TDK</th>
                  <th class="text-center">ERR</th>
                  <th class="text-center">KSG</th>
                </tr>
              </thead>
              <tbody>
                ${kinerjaPerTopik.map(item => `
                <tr>
                  <td class="truncate" title="${escapeHtml(item.topik)}">${escapeHtml(item.topik)}</td>
                  <td style="width: 120px;">
                    ${(item.totalItem - item.belumDievaluasi - item.llmAnswerKosong) > 0 ? `
                    <div class="progress-bar-bg" style="height:8px;"><div class="progress-bar" style="${getProgressBarColor(item.skorRataRata)} height:8px; width: ${item.skorRataRata * 100}%;"></div></div>`
                    : '<span class="text-slate-400 italic" style="font-size:0.8em;">N/A</span>'}
                  </td>
                  <td class="text-center font-medium" style="color:#22c55e;">${item.sesuai > 0 ? item.sesuai : '-'}</td>
                  <td class="text-center font-medium" style="color:#ef4444;">${item.tidakSesuai > 0 ? item.tidakSesuai : '-'}</td>
                  <td class="text-center font-medium" style="color:#eab308;">${item.errorLlmAktual > 0 ? item.errorLlmAktual : '-'}</td>
                  <td class="text-center font-medium" style="color:#d97706;">${item.llmAnswerKosong > 0 ? item.llmAnswerKosong : '-'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : '<p class="interpretation">Tidak ada data topik untuk ditampilkan.</p>'}
        </div>
      </div>
      
      <div class="grid grid-cols-2" style="margin-top: 20px;">
        <div class="card">
          <div class="card-title">${analyticsArrowTrendingDownIconSvg} ITEM DENGAN SKOR TERENDAH (TOP 5)</div>
          ${itemSkorTerendah.length > 0 ? `
          <ul style="padding-left:0; list-style:none; max-height: 200px; overflow-y:auto;">
            ${itemSkorTerendah.map((item, idx) => `
            <li style="padding: 8px; border: 1px solid #f1f5f9; border-radius: 6px; margin-bottom: 6px; font-size:0.85em;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px;">
                <p class="truncate" style="font-weight: 500; color: #1e293b; margin:0;" title="${escapeHtml(item.title)}">
                  #${idx + 1} - ${escapeHtml(item.title)} (No: ${escapeHtml(item.number)})
                </p>
                <span style="font-size: 0.8em; font-weight: 700; padding: 2px 6px; border-radius: 4px; color: white; background-color: ${item.score >= 0.8 ? '#22c55e' : item.score >= 0.5 ? '#eab308' : '#ef4444'};">
                  Skor: ${item.score.toFixed(2)}
                </span>
              </div>
              <p style="font-size: 0.9em; color: #475569; margin:0;" class="truncate" title="${escapeHtml(item.justification)}">
                Justifikasi: <span class="italic">${escapeHtml(item.justification)}</span>
              </p>
            </li>`).join('')}
          </ul>` : '<p class="interpretation">Tidak ada item dengan skor untuk ditampilkan.</p>'}
        </div>

        <div class="card">
          <div class="card-title"><span style="color:#ef4444; display:inline-block; width:18px; height:18px; margin-right:5px;">${analyticsExclamationTriangleIconSvg}</span> TOPIK PERLU PERHATIAN (TOP 5)</div>
          ${topikBermasalah.length > 0 ? `
          <div class="table-container" style="max-height: 200px;">
            <table>
              <thead>
                <tr>
                  <th>TOPIK</th>
                  <th class="text-center">TDK SESUAI</th>
                  <th class="text-center">ERROR AKTUAL</th>
                </tr>
              </thead>
              <tbody>
                ${topikBermasalah.map(item => `
                <tr>
                  <td class="truncate" title="${escapeHtml(item.topik)}">${escapeHtml(item.topik)}</td>
                  <td class="text-center font-medium" style="color:#ef4444;">${item.detailTidakSesuai > 0 ? item.detailTidakSesuai : '-'}</td>
                  <td class="text-center font-medium" style="color:#eab308;">${item.detailErrorAktual > 0 ? item.detailErrorAktual : '-'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : '<p class="interpretation">Tidak ada topik bermasalah teridentifikasi.</p>'}
        </div>
      </div>
    </div>
  </body>
  </html>
    `;
  };


function escapeHtml(unsafe: string | undefined): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
