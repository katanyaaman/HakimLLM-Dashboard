import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB2dlQPYsfEI5GhP1cADFrYvisjh82zrnI",
  authDomain: "hakimllm.firebaseapp.com",
  projectId: "hakimllm",
  storageBucket: "hakimllm.firebaseapp.com",
  messagingSenderId: "417342312309",
  appId: "1:417342312309:web:92b82de996b204b79b0d3c",
  measurementId: "G-G9WR9WESZH"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { auth, signInWithGoogle, logOut, onAuthStateChanged, type User };
export type { User as FirebaseUser }; // Alias User to FirebaseUser to avoid naming conflicts if needed
