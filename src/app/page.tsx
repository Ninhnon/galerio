'use client';

import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  AuthError,
} from 'firebase/auth';
import { auth } from './firebase';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Primary Auth: Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      console.log(user ? 'User is signed in' : 'User is signed out');
    });

    return () => unsubscribe();
  }, []);

  // Primary Auth: Custom Token Authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authenticateWithFirebase(token);
    }

    // Listen for token updates
    const handleTokenUpdate = () => {
      const newToken = localStorage.getItem('authToken');
      if (newToken) {
        authenticateWithFirebase(newToken);
      }
    };

    window.addEventListener('authTokenUpdated', handleTokenUpdate);
    return () => {
      window.removeEventListener('authTokenUpdated', handleTokenUpdate);
    };
  }, []);

  // Primary Auth: Custom Token Authentication Function
  async function authenticateWithFirebase(token: string) {
    try {
      setError(null);
      await signInWithCustomToken(auth, token);
      console.log('User signed in successfully with custom token!');
    } catch (error) {
      console.error('Firebase custom token authentication failed:', error);
      setError('Custom token authentication failed. Please try again.');
    }
  }

  // Secondary Auth: Email/Password Authentication
  const handleTestLogin = async () => {
    console.log('Attempting test login...');
    try {
      setError(null);
      setLoading(true);
      const credential = await signInWithEmailAndPassword(
        auth,
        'test@example.com',
        'testpassword123'
      );
      console.log('Test login successful:', credential.user.email);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Test authentication failed:', authError);
      setError(
        authError.message || 'Test authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken'); // Clear stored token
      console.log('Signed out successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign out failed:', authError);
      setError(authError.message || 'Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Firebase WebView Auth
        </h1>

        {/* Primary Authentication Status */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Primary Auth Status</h2>
          {user ? (
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-green-700">Logged in as: {user.email}</p>
              <p className="text-sm text-green-600 mt-1">UID: {user.uid}</p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700">Not logged in</p>
              <p className="text-sm text-yellow-600 mt-1">
                Waiting for authentication...
              </p>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Test Controls
          </h2>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleTestLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
              disabled={!!user}
            >
              Test Login
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
              disabled={!user}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6">
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p>
            Auth Method:{' '}
            {localStorage.getItem('authToken') ? 'Custom Token' : 'Test Login'}
          </p>
          <p>Auth State: {user ? 'Authenticated' : 'Not Authenticated'}</p>
          <p>Loading: {loading ? 'True' : 'False'}</p>
        </div>
      </div>
    </div>
  );
}
