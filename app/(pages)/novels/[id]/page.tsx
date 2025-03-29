import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/app/lib/mongodb';

export const dynamic = 'force-dynamic';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { db } = await connectToDatabase();
    const novel = await db.collection('novels').findOne({ _id: params.id });
    
    if (!novel) {
      return {
        title: 'Novel Not Found | NoobReaders',
        description: 'The requested novel could not be found',
      };
    }
    
    return {
      title: `${novel.title} | NoobReaders`,
      description: novel.description || `Read ${novel.title} on NoobReaders`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Novel Detail | NoobReaders',
      description: 'Read novels on NoobReaders',
    };
  }
}

export default async function NovelDetailPage({ params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    
    // Find the novel by ID
    const novel = await db.collection('novels').findOne({ _id: params.id });
    
    if (!novel) {
      notFound();
    }
    
    // Get author details if available
    let author = { name: 'Unknown Author', _id: 'unknown' };
    if (novel.author) {
      const authorData = await db.collection('users').findOne({ _id: novel.author });
      if (authorData) {
        author = {
          name: authorData.name || authorData.username || 'Unknown Author',
          _id: authorData._id.toString()
        };
      }
    }
    
    // Get chapters if available
    const chapters = novel.chapters || [];
    
    // Format genres
    const genres = novel.genres || [];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-6">
              <div className="relative aspect-[2/3] w-full max-w-xs mx-auto">
                <div className="bg-gray-100 h-full w-full flex items-center justify-center rounded-lg">
                  {novel.coverImage ? (
                    <Image
                      src={novel.coverImage}
                      alt={novel.title}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <span className="text-gray-400">No Cover</span>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex flex-col space-y-4">
                <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Start Reading
                </button>
                <button className="w-full py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                  Add to Library
                </button>
              </div>
            </div>
            
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
              
              <div className="mt-2">
                <Link href={`/profile/${author._id}`} className="text-blue-600 hover:underline">
                  By {author.name}
                </Link>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((genre: string, index: number) => (
                  <Link
                    key={index}
                    href={`/explore?genre=${genre}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
              
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {novel.description || 'No description available.'}
                </p>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Chapters</h2>
                {chapters.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {chapters.map((chapter: any, index: number) => (
                      <div key={index} className="py-3 border-b border-gray-200 last:border-0">
                        <Link
                          href={`/novels/${novel._id}/chapter/${chapter._id}`}
                          className="flex justify-between items-center hover:text-blue-600"
                        >
                          <span>
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(chapter.createdAt).toLocaleDateString()}
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No chapters available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching novel:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Novel</h1>
          <p>There was a problem fetching the novel. Please try again later.</p>
          <Link 
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
} 