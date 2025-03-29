import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import AddToLibraryButton from '@/app/components/novel/AddToLibraryButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { db } = await connectToDatabase();
    
    // Try to find the novel with either direct ID string or convert to ObjectId
    let novel;
    try {
      // First attempt with ObjectId
      novel = await db.collection('novels').findOne({ _id: new ObjectId(params.id) });
    } catch (e) {
      // If that fails, try with string ID
      novel = await db.collection('novels').findOne({ _id: params.id });
    }
    
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
    
    // Find the novel by ID using both ObjectId and string format
    let novel;
    try {
      // First try with ObjectId
      novel = await db.collection('novels').findOne({ _id: new ObjectId(params.id) });
    } catch (e) {
      // If that fails, try with string ID
      novel = await db.collection('novels').findOne({ _id: params.id });
    }
    
    if (!novel) {
      console.error('Novel not found:', params.id);
      notFound();
    }
    
    // Get author details if available
    let author = { name: 'Unknown Author', _id: 'unknown' };
    if (novel.author) {
      try {
        // Handle different possible formats of author ID
        let authorId = novel.author;
        
        // If authorId is an object with an id field (e.g. { id: '123' })
        if (typeof authorId === 'object' && authorId !== null && 'id' in authorId) {
          authorId = authorId.id;
        }
        
        // If authorId is a string that looks like an ObjectId
        if (typeof authorId === 'string' && /^[0-9a-fA-F]{24}$/.test(authorId)) {
          try {
            authorId = new ObjectId(authorId);
          } catch (e) {
            console.error('Invalid ObjectId format for author:', authorId);
          }
        }
        
        // Try to find the author in the users collection
        const authorData = await db.collection('users').findOne({ _id: authorId });
        
        if (authorData) {
          author = {
            name: authorData.name || authorData.username || 'Unknown Author',
            _id: authorData._id.toString()
          };
        } else {
          // If not found in users, try the writers collection
          const writerData = await db.collection('writers').findOne({ _id: authorId });
          if (writerData) {
            author = {
              name: writerData.name || writerData.username || 'Unknown Author',
              _id: writerData._id.toString()
            };
          }
        }
        
        console.log('Author data found:', author);
      } catch (error) {
        console.error('Error fetching author:', error);
      }
    }
    
    // Get chapters if available - handle different chapter storage formats
    let chapters = [];
    
    // First look for chapters in the chapters collection
    try {
      const chaptersFromCollection = await db.collection('chapters')
        .find({ novelId: new ObjectId(params.id) })
        .sort({ chapterNumber: 1 })
        .toArray();
      
      if (chaptersFromCollection && chaptersFromCollection.length > 0) {
        chapters = chaptersFromCollection.map(chapter => ({
          ...chapter,
          _id: chapter._id.toString()
        }));
        console.log(`Found ${chapters.length} chapters in collection for novel:`, novel.title);
      }
    } catch (error) {
      console.error('Error fetching chapters from collection:', error);
    }
    
    // If no chapters found in collection, check for embedded chapters
    if (chapters.length === 0 && novel.chapters && Array.isArray(novel.chapters) && novel.chapters.length > 0) {
      chapters = novel.chapters.map(chapter => ({
        ...chapter,
        _id: chapter._id ? chapter._id.toString() : `chapter-${chapter.chapterNumber || 0}`,
      }));
      console.log(`Found ${chapters.length} embedded chapters`);
    } 
    // Check for chapter references
    else if (chapters.length === 0 && novel.chapterIds && Array.isArray(novel.chapterIds) && novel.chapterIds.length > 0) {
      try {
        const chapterObjects = novel.chapterIds
          .filter(id => id) // Remove null/undefined
          .map(id => {
            // Convert string IDs to ObjectIds when possible
            if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
              return new ObjectId(id);
            }
            return id;
          });
        
        if (chapterObjects.length > 0) {
          const chapterDocs = await db.collection('chapters')
            .find({ _id: { $in: chapterObjects } })
            .sort({ chapterNumber: 1 })
            .toArray();
          
          chapters = chapterDocs.map(chapter => ({
            ...chapter,
            _id: chapter._id.toString()
          }));
          console.log(`Found ${chapters.length} referenced chapters`);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    }
    
    // Sort chapters by chapter number
    chapters.sort((a, b) => {
      const numA = a.chapterNumber || 0;
      const numB = b.chapterNumber || 0;
      return numA - numB;
    });
    
    console.log(`Found ${chapters.length} chapters for novel:`, novel.title);
    
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
                      width={300}
                      height={450}
                      className="object-cover rounded-lg w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <span className="text-gray-400">No Cover</span>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex flex-col space-y-4">
                {chapters.length > 0 && (
                  <Link 
                    href={`/novels/${params.id}/chapter/${chapters[0]._id}`}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Start Reading
                  </Link>
                )}
                <AddToLibraryButton novelId={params.id} />
              </div>
            </div>
            
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
              
              <div className="mt-2">
                {author._id !== 'unknown' ? (
                  <Link href={`/profile/${author._id}`} className="text-blue-600 hover:underline">
                    By {author.name}
                  </Link>
                ) : (
                  <span className="text-gray-600">
                    By {author.name}
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((genre, index) => (
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
                {chapters && chapters.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {chapters.map((chapter, index) => (
                      <div key={index} className="py-3 border-b border-gray-200 last:border-0">
                        <Link
                          href={`/novels/${params.id}/chapter/${chapter._id}`}
                          className="flex justify-between items-center hover:text-blue-600"
                        >
                          <span>
                            Chapter {chapter.chapterNumber || index + 1}: {chapter.title || `Chapter ${index + 1}`}
                          </span>
                          <span className="text-sm text-gray-500">
                            {chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'Unknown date'}
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