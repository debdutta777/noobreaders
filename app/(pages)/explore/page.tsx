'use client';

import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
import NovelGrid from '@/app/components/NovelGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Novels | NoobReaders',
  description: 'Discover new novels and stories on NoobReaders',
};

export default function ExplorePage() {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Use window.location.origin to get the base URL of the application
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/novels/featured`, {
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch novel data');
        }

        const data = await response.json();
        if (data && Array.isArray(data.novels)) {
          setNovels(data.novels);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching novel data:', error);
        setError('Failed to load novels. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNovels();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Novels</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 aspect-[2/3] rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : novels && novels.length > 0 ? (
        <NovelGrid novels={novels} />
      ) : (
        <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No novels found. Our library is being updated. Check back later!</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
} 