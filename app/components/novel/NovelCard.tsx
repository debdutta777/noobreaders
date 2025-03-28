import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Author {
  _id: string;
  name: string;
}

interface Novel {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  author: Author;
  genres: string[];
}

interface NovelCardProps {
  novel: Novel;
}

const NovelCard = ({ novel }: NovelCardProps) => {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = '/images/placeholder-cover.jpg';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-transform hover:scale-105 hover:shadow-lg">
      <Link href={`/novels/${novel._id}`} className="block relative h-56 overflow-hidden">
        <Image 
          src={imgError ? fallbackImage : novel.coverImage}
          alt={novel.title} 
          className="object-cover"
          width={300}
          height={400}
          priority={false}
          onError={() => setImgError(true)}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFDwIBYTgbwwAAAABJRU5ErkJggg=="
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/novels/${novel._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {novel.title}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {novel.description}
        </p>
        <div className="flex-grow"></div>
        <div className="mt-2">
          <Link 
            href={`/profile/${novel.author._id}`}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            By {novel.author.name}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {novel.genres.slice(0, 2).map((genre, index) => (
            <Link
              key={index}
              href={`/explore?genre=${genre}`}
              className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NovelCard; 