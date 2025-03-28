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

  useEffect(() => {
    const fetchReadingList = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/reading-list?limit=5`);
        if (!response.ok) throw new Error('Failed to fetch reading list');
        const data = await response.json();
        setReadingList(data);
      } catch (error) {
        console.error('Error fetching reading list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadingList();
  }, [userId]);

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

  if (readingList.length === 0) {
    return null; // Don't show the section if there's nothing to continue reading
  }

  // Mock data for demonstration
  const mockReadingList: ReadingItem[] = readingList.length > 0 ? readingList : [
    {
      _id: 'lib1',
      novelId: {
        _id: '1',
        title: 'The Forgotten Realm',
        coverImage: 'https://via.placeholder.com/300x400',
        author: { _id: '101', name: 'J. R. Writer' }
      },
      lastReadChapter: {
        _id: 'ch15',
        title: 'The Ancient Tower',
        chapterNumber: 15
      },
      readingProgress: 32,
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'lib2',
      novelId: {
        _id: '2',
        title: 'Stellar Odyssey',
        coverImage: 'https://via.placeholder.com/300x400',
        author: { _id: '102', name: 'A. Stellar' }
      },
      lastReadChapter: {
        _id: 'ch8',
        title: 'The Quantum Gate',
        chapterNumber: 8
      },
      readingProgress: 45,
      updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ];

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Reading</h2>
        <Link
          href="/library"
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          View Library
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockReadingList.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex"
          >
            <Link href={`/novels/${item.novelId._id}`} className="shrink-0">
              <Image
                src={item.novelId.coverImage}
                alt={item.novelId.title}
                width={80}
                height={120}
                className="w-20 h-full object-cover"
              />
            </Link>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/novels/${item.novelId._id}`}>
                    <h3 className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                      {item.novelId.title}
                    </h3>
                  </Link>
                  <Link href={`/profile/${item.novelId.author._id}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      by {item.novelId.author.name}
                    </p>
                  </Link>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.updatedAt)}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${item.readingProgress}%` }}
                ></div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.readingProgress}% complete
                </span>
                <Link
                  href={`/novels/${item.novelId._id}/chapter/${item.lastReadChapter._id}`}
                  className="px-4 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-900 transition-colors"
                >
                  Continue
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueReading; 