
import type Metadata from 'next'; // Import tipe Metadata
import "./globals.css";
import { SharedStateProvider } from '@/context/SharedStateContext';
import ClientLayoutWrapper from './ClientLayoutWrapper'; // Komponen baru untuk logika klien

// Metadata diekspor dari Server Component
export const metadata: Metadata = {
  title: "HAKIM LLM",
  description: "Aplikasi untuk mengevaluasi jawaban menggunakan LLM (Gemini API) berdasarkan kriteria yang ditentukan pengguna. Mendukung unggah CSV untuk pertanyaan dan jawaban, serta ekspor HTML untuk laporan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="text-slate-900 transition-colors duration-300">
        <SharedStateProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </SharedStateProvider>
      </body>
    </html>
  );
}