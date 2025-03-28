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

  // For demo purposes if API isn't available yet
  const mockNovels: Novel[] = novels.length > 0 ? novels : [
    {
      _id: '1',
      title: 'The Forgotten Realm',
      description: 'A journey through magical lands...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '101', name: 'J. R. Writer' },
      genres: ['Fantasy', 'Adventure']
    },
    {
      _id: '2',
      title: 'Stellar Odyssey',
      description: 'The epic space adventure...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '102', name: 'A. Stellar' },
      genres: ['Sci-Fi', 'Action']
    },
    {
      _id: '3',
      title: 'Whispers in the Dark',
      description: 'A thrilling mystery...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '103', name: 'M. Shadow' },
      genres: ['Mystery', 'Horror']
    },
    {
      _id: '4',
      title: 'Hearts Entwined',
      description: 'A tale of love and destiny...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '104', name: 'R. Heart' },
      genres: ['Romance', 'Drama']
    }
  ];

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
        {mockNovels.map(novel => (
          <NovelCard key={novel._id} novel={novel} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedNovels; 