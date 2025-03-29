'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ReadingItem {
  _id: string;
  novelId: {
    _id: string;
    title: string;
    coverImage: string;
    author: {
      _id: string;
      name: string;
    };
  };
  lastReadChapter: {
    _id: string;
    title: string;
    chapterNumber: number;
  };
  readingProgress: number;
  updatedAt: string;
}

interface ContinueReadingProps {
  userId: string;
}

const ContinueReading = ({ userId }: ContinueReadingProps) => {
  const [readingList, setReadingList] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const fallbackImage = '/images/placeholder-cover.jpg';

  useEffect(() => {
    // Don't try to fetch if userId is not provided
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchReadingList = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/users/${userId}/reading-list?limit=5`, {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reading list: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setReadingList(data);
        } else if (data && Array.isArray(data.novels)) {
          setReadingList(data.novels);
        } else {
          console.log('Received empty or invalid data format:', data);
          setReadingList([]);
        }
      } catch (error) {
        console.error('Error fetching reading list:', error);
        setError('Failed to load your reading list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReadingList();
  }, [userId]);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Continue Reading</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md animate-pulse h-32"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Continue Reading</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <p className="mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!readingList || readingList.length === 0) {
    return null; // Don't show the section if there's nothing to continue reading
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Reading</h2>
        <Link
          href="/library"
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          View Library
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {readingList.map((item, index) => {
          if (!item || !item.novelId) return null;
          
          return (
            <div
              key={item._id || index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex"
            >
              <Link href={`/novels/${item.novelId._id}`} className="shrink-0">
                <div className="relative w-20 h-full bg-gray-100">
                  {item.novelId.coverImage && (
                    <Image
                      src={imageErrors[item._id] ? fallbackImage : item.novelId.coverImage}
                      alt={item.novelId.title || 'Novel cover'}
                      width={80}
                      height={120}
                      className="w-20 h-full object-cover"
                      onError={() => handleImageError(item._id)}
                      unoptimized
                    />
                  )}
                </div>
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/novels/${item.novelId._id}`}>
                      <h3 className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                        {item.novelId.title || 'Untitled Novel'}
                      </h3>
                    </Link>
                    {item.novelId.author && (
                      <Link href={`/profile/${item.novelId.author._id || '#'}`}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          by {item.novelId.author.name || 'Unknown Author'}
                        </p>
                      </Link>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${item.readingProgress || 0}%` }}
                  ></div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.readingProgress || 0}% complete
                  </span>
                  <Link
                    href={item.lastReadChapter ? 
                      `/novels/${item.novelId._id}/chapter/${item.lastReadChapter._id}` : 
                      `/novels/${item.novelId._id}`}
                    className="px-4 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-900 transition-colors"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueReading; 