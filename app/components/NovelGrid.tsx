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
        <div key={novel._id} className="flex flex-col">
          <Link href={`/novels/${novel._id}`} className="group">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg mb-2">
              <Image
                src={imageErrors[novel._id] ? fallbackImage : novel.coverImage}
                alt={novel.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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
  );
} 