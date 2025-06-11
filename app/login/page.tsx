'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, auth, FirebaseUser } from '@/services/firebaseService'; // Ensure FirebaseUser is imported if used
import { useSharedState } from '@/context/SharedStateContext';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, currentUser } = useSharedState();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in (e.g. from a previous session restored by Firebase), redirect them.
    if (currentUser) {
      router.replace('/proyek');
    }
  }, [currentUser, router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        // setCurrentUser will be called by onAuthStateChanged in Layout,
        // but we can preemptively redirect.
        router.replace('/proyek');
      } else {
        // This case should ideally not happen if signInWithGoogle resolves with a user
        setError('Login gagal. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login dibatalkan. Jendela login ditutup.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Permintaan login dibatalkan. Hanya satu jendela login yang diizinkan pada satu waktu.');
      }
       else {
        setError('Login gagal. Terjadi kesalahan. Periksa konsol untuk detail.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prevent rendering login page if user is already known
  if (currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <p className="text-slate-700">Mengarahkan...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-500 to-blue-600 p-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-700 mb-3">HAKIM LLM</h1>
        <p className="text-slate-600 mb-8 text-sm sm:text-base">
          Silakan login untuk mengakses fitur evaluasi LLM.
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-sm">
            {error}
          </p>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-6 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            <>
              <GoogleIcon />
              Login dengan Google
            </>
          )}
        </button>
        <p className="text-xs text-slate-500 mt-8">
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
        </p>
      </div>
       <footer className="mt-8 text-center">
        <p className="text-xs text-sky-100">
          &copy; {new Date().getFullYear()} HAKIM LLM. All rights reserved.
        </p>
      </footer>
    </div>
  );
}