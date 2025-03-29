import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import ThemeToggle from '@/app/components/ThemeToggle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ChapterPageProps {
  params: {
    id: string;
    chapterId: string;
  };
}

// Helper function to format chapter content with proper paragraph breaks
function formatChapterContent(content: string): string {
  if (!content) return '<p>No content available.</p>';
  
  // If content already has HTML paragraph tags, return as is
  if (content.includes('<p>') && content.includes('</p>')) {
    return content;
  }
  
  // Split by double newlines to identify paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  
  // Create HTML paragraphs
  return paragraphs
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n');
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id: novelId, chapterId } = params;

  try {
    const { db } = await connectToDatabase();
    
    // First, try direct lookup in chapters collection
    let chapter = null;
    let novel = null;
    
    // Convert IDs to ObjectId when possible
    let novelObjectId;
    let chapterObjectId;
    
    try {
      novelObjectId = new ObjectId(novelId);
    } catch (error) {
      console.error('Error converting novel ID to ObjectId:', error);
      novelObjectId = novelId;
    }
    
    try {
      if (chapterId !== 'dummy-chapter-1') {
        chapterObjectId = new ObjectId(chapterId);
      }
    } catch (error) {
      console.error('Error converting chapter ID to ObjectId:', error);
      chapterObjectId = chapterId;
    }
    
    console.log('Looking for chapter with ID:', chapterId);
    
    // Try to find chapter directly first (for non-dummy chapters)
    if (chapterId !== 'dummy-chapter-1') {
      try {
        // Try with ObjectId
        chapter = await db.collection('chapters').findOne({ 
          _id: chapterObjectId 
        });
        
        if (!chapter) {
          // Try with string ID
          chapter = await db.collection('chapters').findOne({ 
            _id: chapterId 
          });
        }
        
        if (!chapter) {
          // Try by novel ID and chapter number (in case ID is wrong but chapter exists)
          console.log('Trying to find chapter by novel ID and number');
          chapter = await db.collection('chapters').findOne({
            novelId: novelObjectId,
            chapterNumber: parseInt(chapterId.replace('dummy-chapter-', '')) || 1
          });
        }
        
        if (chapter) {
          console.log('Found chapter in chapters collection:', chapter.title);
        }
      } catch (error) {
        console.error('Error fetching chapter directly:', error);
      }
    }
    
    // If chapter found, fetch the novel
    if (chapter) {
      try {
        novel = await db.collection('novels').findOne({ 
          _id: chapter.novelId || novelObjectId 
        });
      } catch (error) {
        console.error('Error fetching novel for found chapter:', error);
      }
    }
    
    // If chapter not found, fetch the novel and try to find embedded chapter
    if (!chapter) {
      // Find the novel
      try {
        novel = await db.collection('novels').findOne({ _id: novelObjectId });
      } catch (error) {
        console.error('Error fetching novel with ObjectId:', error);
        novel = await db.collection('novels').findOne({ _id: novelId });
      }
      
      if (!novel) {
        console.error('Novel not found:', novelId);
        notFound();
      }
      
      // Check for embedded chapters
      if (novel.chapters && Array.isArray(novel.chapters)) {
        const chapterIndex = novel.chapters.findIndex((ch: any) => 
          ch._id && (ch._id.toString() === chapterId || ch._id === chapterId)
        );
        
        if (chapterIndex !== -1) {
          chapter = novel.chapters[chapterIndex];
          console.log('Found embedded chapter:', chapter.title);
        }
      }
    }
    
    // If still no chapter, try a fallback search for chapter 1 of this novel
    if (!chapter && novel) {
      console.log('Trying to find first chapter for this novel');
      chapter = await db.collection('chapters').findOne({
        novelId: novelObjectId,
        chapterNumber: 1
      });
      
      if (chapter) {
        console.log('Found first chapter in collection:', chapter.title);
      }
    }
    
    // If still no chapter, create a dummy chapter
    if (!chapter && novel) {
      console.log('Creating dummy chapter as fallback');
      chapter = {
        _id: 'dummy-chapter-1',
        title: 'Chapter 1',
        chapterNumber: 1,
        content: `This is a sample chapter for "${novel.title}".\n\nNo actual chapter content is available yet.\n\nCheck back soon for updates!`,
        createdAt: new Date().toISOString()
      };
    }
    
    if (!novel || !chapter) {
      console.error('Required data not found. Novel:', novel ? 'Found' : 'Not found', 
                   'Chapter:', chapter ? 'Found' : 'Not found');
      notFound();
    }
    
    // Find previous and next chapters
    let previousChapter = null;
    let nextChapter = null;
    
    if (novel.chapterIds && Array.isArray(novel.chapterIds)) {
      // If the novel has external chapter references
      const chapterIds = novel.chapterIds.map((id: any) => 
        id && typeof id === 'object' ? id.toString() : id
      );
      
      const currentChapterId = chapter._id.toString ? chapter._id.toString() : chapter._id;
      const currentIndex = chapterIds.indexOf(currentChapterId);
      
      if (currentIndex > 0) {
        try {
          const prevId = novel.chapterIds[currentIndex - 1];
          const prevObjId = typeof prevId === 'string' ? new ObjectId(prevId) : prevId;
          previousChapter = await db.collection('chapters').findOne({ _id: prevObjId });
        } catch (error) {
          console.error('Error fetching previous chapter:', error);
        }
      }
      
      if (currentIndex < chapterIds.length - 1 && currentIndex !== -1) {
        try {
          const nextId = novel.chapterIds[currentIndex + 1];
          const nextObjId = typeof nextId === 'string' ? new ObjectId(nextId) : nextId;
          nextChapter = await db.collection('chapters').findOne({ _id: nextObjId });
        } catch (error) {
          console.error('Error fetching next chapter:', error);
        }
      }
    } else if (novel.chapters && Array.isArray(novel.chapters)) {
      // If the novel has embedded chapters
      const currentIndex = novel.chapters.findIndex((ch: any) => 
        ch._id && (ch._id.toString() === chapterId || ch._id === chapterId)
      );
      
      if (currentIndex > 0) {
        previousChapter = novel.chapters[currentIndex - 1];
      }
      
      if (currentIndex < novel.chapters.length - 1 && currentIndex !== -1) {
        nextChapter = novel.chapters[currentIndex + 1];
      }
    } else {
      // If no chapter structure in novel, try to find by chapter number
      const currentNumber = chapter.chapterNumber || 1;
      
      try {
        previousChapter = await db.collection('chapters').findOne({
          novelId: novelObjectId,
          chapterNumber: currentNumber - 1
        });
        
        nextChapter = await db.collection('chapters').findOne({
          novelId: novelObjectId,
          chapterNumber: currentNumber + 1
        });
      } catch (error) {
        console.error('Error fetching adjacent chapters by number:', error);
      }
    }
    
    // Format chapter for rendering
    const formattedChapter = {
      id: chapter._id.toString ? chapter._id.toString() : chapter._id,
      title: chapter.title || `Chapter ${chapter.chapterNumber || 1}`,
      chapterNumber: chapter.chapterNumber || 1,
      content: formatChapterContent(chapter.content || 'No content available.'),
      createdAt: chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'Unknown date'
    };
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Link 
            href={`/novels/${novelId}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Novel
          </Link>
          
          <ThemeToggle />
        </div>
        
        <div className="chapter-container bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {formattedChapter.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
              {novel.title} • {formattedChapter.createdAt}
            </p>
            
            <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
              <div 
                dangerouslySetInnerHTML={{ __html: formattedChapter.content }} 
                className="chapter-content"
              />
            </div>
            
            <div className="mt-12 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
              {previousChapter ? (
                <Link
                  href={`/novels/${novelId}/chapter/${previousChapter._id}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Chapter
                </Link>
              ) : (
                <div></div>
              )}
              
              {nextChapter ? (
                <Link
                  href={`/novels/${novelId}/chapter/${nextChapter._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                >
                  Next Chapter
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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