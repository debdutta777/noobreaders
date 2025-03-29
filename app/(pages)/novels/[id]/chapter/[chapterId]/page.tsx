import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import ThemeToggle from '@/app/components/ThemeToggle';
import ChapterContent from '@/app/components/chapter/ChapterContent';
import ChapterComments from '@/app/components/chapter/ChapterComments';

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

  // If content already has HTML paragraph tags, but no image handling, add it
  let formattedContent = content;

  // Extract images to be handled with our client component
  // This regex finds <img> tags and replaces them with a special marker
  // We'll later replace this marker with our ChapterImageViewer component
  const imageRegex = /<img.*?src=["'](.*?)["'].*?>/g;
  const images: {src: string, alt: string, fullMatch: string}[] = [];
  
  // Find all images in the content
  let match;
  let index = 0;
  while ((match = imageRegex.exec(content)) !== null) {
    // Extract the entire img tag and the src attribute
    const fullMatch = match[0];
    const src = match[1];
    
    // Try to extract alt attribute if it exists
    const altMatch = fullMatch.match(/alt=["'](.*?)["']/);
    const alt = altMatch ? altMatch[1] : `Image ${index + 1}`;
    
    // Store the image info
    images.push({ src, alt, fullMatch });
    
    // Replace the image with a marker
    formattedContent = formattedContent.replace(
      fullMatch,
      `<div data-chapter-image="${index}"></div>`
    );
    
    index++;
  }

  // If no images were found, proceed with normal paragraph formatting
  if (images.length === 0) {
    // Split by double newlines to identify paragraphs
    const paragraphs = formattedContent.split(/\n\s*\n/);
    
    // Create HTML paragraphs
    return paragraphs
      .map(p => `<p>${p.trim()}</p>`)
      .join('\n');
  }

  // If we found images, store them in a global variable so our client component can access them
  // This is a workaround since we're generating HTML as a string
  // @ts-ignore - This will be used by our client component
  globalThis.__CHAPTER_IMAGES__ = images;

  // Now split by double newlines and format paragraphs
  const paragraphs = formattedContent.split(/\n\s*\n/);
  
  // Create HTML paragraphs
  return paragraphs
    .map(p => {
      if (p.trim().includes('data-chapter-image=')) {
        // This is an image marker, don't wrap in paragraph
        return p.trim();
      }
      return `<p>${p.trim()}</p>`;
    })
    .join('\n');
}

// Data fetching function 
async function getChapterData(params: ChapterPageProps['params']) {
  // All the existing code for fetching data stays the same
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
        return { error: 'Novel not found' };
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
      return { error: 'Data not found' };
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

    // Format chapter and navigation for rendering
    const formattedChapter = {
      id: chapter._id.toString ? chapter._id.toString() : chapter._id,
      title: chapter.title || `Chapter ${chapter.chapterNumber || 1}`,
      chapterNumber: chapter.chapterNumber || 1,
      content: formatChapterContent(chapter.content || 'No content available.'),
      createdAt: chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'Unknown date',
      images: chapter.images || [] // Support for separate images array
    };

    const navigation = {
      novel: {
        id: novel._id.toString ? novel._id.toString() : novel._id,
        title: novel.title
      },
      previousChapter: previousChapter ? {
        id: previousChapter._id.toString ? previousChapter._id.toString() : previousChapter._id,
        title: previousChapter.title || `Chapter ${previousChapter.chapterNumber || 1}`
      } : null,
      nextChapter: nextChapter ? {
        id: nextChapter._id.toString ? nextChapter._id.toString() : nextChapter._id,
        title: nextChapter.title || `Chapter ${nextChapter.chapterNumber || 1}`
      } : null
    };

    return { chapter: formattedChapter, navigation };
  } catch (error) {
    console.error('Error in getChapterData:', error);
    return { error: 'Failed to load chapter data' };
  }
}

// Main server component
export default async function ChapterPage({ params }: ChapterPageProps) {
  const data = await getChapterData(params);
  
  if (data.error) {
    notFound();
  }
  
  const { chapter, navigation } = data;
  
  return (
    <div className="min-h-screen chapter-container">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link 
            href={`/novels/${navigation.novel.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Novel
          </Link>
          <ThemeToggle />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {chapter.createdAt}
          </p>
        </div>
        
        <ChapterContent content={chapter.content} externalImages={chapter.images} />
        
        <div className="flex justify-between items-center mt-12 border-t border-gray-200 dark:border-gray-700 pt-6">
          {navigation.previousChapter ? (
            <Link
              href={`/novels/${navigation.novel.id}/chapter/${navigation.previousChapter.id}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Chapter
            </Link>
          ) : (
            <div></div>
          )}
          
          {navigation.nextChapter ? (
            <Link
              href={`/novels/${navigation.novel.id}/chapter/${navigation.nextChapter.id}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md flex items-center"
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
        
        <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          <ChapterComments chapterId={chapter.id} />
        </div>
      </div>
    </div>
  );
} 