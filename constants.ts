export const DEFAULT_EVALUATION_PROMPT = `Kriteria utama untuk 'Jawaban LLM yang Diberikan': Jawaban harus benar secara faktual, sangat relevan dengan 'Pertanyaan Lengkap', ringkas, dan diartikulasikan dengan jelas. Jawaban harus secara langsung menjawab pertanyaan yang diajukan secara komprehensif. Hindari konten yang berbahaya, bias, atau tidak pantas. Pastikan nadanya netral dan profesional. Bandingkan juga (jika relevan) dengan 'Jawaban KB yang Diberikan' sebagai konteks. Berikan skor numerik yang mencerminkan kualitas 'Jawaban LLM yang Diberikan'.`;

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

// Header yang diharapkan dalam file CSV/Excel
export const EXPECTED_HEADERS_INDONESIAN = ['nomor', 'title', 'pertanyaan', 'jawaban kb', 'jawaban llm'];
export const EXPECTED_HEADERS_TYPE_MAPPING = {
  nomor: 'number',
  title: 'title',
  pertanyaan: 'questionText',
  'jawaban kb': 'kbAnswer', // Akan jadi konteks
  'jawaban llm': 'previousLlmAnswer' // Akan dievaluasi
};


export const SAMPLE_CSV_CONTENT = `${EXPECTED_HEADERS_INDONESIAN.join(',')}
"101","Ibu Kota Negara","Apa ibu kota Prancis?","Paris adalah pusat budaya dan sejarah Eropa. Kota ini dikenal dengan Menara Eiffel dan Museum Louvre.","Paris adalah jawabannya."
"102","Teori Fisika","Jelaskan teori relativitas secara sederhana.","Teori relativitas Einstein mengubah pemahaman kita tentang ruang, waktu, dan gravitasi. Ini terdiri dari relativitas khusus dan umum.","Relativitas menghubungkan ruang dan waktu."
"103","Dasar Warna","Apa saja warna primer?","Dalam model warna subtraktif (seperti cat), warna primer adalah merah, kuning, dan biru.","Merah, kuning, biru."
"104","Karya Sastra","Siapa yang menulis 'Hamlet'?","'Hamlet' adalah sebuah tragedi terkenal yang ditulis oleh dramawan Inggris legendaris, William Shakespeare, sekitar tahun 1600.","William Shakespeare."
"105","Rumus Kimia","Apa itu H2O?","H2O adalah rumus kimia untuk air, yang menunjukkan bahwa setiap molekul air terdiri dari dua atom hidrogen (H) dan satu atom oksigen (O).","Air."`;

export const SAMPLE_EXCEL_DATA_ROWS = [
  EXPECTED_HEADERS_INDONESIAN,
  ["101","Ibu Kota Negara","Apa ibu kota Prancis?","Paris adalah pusat budaya dan sejarah Eropa. Kota ini dikenal dengan Menara Eiffel dan Museum Louvre.","Paris adalah jawabannya."],
  ["102","Teori Fisika","Jelaskan teori relativitas secara sederhana.","Teori relativitas Einstein mengubah pemahaman kita tentang ruang, waktu, dan gravitasi. Ini terdiri dari relativitas khusus dan umum.","Relativitas menghubungkan ruang dan waktu."],
  ["103","Dasar Warna","Apa saja warna primer?","Dalam model warna subtraktif (seperti cat), warna primer adalah merah, kuning, dan biru.","Merah, kuning, biru."],
  ["104","Karya Sastra","Siapa yang menulis 'Hamlet'?","'Hamlet' adalah sebuah tragedi terkenal yang ditulis oleh dramawan Inggris legendaris, William Shakespeare, sekitar tahun 1600.","William Shakespeare."],
  ["105","Rumus Kimia","Apa itu H2O?","H2O adalah rumus kimia untuk air, yang menunjukkan bahwa setiap molekul air terdiri dari dua atom hidrogen (H) dan satu atom oksigen (O).","Air."]
];

export const EXCEL_FORMAT_INFO = `Untuk file Excel (.xlsx), pastikan sheet pertama berisi data dengan header yang sama seperti CSV: ${EXPECTED_HEADERS_INDONESIAN.join(', ')}. Setiap baris setelah header akan dianggap sebagai entri pertanyaan.`;
export const MAX_HISTORY_ENTRIES = 50;
export const HISTORY_STORAGE_KEY = 'hakimLlmHistory';
