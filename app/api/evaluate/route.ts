import { NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EvaluationResult } from '@/types';
import { GEMINI_MODEL_TEXT } from '@/constants';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ 
        isAppropriate: false,
        score: 0,
        justification: "Kunci API Gemini tidak dikonfigurasi di server.",
        error: "Kunci API server hilang",
        llmSuggestedAnswer: undefined,
        evaluationDurationMs: 0,
     }, { status: 500 });
  }

  let ai: GoogleGenAI;
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (initError: any) {
    console.error("Kesalahan inisialisasi GoogleGenAI:", initError);
    return NextResponse.json({ 
        isAppropriate: false,
        score: 0,
        justification: "Kesalahan saat menginisialisasi layanan AI di server.",
        error: "Kesalahan inisialisasi AI",
        llmSuggestedAnswer: undefined,
        evaluationDurationMs: 0,
     }, { status: 500 });
  }


  try {
    const body = await request.json();
    const { 
        questionText, 
        llmAnswerToEvaluate, 
        kbAnswerAsContext, 
        customEvaluationPrompt 
    } = body;

    if (!questionText || !customEvaluationPrompt) {
        return NextResponse.json({ error: "Parameter yang dibutuhkan hilang (questionText, customEvaluationPrompt)." }, { status: 400 });
    }
    
    const effectiveLlmAnswer = llmAnswerToEvaluate && llmAnswerToEvaluate.trim() !== "" ? llmAnswerToEvaluate : "Tidak ada jawaban yang diberikan.";

    // Konsol log untuk debugging input yang diterima server
    // console.log("Menerima untuk evaluasi:", { questionText, effectiveLlmAnswer, kbAnswerAsContext, customEvaluationPrompt });

    const systemInstruction = `Anda adalah seorang hakim ahli yang bertugas mengevaluasi 'Jawaban LLM yang Diberikan' (yang berasal dari input pengguna) terhadap 'Pertanyaan Lengkap'.
'Jawaban KB yang Diberikan' juga disediakan sebagai konteks atau pembanding kualitas.

Kriteria Evaluasi Utama untuk 'Jawaban LLM yang Diberikan' (selain kriteria di bawah dari pengguna):
- Akurasi Faktual: Apakah informasi yang diberikan benar?
- Relevansi: Apakah jawaban tersebut langsung menjawab 'Pertanyaan Lengkap'?
- Kelengkapan: Apakah jawaban tersebut mencakup aspek-aspek penting dari pertanyaan?
- Kejelasan dan Keringkasan: Apakah jawaban mudah dipahami dan langsung ke pokok permasalahan?
- Nada: Apakah nada jawaban netral dan profesional?

Kriteria Tambahan dari Pengguna:
${customEvaluationPrompt}

Detail untuk Evaluasi:
Pertanyaan Lengkap: "${questionText}"
Jawaban KB yang Diberikan (Konteks/Referensi): "${kbAnswerAsContext}"
Jawaban LLM yang Diberikan (Untuk Dievaluasi): "${effectiveLlmAnswer}"

Tugas Anda:
1.  Nilai 'Jawaban LLM yang Diberikan'. Apakah jawaban tersebut sesuai dan berkualitas tinggi untuk 'Pertanyaan Lengkap', dengan mempertimbangkan juga 'Jawaban KB yang Diberikan' sebagai konteks?
2.  Berikan skor numerik antara 0.0 (sangat buruk/tidak relevan/salah) hingga 1.0 (sangat baik/akurat/lengkap/ideal) untuk 'Jawaban LLM yang Diberikan'. Skor harus mencerminkan kualitas keseluruhan jawaban terhadap pertanyaan.
3.  Berikan justifikasi yang ringkas untuk penilaian dan skor Anda. Jelaskan mengapa 'Jawaban LLM yang Diberikan' mendapatkan skor tersebut, dan bagaimana perbandingannya dengan 'Jawaban KB yang Diberikan' jika itu relevan dalam penilaian Anda.
4.  Jika 'Jawaban LLM yang Diberikan' bisa diperbaiki atau jika Anda bisa memberikan jawaban yang lebih ideal terhadap 'Pertanyaan Lengkap', berikan saran jawaban tersebut dalam field 'llmSuggestedAnswer'. Jika 'Jawaban LLM yang Diberikan' sudah ideal atau tidak ada saran signifikan, Anda bisa mengosongkan field 'llmSuggestedAnswer' atau mengisinya dengan string kosong.

Hanya respon dengan objek JSON dengan field berikut (pastikan semua field ada):
- "isAppropriate": boolean (berikan penilaian Anda apakah 'Jawaban LLM yang Diberikan' secara umum dianggap sesuai atau dapat diterima untuk 'Pertanyaan Lengkap')
- "score": number (skor numerik antara 0.0 dan 1.0, HARUS berupa angka)
- "justification": string (penjelasan untuk penilaian dan skor Anda)
- "llmSuggestedAnswer": string (Saran perbaikan atau jawaban ideal dari LLM untuk 'Pertanyaan Lengkap'. String kosong jika tidak ada saran.)
`;
    const startTime = Date.now();
    let durationMs = 0;

    const genAIResponse: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: systemInstruction, // Promptnya sekarang adalah `systemInstruction`
        config: {
            responseMimeType: "application/json",
            temperature: 0.2, 
            topP: 0.85,
            topK: 40,
        }
    });
    durationMs = Date.now() - startTime;

    let jsonStr = genAIResponse.text.trim();
    const fenceRegex = /^```(json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // console.log("Raw JSON string dari LLM:", jsonStr); // Debugging
    const parsedData = JSON.parse(jsonStr);
    // console.log("Parsed data dari LLM:", parsedData); // Debugging


    if (
        typeof parsedData.score !== 'number' || 
        isNaN(parsedData.score) || 
        parsedData.score < 0 || parsedData.score > 1 || 
        typeof parsedData.justification !== 'string' ||
        typeof parsedData.llmSuggestedAnswer !== 'string'
        // typeof parsedData.isAppropriate !== 'boolean' // Dihapus karena LLM tidak selalu memberi ini dengan benar
    ) {
      console.error("Respons LLM tidak dalam format JSON yang diharapkan atau nilai skor/suggestedAnswer tidak valid:", parsedData);
      throw new Error("Respons LLM tidak dalam format JSON yang diharapkan atau nilai skor/suggestedAnswer tidak valid.");
    }
    
    // Client-side logic for isAppropriate determination based on score
    const clientDeterminedIsAppropriate = parsedData.score >= 0.8;

    const result: EvaluationResult = {
      isAppropriate: clientDeterminedIsAppropriate,
      score: parsedData.score,
      justification: parsedData.justification,
      llmSuggestedAnswer: parsedData.llmSuggestedAnswer.trim() !== "" ? parsedData.llmSuggestedAnswer : undefined,
      evaluationDurationMs: durationMs,
    };
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Kesalahan pada API Route evaluasi:", error);
    const errorMessage = error.message || "Terjadi kesalahan yang tidak diketahui selama evaluasi LLM di server.";
    return NextResponse.json({ 
        isAppropriate: false,
        score: 0,
        justification: `Gagal mendapatkan evaluasi dari LLM. Server: ${errorMessage}`,
        error: errorMessage,
        llmSuggestedAnswer: undefined,
        evaluationDurationMs: error.evaluationDurationMs || 0, 
     }, { status: 500 });
  }
}
