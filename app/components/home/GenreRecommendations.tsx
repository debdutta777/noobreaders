'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Author {
  _id: string;
  name: string;
}

interface Novel {
  _id: string;
  title: string;
  coverImage: string;
  author: Author;
  description?: string;
}

const GenreRecommendations = () => {
  const { data: session } = useSession();
  const [selectedGenre, setSelectedGenre] = useState('Fantasy');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = React.useState<{[key: string]: boolean}>({});
  const fallbackImage = '/images/placeholder-cover.jpg';
  
  const genres = ['Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Adventure', 'Horror'];

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/novels/recommendations?genre=${selectedGenre}`, {
          cache: 'no-store',
          next: { revalidate: 60 }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch recommendations: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        if (data && Array.isArray(data.novels)) {
          setNovels(data.novels);
        } else {
          console.error('Invalid response format:', data);
          if (data && data.error) {
            setError(data.error);
          } else {
            setError('Received invalid data format from server');
          }
          setNovels([]);
        }
      } catch (error) {
        console.error('Error fetching genre recommendations:', error);
        setError('Failed to load recommendations. Please try again later.');
        setNovels([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [selectedGenre]);

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">Recommendations by Genre</h2>
        
        <div className="flex overflow-x-auto pb-2 mb-4 space-x-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Recommendations by Genre</h2>
      
      <div className="flex overflow-x-auto pb-2 mb-4 space-x-2">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedGenre === genre
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
      
      {error ? (
        <div className="text-center py-10 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => fetchRecommendations()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      ) : novels && novels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {novels.map((novel) => (
            <div key={novel._id} className="flex flex-col">
              <Link href={`/novels/${novel._id}`} className="group">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg mb-2">
                  <Image
                    src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                    alt={novel.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAOwbMi3aQAAAABJRU5ErkJggg=="
                    onError={() => handleImageError(novel._id)}
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                  {novel.title}
                </h3>
              </Link>
              <p className="text-xs text-gray-600 mt-1">
                {novel.author?.name || 'Unknown Author'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No novels found for {selectedGenre}. Try another genre.</p>
        </div>
      )}
    </section>
  );
};

// Define a separate function to avoid the React Hook "useEffect" error
function fetchRecommendations() {
  window.location.reload();
}

export default GenreRecommendations; 