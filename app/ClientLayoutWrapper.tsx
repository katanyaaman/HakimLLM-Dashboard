
'use client'; // Ini adalah Client Component

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import HeaderBar from "@/components/HeaderBar";
import { useSharedState } from '@/context/SharedStateContext';
import { auth, onAuthStateChanged, FirebaseUser } from '@/services/firebaseService';

// Logika AuthWrapper dipindahkan ke sini
function AuthWrapperInternal({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useSharedState();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user as FirebaseUser | null);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [setCurrentUser]);

  useEffect(() => {
    if (isLoadingAuth) return; // Jangan redirect sampai status auth diketahui

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

  // Jika belum login dan tidak di halaman login, children mungkin render sebentar sebelum redirect.
  // Pastikan children hanya render jika kondisi auth terpenuhi.
  if (!currentUser && pathname !== '/login') {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700">Mengarahkan ke halaman login...</p>
      </div>
    );
  }
  
  // Render layout utama aplikasi atau konten halaman login
  if (pathname === '/login') {
    return <>{children}</>; // Halaman login memiliki layout penuh sendiri
  }

  // Struktur aplikasi utama untuk pengguna yang terautentikasi
  return (
    <div className="h-screen flex flex-col">
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ClientLayoutWrapper akan menggunakan AuthWrapperInternal
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AuthWrapperInternal>{children}</AuthWrapperInternal>;
}
