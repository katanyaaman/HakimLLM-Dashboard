'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import HeaderBar from "@/components/HeaderBar";
import { SharedStateProvider, useSharedState } from '@/context/SharedStateContext';
import { auth, onAuthStateChanged, FirebaseUser } from '@/services/firebaseService'; // Ensure FirebaseUser is imported

// Metadata can be static or dynamic. For dynamic, use generateMetadata.
// Since this layout needs to be a client component for auth, static object is fine.
export const metadata = {
  title: "HAKIM LLM",
  description: "Aplikasi untuk mengevaluasi jawaban menggunakan LLM (Gemini API) berdasarkan kriteria yang ditentukan pengguna. Mendukung unggah CSV untuk pertanyaan dan jawaban, serta ekspor HTML untuk laporan.",
};

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useSharedState();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user as FirebaseUser | null); // Cast to FirebaseUser
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [setCurrentUser]);

  useEffect(() => {
    if (isLoadingAuth) return; // Don't redirect until auth state is known

    const isAuthPage = pathname === '/login';

    if (!currentUser && !isAuthPage) {
      router.replace('/login');
    } else if (currentUser && isAuthPage) {
      router.replace('/proyek');
    }
  }, [currentUser, pathname, router, isLoadingAuth]);

  if (isLoadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-600"></div>
        <p className="ml-4 text-slate-700 text-lg">Memverifikasi sesi Anda...</p>
      </div>
    );
  }

  // If not logged in and not on login page, children might render briefly before redirect.
  // So, ensure children are only rendered if auth conditions are met.
  if (!currentUser && pathname !== '/login') {
     // This state should ideally be caught by the redirect, but as a fallback.
    return (
        <div className="h-screen flex items-center justify-center bg-slate-100">
             <p className="text-slate-700">Mengarahkan ke halaman login...</p>
        </div>
    );
  }

  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="text-slate-900 transition-colors duration-300">
        <SharedStateProvider>
          <AuthWrapper>
            {/* The main app structure is rendered only if AuthWrapper allows it */}
            {(
              usePathname() !== '/login' ? (
                <div className="h-screen flex flex-col">
                  <HeaderBar />
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
                      {children}
                    </main>
                  </div>
                </div>
              ) : (
                // Directly render children for the login page, as it has its own full-page layout
                children
              )
            )}
          </AuthWrapper>
        </SharedStateProvider>
      </body>
    </html>
  );
}