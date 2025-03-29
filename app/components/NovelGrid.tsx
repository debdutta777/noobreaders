import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Novel type definition
interface Novel {
  _id: string;
  title: string;
  coverImage: string;
  author: {
    _id: string;
    name: string;
  };
  description?: string;
  genres?: string[];
}

interface NovelGridProps {
  novels: Novel[];
}

export default function NovelGrid({ novels }: NovelGridProps) {
  const [imageErrors, setImageErrors] = React.useState<{[key: string]: boolean}>({});
  const fallbackImage = '/images/placeholder-cover.jpg';
  
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {novels.map((novel) => (
        <div key={novel._id} className="flex flex-col novel-card-container">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-xl group">
            <Link href={`/novels/${novel._id}`} className="group">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <Image
                  src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                  alt={novel.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFDwIBYTgbwwAAAABJRU5ErkJggg=="
                  onError={() => handleImageError(novel._id)}
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 dark:text-white">
                  {novel.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  by {novel.author?.name || 'Unknown Author'}
                </p>
                {novel.genres && novel.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {novel.genres.slice(0, 2).map((genre, index) => (
                      <span key={index} className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
} 