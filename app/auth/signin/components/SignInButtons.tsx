'use client';

import React from 'react';
import { signIn } from 'next-auth/react';

export default function SignInButtons() {
  const handleGoogleSignIn = React.useCallback(() => {
    signIn('google');
  }, []);
  
  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
    >
      <span className="sr-only">Sign in with Google</span>
      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
      </svg>
      <span className="ml-2">Google</span>
    </button>
  );
} 