'use client';

import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut,
  AuthError,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from './firebase';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenDebug, setTokenDebug] = useState<string>('');

  // Primary Auth: Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        console.log('User signed in:', {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        console.log('User signed out');
      }
    });

    return () => unsubscribe();
  }, []);

  // Primary Auth: Token Authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Found token in localStorage, attempting authentication...');
      setTokenDebug(token);
      authenticateWithToken(token);
    }

    // Listen for token updates
    const handleTokenUpdate = () => {
      const newToken = localStorage.getItem('authToken');
      if (newToken) {
        console.log('Token updated in localStorage, re-authenticating...');
        setTokenDebug(newToken);
        authenticateWithToken(newToken);
      }
    };

    window.addEventListener('authTokenUpdated', handleTokenUpdate);
    return () => {
      window.removeEventListener('authTokenUpdated', handleTokenUpdate);
    };
  }, []);

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem('authToken', token);
      setTokenDebug(token);
      console.log('Google sign in successful');
    } catch (error) {
      console.error('Google sign in failed:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Primary Auth: Token Authentication Function
  async function authenticateWithToken(token: string) {
    try {
      setError(null);
      console.log('Starting authentication process...');
      setTokenDebug(token);

      if (!token) {
        throw new Error('No authentication token provided');
      }

      // First attempt to parse and validate the token
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      if (
        !payload.aud ||
        payload.aud !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ) {
        throw new Error('Invalid token audience');
      }

      // Create credential with the ID token
      const credential = GoogleAuthProvider.credential(null, token);
      const result = await signInWithCredential(auth, credential);

      console.log('Authentication successful:', {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        provider: result.user.providerData[0]?.providerId,
        token: token,
      });

      // Store tokens for future use
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Authentication failed:', error);

      // Enhanced error reporting
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          code: (error as AuthError).code,
          stack: error.stack,
        });

        // User-friendly error message based on error type
        if ((error as AuthError).code === 'auth/id-token-expired') {
          setError(
            'The authentication token has expired. Please log in again.'
          );
        } else if ((error as AuthError).code === 'auth/invalid-credential') {
          setError('Invalid authentication credentials. Please try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unknown error occurred');
      }
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      setTokenDebug('');
      console.log('Logged out successfully');
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
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-100 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-left">
                    {user.displayName && (
                      <p className="font-medium text-green-700">
                        {user.displayName}
                      </p>
                    )}
                    <p className="text-sm text-green-600">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>UID: {user.uid}</p>
                <p>Provider: {user.providerData[0]?.providerId}</p>
              </div>
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

        {/* Action Buttons */}
        <div className="border-t pt-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
              disabled={!!user}
            >
              Sign in with Google
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
          <p>Auth State: {user ? 'Authenticated' : 'Not Authenticated'}</p>
          <p>Loading: {loading ? 'True' : 'False'}</p>
          {tokenDebug && (
            <details className="mt-2" open>
              <summary className="font-semibold cursor-pointer">
                Token Info
              </summary>
              <div className="mt-2 space-y-1 p-2 bg-gray-100 rounded">
                <p>
                  Type:{' '}
                  {(() => {
                    try {
                      const payload = JSON.parse(
                        atob(tokenDebug.split('.')[1])
                      );
                      return `${
                        payload.firebase ? 'Firebase' : 'Custom'
                      } ID Token`;
                    } catch {
                      return 'Invalid Token';
                    }
                  })()}
                </p>
                {(() => {
                  try {
                    const payload = JSON.parse(atob(tokenDebug.split('.')[1]));
                    return (
                      <>
                        <p>Email: {payload.email || 'N/A'}</p>
                        <p>
                          Provider:{' '}
                          {payload.firebase?.sign_in_provider || 'N/A'}
                        </p>
                        <p>
                          Expires:{' '}
                          {new Date(payload.exp * 1000).toLocaleString()}
                        </p>
                        <p>Issuer: {payload.iss}</p>
                      </>
                    );
                  } catch {
                    return (
                      <p className="text-red-500">Unable to decode token</p>
                    );
                  }
                })()}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
