'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NovelCard from '../novel/NovelCard';
import { useSession } from 'next-auth/react';

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

const GenreRecommendations = () => {
  const { data: session } = useSession();
  const [selectedGenre, setSelectedGenre] = useState<string>('Fantasy');
  const [recommendations, setRecommendations] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableGenres, setAvailableGenres] = useState<string[]>([
    'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Horror', 'Adventure', 'Action', 'Drama'
  ]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // If user is logged in, try to get personalized recommendations first
        if (session?.user?.id) {
          try {
            const userResponse = await fetch(`/api/users/${session.user.id}/recommendations?genre=${selectedGenre}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData && userData.length > 0) {
                setRecommendations(userData);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching personalized recommendations:', error);
          }
        }

        // Fallback to general recommendations by genre
        const response = await fetch(`/api/novels/recommendations?genre=${selectedGenre}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching genre recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch available genres from API
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAvailableGenres(data);
            // Set first genre as default selected
            setSelectedGenre(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
    fetchRecommendations();
  }, [selectedGenre, session]);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recommended for You
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {availableGenres.map(genre => (
              <button
                key={genre}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedGenre === genre
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'
                }`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
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
  const mockRecommendations: Novel[] = recommendations.length > 0 ? recommendations : [
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
      title: 'Dragon's Ascent',
      description: 'The rise of the last dragon king...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '105', name: 'D. Flame' },
      genres: ['Fantasy', 'Action']
    },
    {
      _id: '3',
      title: 'The Crystal Mage',
      description: 'A young mage discovers her power...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '106', name: 'C. Wizard' },
      genres: ['Fantasy', 'Coming of Age']
    },
    {
      _id: '4',
      title: 'Realm of Shadows',
      description: 'Ancient darkness returns to the kingdom...',
      coverImage: 'https://via.placeholder.com/300x400',
      author: { _id: '107', name: 'S. Knight' },
      genres: ['Fantasy', 'Dark Fantasy']
    }
  ];

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {session ? 'Recommended for You' : 'Genre Recommendations'}
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {availableGenres.map(genre => (
            <button
              key={genre}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedGenre === genre
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'
              }`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockRecommendations.map(novel => (
          <NovelCard key={novel._id} novel={novel} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link 
          href={`/explore?genre=${selectedGenre}`}
          className="inline-block px-6 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-900 font-medium transition-colors"
        >
          Explore More {selectedGenre} Novels
        </Link>
      </div>
    </section>
  );
};

export default GenreRecommendations; 