'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NovelCard from '../novel/NovelCard';

interface Novel {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  author: {
    _id: string;
    name: string;
  };
  genres: string[];
  views: number;
  likes: number;
}

interface PopularNovelsProps {
  period: 'day' | 'week' | 'month' | 'all';
}

const PopularNovels = ({ period }: PopularNovelsProps) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularNovels = async () => {
      try {
        const response = await fetch(`/api/novels/popular?period=${period}`);
        if (!response.ok) throw new Error('Failed to fetch popular novels');
        const data = await response.json();
        setNovels(data);
      } catch (error) {
        console.error('Error fetching popular novels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularNovels();
  }, [period]);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Popular {period === 'day' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : ''}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  // Mock data for demonstration
  const mockNovels: Novel[] = novels.length > 0 ? novels : [
    {
      _id: '1',
      title: 'The Forgotten Realm',
      description: 'A journey through magical lands...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '101', name: 'J. R. Writer' },
      genres: ['Fantasy', 'Adventure'],
      views: 25000,
      likes: 1200
    },
    {
      _id: '2',
      title: 'Stellar Odyssey',
      description: 'The epic space adventure...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '102', name: 'A. Stellar' },
      genres: ['Sci-Fi', 'Action'],
      views: 18500,
      likes: 950
    },
    {
      _id: '3',
      title: 'Whispers in the Dark',
      description: 'A thrilling mystery...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '103', name: 'M. Shadow' },
      genres: ['Mystery', 'Horror'],
      views: 15000,
      likes: 780
    },
    {
      _id: '4',
      title: 'Hearts Entwined',
      description: 'A tale of love and destiny...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '104', name: 'R. Heart' },
      genres: ['Romance', 'Drama'],
      views: 12000,
      likes: 650
    }
  ];

  const getPeriodTitle = () => {
    switch (period) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular {getPeriodTitle()}</h2>
        <Link 
          href="/popular" 
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockNovels.map(novel => (
          <NovelCard key={novel._id} novel={novel} />
        ))}
      </div>
    </section>
  );
};

export default PopularNovels; 