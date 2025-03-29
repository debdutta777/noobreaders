'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NovelGrid from '@/app/components/NovelGrid';

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set page title
  useEffect(() => {
    document.title = 'My Library | NoobReaders';
  }, []);

  // Fetch the user's library
  useEffect(() => {
    if (status === 'authenticated') {
      fetchLibrary();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  const fetchLibrary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching user library...");
      const response = await fetch('/api/user/library', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Library data:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch library');
      }

      setNovels(data.novels || []);
    } catch (err) {
      console.error('Error fetching library:', err);
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show login message
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4 dark:text-white">My Library</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please sign in to view your personal library of novels.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">My Library</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 aspect-[2/3] rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchLibrary}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : novels.length > 0 ? (
        <NovelGrid novels={novels} />
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your library is empty. Start adding novels to your reading list!</p>
          <Link
            href="/explore"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Novels
          </Link>
        </div>
      )}
    </div>
  );
} 