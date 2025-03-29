import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ChapterPageProps {
  params: {
    id: string;
    chapterId: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id: novelId, chapterId } = params;

  try {
    const { db } = await connectToDatabase();
    
    // Find the novel
    let novel;
    try {
      novel = await db.collection('novels').findOne({ _id: new ObjectId(novelId) });
    } catch (error) {
      console.error('Error fetching novel with ObjectId:', error);
      novel = await db.collection('novels').findOne({ _id: novelId });
    }
    
    if (!novel) {
      console.error('Novel not found:', novelId);
      notFound();
    }
    
    // Find the chapter - handle both embedded chapters and referenced chapters
    let chapter = null;
    let previousChapter = null;
    let nextChapter = null;
    
    // Case 1: If the novel has embedded chapters
    if (novel.chapters && Array.isArray(novel.chapters)) {
      const chapterIndex = novel.chapters.findIndex((ch: any) => 
        ch._id && (ch._id.toString() === chapterId || ch._id === chapterId)
      );
      
      if (chapterIndex !== -1) {
        chapter = novel.chapters[chapterIndex];
        if (chapterIndex > 0) {
          previousChapter = novel.chapters[chapterIndex - 1];
        }
        if (chapterIndex < novel.chapters.length - 1) {
          nextChapter = novel.chapters[chapterIndex + 1];
        }
      }
    }
    
    // Case 2: If chapter is stored separately
    if (!chapter && chapterId !== 'dummy-chapter-1') {
      try {
        chapter = await db.collection('chapters').findOne({ _id: new ObjectId(chapterId) });
      } catch (error) {
        console.error('Error fetching chapter with ObjectId:', error);
        chapter = await db.collection('chapters').findOne({ _id: chapterId });
      }
      
      // Get previous and next chapters if possible
      if (chapter && novel.chapterIds && Array.isArray(novel.chapterIds)) {
        const chapterIds = novel.chapterIds.map((id: any) => 
          id && typeof id === 'object' ? id.toString() : id
        );
        const currentIndex = chapterIds.indexOf(chapterId);
        
        if (currentIndex > 0) {
          previousChapter = await db.collection('chapters').findOne({ 
            _id: typeof novel.chapterIds[currentIndex - 1] === 'string' 
              ? new ObjectId(novel.chapterIds[currentIndex - 1]) 
              : novel.chapterIds[currentIndex - 1] 
          });
        }
        
        if (currentIndex < chapterIds.length - 1) {
          nextChapter = await db.collection('chapters').findOne({ 
            _id: typeof novel.chapterIds[currentIndex + 1] === 'string' 
              ? new ObjectId(novel.chapterIds[currentIndex + 1]) 
              : novel.chapterIds[currentIndex + 1] 
          });
        }
      }
    }
    
    // If dummy chapter (used when no chapters exist), create some content
    if (chapterId === 'dummy-chapter-1' || !chapter) {
      chapter = {
        _id: 'dummy-chapter-1',
        title: 'Chapter 1',
        chapterNumber: 1,
        content: `<p>This is a sample chapter for "${novel.title}".</p>
                 <p>No actual chapter content is available yet.</p>
                 <p>Check back soon for updates!</p>`,
        createdAt: new Date().toISOString()
      };
    }
    
    if (!chapter) {
      console.error('Chapter not found:', chapterId);
      notFound();
    }
    
    // Format chapter for rendering
    const formattedChapter = {
      id: chapter._id.toString ? chapter._id.toString() : chapter._id,
      title: chapter.title || `Chapter ${chapter.chapterNumber || 1}`,
      chapterNumber: chapter.chapterNumber || 1,
      content: chapter.content || 'No content available.',
      createdAt: chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'Unknown date'
    };
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href={`/novels/${novelId}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Novel
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {formattedChapter.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {novel.title} • {formattedChapter.createdAt}
            </p>
            
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formattedChapter.content }} />
            </div>
            
            <div className="mt-8 flex justify-between">
              {previousChapter ? (
                <Link
                  href={`/novels/${novelId}/chapter/${previousChapter._id}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                >
                  ← Previous Chapter
                </Link>
              ) : (
                <div></div>
              )}
              
              {nextChapter ? (
                <Link
                  href={`/novels/${novelId}/chapter/${nextChapter._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Next Chapter →
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Chapter</h1>
          <p>There was a problem fetching the chapter. Please try again later.</p>
          <Link 
            href={`/novels/${novelId}`}
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Return to Novel
          </Link>
        </div>
      </div>
    );
  }
} 