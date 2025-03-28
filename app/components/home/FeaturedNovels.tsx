'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
}

const FeaturedNovels = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedNovels = async () => {
      try {
        const response = await fetch('/api/novels/featured');
        if (!response.ok) throw new Error('Failed to fetch featured novels');
        const data = await response.json();
        setNovels(data);
      } catch (error) {
        console.error('Error fetching featured novels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNovels();
  }, []);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Novels</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Novels</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No featured novels available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Novels</h2>
        <Link 
          href="/explore" 
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

export default FeaturedNovels; 