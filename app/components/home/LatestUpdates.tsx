'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  createdAt: string;
}

interface Novel {
  _id: string;
  title: string;
  coverImage: string;
  author: {
    _id: string;
    name: string;
  };
  latestChapter?: Chapter;
  createdAt?: string;
}

type TabType = 'chapters' | 'novels';

const LatestUpdates = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chapters');
  const [latestChapters, setLatestChapters] = useState<Novel[]>([]);
  const [newNovels, setNewNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const fallbackImage = '/images/placeholder-cover.jpg';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch latest chapter updates
        const chaptersResponse = await fetch('/api/novels/latest-updates', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!chaptersResponse.ok) {
          throw new Error(`Failed to fetch latest updates: ${chaptersResponse.status} ${chaptersResponse.statusText}`);
        }
        
        const chaptersData = await chaptersResponse.json();
        
        if (chaptersData && Array.isArray(chaptersData.novels)) {
          setLatestChapters(chaptersData.novels);
        } else {
          console.error('Invalid data format for chapters:', chaptersData);
          setLatestChapters([]);
        }

        // Fetch newly created novels
        const novelsResponse = await fetch('/api/novels/new', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!novelsResponse.ok) {
          throw new Error(`Failed to fetch new novels: ${novelsResponse.status} ${novelsResponse.statusText}`);
        }
        
        const novelsData = await novelsResponse.json();
        
        if (novelsData && Array.isArray(novelsData.novels)) {
          setNewNovels(novelsData.novels);
        } else {
          console.error('Invalid data format for new novels:', novelsData);
          setNewNovels([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleImageError = (novelId: string) => {
    setImageErrors(prev => ({ ...prev, [novelId]: true }));
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse flex py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-gray-200 dark:bg-gray-700 h-16 w-12 rounded mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
        </div>
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

  const renderNoContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <p className="text-gray-600 dark:text-gray-400">
        {activeTab === 'chapters' ? 'No recent chapter updates found.' : 'No new novels found.'}
      </p>
    </div>
  );

  const renderChaptersTab = () => {
    if (!latestChapters || latestChapters.length === 0) {
      return renderNoContent();
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {latestChapters.map((novel, index) => (
          <div 
            key={novel._id || index}
            className={`flex p-4 ${
              index < latestChapters.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
            }`}
          >
            <Link href={`/novels/${novel._id}`} className="shrink-0 mr-4">
              <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden">
                {novel.coverImage && (
                  <Image 
                    src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                    alt={novel.title || 'Novel cover'}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-cover rounded"
                    onError={() => handleImageError(novel._id)}
                    unoptimized
                  />
                )}
              </div>
            </Link>
            <div className="flex-1">
              <Link href={`/novels/${novel._id}`}>
                <h3 className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                  {novel.title || 'Untitled Novel'}
                </h3>
              </Link>
              <Link href={`/profile/${novel.author?._id || '#'}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {novel.author?.name || 'Unknown Author'}
                </p>
              </Link>
              {novel.latestChapter && (
                <div className="flex justify-between items-center mt-2">
                  <Link 
                    href={`/novels/${novel._id}/chapter/${novel.latestChapter._id}`}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Chapter {novel.latestChapter.chapterNumber || '?'}: {novel.latestChapter.title || 'New Chapter'}
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(novel.latestChapter.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNovelsTab = () => {
    if (!newNovels || newNovels.length === 0) {
      return renderNoContent();
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {newNovels.map((novel, index) => (
          <div 
            key={novel._id || index}
            className={`flex p-4 ${
              index < newNovels.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
            }`}
          >
            <Link href={`/novels/${novel._id}`} className="shrink-0 mr-4">
              <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden">
                {novel.coverImage && (
                  <Image 
                    src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                    alt={novel.title || 'Novel cover'}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-cover rounded"
                    onError={() => handleImageError(novel._id)}
                    unoptimized
                  />
                )}
              </div>
            </Link>
            <div className="flex-1">
              <Link href={`/novels/${novel._id}`}>
                <h3 className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                  {novel.title || 'Untitled Novel'}
                </h3>
              </Link>
              <Link href={`/profile/${novel.author?._id || '#'}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {novel.author?.name || 'Unknown Author'}
                </p>
              </Link>
              <div className="flex justify-end items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(novel.createdAt || '')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
        <Link 
          href="/latest" 
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'chapters'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('chapters')}
        >
          Recent Chapters
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'novels'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('novels')}
        >
          New Novels
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'chapters' ? renderChaptersTab() : renderNovelsTab()}
    </section>
  );
};

export default LatestUpdates; 