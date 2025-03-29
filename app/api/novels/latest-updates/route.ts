import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // First, check novels with embedded chapters
    const novelsWithEmbeddedChapters = await db
      .collection('novels')
      .aggregate([
        {
          $match: {
            'chapters': { $exists: true, $ne: [] }
          }
        },
        {
          $addFields: {
            latestChapter: { $arrayElemAt: ['$chapters', -1] },
            chapterType: 'embedded'
          }
        },
        {
          $sort: { 'updatedAt': -1 }
        },
        {
          $limit: 10
        }
      ])
      .toArray();
    
    // Next, get novels with chapters in the chapters collection
    const novelsWithChapterIds = await db
      .collection('novels')
      .aggregate([
        {
          $match: {
            'chapterIds': { $exists: true, $ne: [] }
          }
        },
        {
          $sort: { 'updatedAt': -1 }
        },
        {
          $limit: 10
        }
      ])
      .toArray();
    
    // For novels with separate chapters, fetch the latest chapter for each
    const novelsWithSeparateChapters = await Promise.all(
      novelsWithChapterIds.map(async (novel) => {
        try {
          const chapterIds = novel.chapterIds || [];
          // Make sure we have valid ObjectIds for lookup
          const validChapterIds = chapterIds
            .filter(id => id && (typeof id === 'string' ? /^[0-9a-fA-F]{24}$/.test(id) : true))
            .map(id => typeof id === 'string' ? new ObjectId(id) : id);
          
          if (validChapterIds.length === 0) {
            return { ...novel, latestChapter: null, chapterType: 'none' };
          }
          
          // Find the latest chapter by creation date
          const latestChapter = await db
            .collection('chapters')
            .find({ _id: { $in: validChapterIds } })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();
          
          return { 
            ...novel, 
            latestChapter: latestChapter[0] || null,
            chapterType: latestChapter[0] ? 'separate' : 'none'
          };
        } catch (error) {
          console.error('Error fetching chapters for novel:', novel._id, error);
          return { ...novel, latestChapter: null, chapterType: 'error' };
        }
      })
    );
    
    // Combine and sort all novels by the latest chapter date
    const allNovels = [...novelsWithEmbeddedChapters, ...novelsWithSeparateChapters]
      .filter(novel => novel.latestChapter) // Only keep novels with chapters
      .sort((a, b) => {
        const dateA = a.latestChapter?.createdAt ? new Date(a.latestChapter.createdAt) : new Date(0);
        const dateB = b.latestChapter?.createdAt ? new Date(b.latestChapter.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10); // Take top 10
    
    // Format the novels to match the expected structure
    const formattedNovels = await Promise.all(
      allNovels.map(async (novel) => {
        // If the novel has an author ID, fetch the author details
        let authorDetails = { _id: 'unknown', name: 'Unknown Author' };
        
        if (novel.author) {
          try {
            const authorId = typeof novel.author === 'string' ? 
              new ObjectId(novel.author) : novel.author;
            
            const authorDoc = await db
              .collection('users')
              .findOne({ _id: authorId });
              
            if (authorDoc) {
              authorDetails = {
                _id: authorDoc._id.toString(),
                name: authorDoc.name || authorDoc.username || 'Unknown Author'
              };
            }
          } catch (error) {
            console.error('Error fetching author:', error);
          }
        }
        
        // Make sure _id is a string
        const novelId = novel._id ? novel._id.toString() : 'unknown';
        
        // Format the latest chapter
        const latestChapter = novel.latestChapter || {
          _id: 'sample-chapter',
          title: 'New Chapter',
          chapterNumber: 1,
          createdAt: new Date()
        };
        
        if (latestChapter._id) {
          latestChapter._id = latestChapter._id.toString();
        }
        
        return {
          _id: novelId,
          title: novel.title || 'Untitled Novel',
          coverImage: novel.coverImage || '/images/placeholder-cover.jpg',
          author: authorDetails,
          latestChapter: latestChapter
        };
      })
    );

    return NextResponse.json({ 
      novels: formattedNovels || [],
      success: true
    });
  } catch (error) {
    console.error('Error fetching latest updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest updates', novels: [] },
      { status: 500 }
    );
  }
} 