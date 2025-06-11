
import * as XLSX from 'xlsx';
import { QuestionEntry } from '@/types';
import { EXPECTED_HEADERS_INDONESIAN, EXPECTED_HEADERS_TYPE_MAPPING } from '@/constants';

export const parseXLSX = (arrayBuffer: ArrayBuffer): QuestionEntry[] => {
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("File Excel tidak memiliki sheet yang dapat dibaca.");
  }
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (jsonData.length < 2) { // Header + at least one data row
    throw new Error("Sheet Excel harus memiliki baris header dan setidaknya satu baris data.");
  }

  const headerRow = (jsonData[0] as string[]).map(h => String(h).trim().toLowerCase());

  const missingHeaders = EXPECTED_HEADERS_INDONESIAN.filter(eh => !headerRow.includes(eh));
  if (missingHeaders.length > 0) {
    throw new Error(`Sheet Excel kekurangan header wajib: ${missingHeaders.join(', ')}. Header yang ditemukan: ${headerRow.join(', ')}`);
  }
  
  const headerIndices: { [key: string]: number } = {};
  EXPECTED_HEADERS_INDONESIAN.forEach(headerName => {
    headerIndices[headerName] = headerRow.indexOf(headerName);
  });

  const dataRows = jsonData.slice(1) as string[][];

  return dataRows.map((row, index) => {
    if (row.every(cell => String(cell).trim() === "")) { // Skip completely empty rows
        console.warn(`Melewati baris Excel ${index + 2} karena kosong.`);
        return null;
    }

    const maxIndex = Math.max(...Object.values(headerIndices));
    if (row.length <= maxIndex && !row.slice(0, maxIndex+1).some(cell => String(cell).trim() !== "")) { // check if relevant cells are all empty
        console.warn(`Melewati baris Excel ${index + 2} karena tampaknya tidak memiliki cukup data di kolom yang diharapkan.`);
        return null;
    }
    
    const entry: Partial<QuestionEntry> = { id: crypto.randomUUID() };

    for (const headerName of EXPECTED_HEADERS_INDONESIAN) {
        const internalFieldName = EXPECTED_HEADERS_TYPE_MAPPING[headerName as keyof typeof EXPECTED_HEADERS_TYPE_MAPPING];
        const cellValue = row[headerIndices[headerName]];
        const value = cellValue !== undefined && cellValue !== null ? String(cellValue).trim() : "";


        if (internalFieldName === 'number' || internalFieldName === 'title' || internalFieldName === 'questionText' || internalFieldName === 'kbAnswer') {
             if (!value) { // previousLlmAnswer is handled in the else if, this block implies it's not previousLlmAnswer
                if (internalFieldName === 'number') entry[internalFieldName] = `N/A-${index}`;
                else if (internalFieldName === 'title') entry[internalFieldName] = `Topik Tanpa Judul ${index + 1}`;
                else if (internalFieldName === 'questionText') entry[internalFieldName] = `Pertanyaan Kosong ${index + 1}`;
                else if (internalFieldName === 'kbAnswer') entry[internalFieldName] = `Tidak ada Jawaban KB`;
            } else {
                 entry[internalFieldName as keyof QuestionEntry] = value;
            }
        } else if (internalFieldName === 'previousLlmAnswer') {
            entry[internalFieldName as keyof QuestionEntry] = value || ""; // Optional field
        }
    }

    if (!entry.number || !entry.title || !entry.questionText || entry.kbAnswer === undefined) {
        console.warn(`Melewati baris Excel ${index + 2} karena field penting hilang atau tidak valid setelah parsing.`);
        return null;
    }

    return entry as QuestionEntry;
  }).filter(entry => entry !== null) as QuestionEntry[];
};