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

  if (novels.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Popular {getPeriodTitle()}
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No popular novels found for this time period.</p>
        </div>
      </section>
    );
  }

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
        {novels.map(novel => (
          <NovelCard key={novel._id} novel={novel} />
        ))}
      </div>
    </section>
  );
};

export default PopularNovels; 