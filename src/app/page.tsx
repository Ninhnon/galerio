'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleAuthToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        await authenticateWithFirebase(token);
      }
    };

    const handleTokenUpdate = () => {
      const newToken = localStorage.getItem('authToken');
      if (newToken) {
        authenticateWithFirebase(newToken);
      }
    };

    handleAuthToken();
    window.addEventListener('authTokenUpdated', handleTokenUpdate);

    return () => {
      window.removeEventListener('authTokenUpdated', handleTokenUpdate);
    };
  }, []);

  async function authenticateWithFirebase(token: string) {
    try {
      setError(null);
      setLoading(true);
      await signInWithCustomToken(auth, token);
      console.log('User signed in successfully!');
    } catch (error) {
      console.error('Firebase authentication failed:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
          Firebase Authentication
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="text-center">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-green-700 font-semibold">
                  Logged in successfully!
                </p>
                <p className="text-sm text-green-600">{user.email}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <p className="text-gray-600 text-sm">User ID: {user.uid}</p>
                {user.emailVerified && (
                  <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                    Verified Email
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700">Not logged in</p>
              <p className="text-sm text-yellow-600 mt-2">
                Waiting for authentication...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
