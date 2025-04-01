import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDlF8u3xY1sTMMY4GDTZGUluLbCoUNsj7M',
  authDomain: 'galerio-9c2a3.firebaseapp.com',
  projectId: 'galerio-9c2a3',
  storageBucket: 'galerio-9c2a3.firebasestorage.app',
  messagingSenderId: '830227413254',
  appId: '1:830227413254:web:ab6e5e1c1a6d3771508687',
  measurementId: 'G-18XH1R6YWF',
};
// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
