'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Novel {
  _id: string;
  title: string;
  coverImage: string;
  author: {
    _id: string;
    name: string;
  };
  updatedAt?: string;
}

interface UserLibraryProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function UserLibrary({ userId, isOwnProfile }: UserLibraryProps) {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const fallbackImage = '/images/placeholder-cover.jpg';

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      setError(null);

      try {
        // For the user's own profile, fetch from the user library endpoint
        // For other users, we'll need a public endpoint to view their libraries
        const endpoint = isOwnProfile 
          ? '/api/user/library' 
          : `/api/users/${userId}/library`;

        const response = await fetch(endpoint, {
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch library: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.novels)) {
          setNovels(data.novels);
        } else {
          console.error('Invalid data format:', data);
          setNovels([]);
        }
      } catch (error) {
        console.error('Error fetching library:', error);
        setError('Failed to load library. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [userId, isOwnProfile]);

  const handleImageError = (novelId: string) => {
    setImageErrors(prev => ({ ...prev, [novelId]: true }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 aspect-[2/3] rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (novels.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {isOwnProfile 
            ? 'Your library is empty. Start adding novels to your collection!' 
            : 'This user has no novels in their library yet.'}
        </p>
        {isOwnProfile && (
          <Link 
            href="/explore" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Explore Novels
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {novels.map((novel) => (
        <div key={novel._id} className="flex flex-col">
          <Link href={`/novels/${novel._id}`} className="block mb-2">
            <div className="relative aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                alt={novel.title}
                fill
                className="object-cover"
                onError={() => handleImageError(novel._id)}
                unoptimized
              />
            </div>
          </Link>
          <Link href={`/novels/${novel._id}`}>
            <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">
              {novel.title}
            </h3>
          </Link>
          <Link href={`/profile/${novel.author?._id || '#'}`}>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {novel.author?.name || 'Unknown Author'}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
} 