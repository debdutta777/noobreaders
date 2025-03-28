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

  // Mock data for demonstration
  const mockUpdates: Novel[] = updates.length > 0 ? updates : [
    {
      _id: '1',
      title: 'The Forgotten Realm',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '101', name: 'J. R. Writer' },
      latestChapter: { 
        _id: 'c1', 
        title: 'Awakening Powers', 
        chapterNumber: 42,
        createdAt: new Date().toISOString()
      }
    },
    {
      _id: '2',
      title: 'Stellar Odyssey',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '102', name: 'A. Stellar' },
      latestChapter: { 
        _id: 'c2', 
        title: 'The Quantum Leap', 
        chapterNumber: 18,
        createdAt: new Date().toISOString()
      }
    },
    {
      _id: '3',
      title: 'Whispers in the Dark',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '103', name: 'M. Shadow' },
      latestChapter: { 
        _id: 'c3', 
        title: 'The Mysterious Note', 
        chapterNumber: 27,
        createdAt: new Date().toISOString()
      }
    },
    {
      _id: '4',
      title: 'Hearts Entwined',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '104', name: 'R. Heart' },
      latestChapter: { 
        _id: 'c4', 
        title: 'Unexpected Reunion', 
        chapterNumber: 35,
        createdAt: new Date().toISOString()
      }
    },
    {
      _id: '5',
      title: 'Dragon's Ascent',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '105', name: 'D. Flame' },
      latestChapter: { 
        _id: 'c5', 
        title: 'The Final Battle', 
        chapterNumber: 50,
        createdAt: new Date().toISOString()
      }
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        {mockUpdates.map((novel, index) => (
          <div 
            key={novel._id}
            className={`flex p-4 ${
              index < mockUpdates.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
            }`}
          >
            <Link href={`/novels/${novel._id}`} className="shrink-0 mr-4">
              <Image 
                src={novel.coverImage} 
                alt={novel.title}
                width={48}
                height={64}
                className="w-12 h-16 object-cover rounded"
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