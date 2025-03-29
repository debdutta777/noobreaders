import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get latest updated novels from the database
    const novels = await db
      .collection('novels')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(8)
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
        
        return {
          _id: novel._id.toString(),
          title: novel.title || 'Untitled Novel',
          coverImage: novel.coverImage || '/images/placeholder-cover.jpg',
          description: novel.description || '',
          author: authorDetails,
          updatedAt: novel.updatedAt || new Date()
        };
      })
    );

    return NextResponse.json({ novels: formattedNovels });
  } catch (error) {
    console.error('Error fetching latest updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest updates' },
      { status: 500 }
    );
  }
} 