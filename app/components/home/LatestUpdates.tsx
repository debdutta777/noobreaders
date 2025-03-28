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
  latestChapter: Chapter;
}

const LatestUpdates = () => {
  const [updates, setUpdates] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const fallbackImage = '/images/placeholder-cover.jpg';

  useEffect(() => {
    const fetchLatestUpdates = async () => {
      try {
        const response = await fetch('/api/novels/latest-updates');
        if (!response.ok) throw new Error('Failed to fetch latest updates');
        const data = await response.json();
        setUpdates(data);
      } catch (error) {
        console.error('Error fetching latest updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUpdates();
  }, []);

  const handleImageError = (novelId: string) => {
    setImageErrors(prev => ({ ...prev, [novelId]: true }));
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

  if (updates.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No recent updates found.</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {updates.map((novel, index) => (
          <div 
            key={novel._id}
            className={`flex p-4 ${
              index < updates.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
            }`}
          >
            <Link href={`/novels/${novel._id}`} className="shrink-0 mr-4">
              <Image 
                src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                alt={novel.title}
                width={48}
                height={64}
                className="w-12 h-16 object-cover rounded"
                onError={() => handleImageError(novel._id)}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFDwIBYTgbwwAAAABJRU5ErkJggg=="
              />
            </Link>
            <div className="flex-1">
              <Link href={`/novels/${novel._id}`}>
                <h3 className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                  {novel.title}
                </h3>
              </Link>
              <Link href={`/profile/${novel.author._id}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {novel.author.name}
                </p>
              </Link>
              <div className="flex justify-between items-center mt-2">
                <Link 
                  href={`/novels/${novel._id}/chapter/${novel.latestChapter._id}`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Chapter {novel.latestChapter.chapterNumber}: {novel.latestChapter.title}
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(novel.latestChapter.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestUpdates; 