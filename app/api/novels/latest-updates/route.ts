import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Check if we have novels collection
    const hasNovels = await db.listCollections({ name: 'novels' }).hasNext();
    
    if (!hasNovels) {
      console.log('No novels collection found, creating sample novels');
      // Create sample novels if no collection exists
      await db.collection('novels').insertOne({
        title: 'The First Adventure',
        description: 'A captivating tale of adventure and discovery...',
        coverImage: '/images/placeholder-cover.jpg',
        author: null, // No author for sample
        views: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: [
          {
            title: 'The Beginning',
            chapterNumber: 1,
            _id: 'sample-chapter-1',
            createdAt: new Date()
          }
        ]
      });
    }
    
    // Find novels with chapters
    const novels = await db
      .collection('novels')
      .aggregate([
        {
          $match: {
            'chapters': { $exists: true, $ne: [] }
          }
        },
        {
          $addFields: {
            latestChapter: { $arrayElemAt: ['$chapters', -1] }
          }
        },
        {
          $sort: { 'updatedAt': -1 }
        },
        {
          $limit: 5
        }
      ])
      .toArray();
    
    // Format the novels to match the expected structure
    const formattedNovels = await Promise.all(
      novels.map(async (novel) => {
        // If the novel has an author ID, fetch the author details
        let authorDetails = { _id: 'unknown', name: 'Unknown Author' };
        
        if (novel.author) {
          try {
            const authorDoc = await db
              .collection('users')
              .findOne({ _id: novel.author });
              
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