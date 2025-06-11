
import { QuestionEntry } from '@/types';
import { EXPECTED_HEADERS_INDONESIAN, EXPECTED_HEADERS_TYPE_MAPPING } from '@/constants';

export const parseCSV = (csvContent: string): QuestionEntry[] => {
  const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) { // Header + at least one data row
    throw new Error("CSV harus memiliki baris header dan setidaknya satu baris data.");
  }

  const headerLine = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const missingHeaders = EXPECTED_HEADERS_INDONESIAN.filter(eh => !headerLine.includes(eh));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV kekurangan header wajib: ${missingHeaders.join(', ')}. Header yang ditemukan: ${headerLine.join(', ')}`);
  }

  const headerIndices: { [key: string]: number } = {};
  EXPECTED_HEADERS_INDONESIAN.forEach(headerName => {
    headerIndices[headerName] = headerLine.indexOf(headerName);
  });

  const dataRows = lines.slice(1);
  return dataRows.map((line, index) => {
    // Improved CSV line parsing to handle quoted fields with commas
    const smartValues: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            // If the next char is also a quote, it's an escaped quote
            if (inQuotes && i + 1 < line.length && line[i+1] === '"') {
                currentField += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            smartValues.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    smartValues.push(currentField.trim());


    // Check if all required headers are present in this row by checking indices
    // This check also helps identify rows with fewer columns than expected based on header
    const maxIndex = Math.max(...Object.values(headerIndices));
    if (smartValues.length <= maxIndex ) {
        console.warn(`Melewati baris CSV ${index + 2} karena jumlah kolom tidak mencukupi atau format salah. Diharapkan setidaknya ${maxIndex + 1} kolom berdasarkan header, didapatkan ${smartValues.length}. Baris: "${line}"`);
        return null;
    }
    
    const entry: Partial<QuestionEntry> = { id: crypto.randomUUID() };
    let validEntry = true;

    for (const headerName of EXPECTED_HEADERS_INDONESIAN) {
        const internalFieldName = EXPECTED_HEADERS_TYPE_MAPPING[headerName as keyof typeof EXPECTED_HEADERS_TYPE_MAPPING];
        const value = smartValues[headerIndices[headerName]]?.trim();

        if (internalFieldName === 'number' || internalFieldName === 'title' || internalFieldName === 'questionText' || internalFieldName === 'kbAnswer') {
            if (!value) { // previousLlmAnswer is handled in the else if, this block implies it's not previousLlmAnswer
                 // For now, providing default if essentially required fields are empty
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
    
    // Final check for essential fields that should not have defaulted to placeholder if they were actually missing entirely.
    if (!entry.number || !entry.title || !entry.questionText || entry.kbAnswer === undefined) {
        console.warn(`Melewati baris CSV ${index + 2} karena field penting hilang atau tidak valid setelah parsing. Baris: "${line}"`);
        return null;
    }


    return entry as QuestionEntry;
  }).filter(entry => entry !== null) as QuestionEntry[];
};