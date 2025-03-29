'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NovelCard from '../novel/NovelCard';

interface Author {
  _id: string;
  name: string;
}

interface Novel {
  _id: string;
  title: string;
  coverImage: string;
  author: Author;
  views: number;
  description?: string;
}

function getPeriodTitle(period: string): string {
  switch (period) {
    case 'day':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'year':
      return 'This Year';
    default:
      return 'This Week';
  }
}

export default function PopularNovels() {
  const [period, setPeriod] = useState('week');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = React.useState<{[key: string]: boolean}>({});
  const fallbackImage = '/images/placeholder-cover.jpg';

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  useEffect(() => {
    const fetchPopularNovels = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/novels/popular?period=${period}`, {
          cache: 'no-store',
          next: { revalidate: 60 }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch popular novels: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        if (data && Array.isArray(data.novels)) {
          setNovels(data.novels);
        } else {
          console.error('Invalid data format:', data);
          if (data && data.error) {
            setError(data.error);
          } else {
            setError('Received invalid data format from server');
          }
          setNovels([]);
        }
      } catch (error) {
        console.error('Error fetching popular novels:', error);
        setError('Failed to load popular novels. Please try again later.');
        setNovels([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularNovels();
  }, [period]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Popular Novels {getPeriodTitle(period)}</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('day')}
            className={`px-3 py-1 text-sm rounded-full ${
              period === 'day' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-sm rounded-full ${
              period === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-sm rounded-full ${
              period === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : novels && novels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {novels.map((novel) => (
            <div key={novel._id} className="flex flex-col">
              <Link href={`/novels/${novel._id}`} className="group">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg mb-2">
                  <Image
                    src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                    alt={novel.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAOwbMi3aQAAAABJRU5ErkJggg=="
                    onError={() => handleImageError(novel._id)}
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                  {novel.title}
                </h3>
              </Link>
              <p className="text-xs text-gray-600 mt-1">
                {novel.author?.name || 'Unknown Author'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No popular novels found for this time period.</p>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Link 
          href="/explore" 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Novels &rarr;
        </Link>
      </div>
    </section>
  );
} 