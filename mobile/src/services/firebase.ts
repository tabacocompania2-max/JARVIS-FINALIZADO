import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMH-9l-4OluV9VZOAqwwxvCuAvQwO09is",
  authDomain: "jarvis-web-5121d.firebaseapp.com",
  projectId: "jarvis-web-5121d",
  storageBucket: "jarvis-web-5121d.firebasestorage.app",
  messagingSenderId: "672926377053",
  appId: "1:672926377053:web:3648435b99c0e0084c59b4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function registerUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

export async function getAuthToken() {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
}
