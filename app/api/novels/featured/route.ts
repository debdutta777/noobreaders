import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Check if we have novels collection
    const hasNovels = await db.listCollections({ name: 'novels' }).hasNext();
    
    if (!hasNovels) {
      console.log('No novels collection found, creating sample novel');
      // Create a sample novel if no collection exists
      const result = await db.collection('novels').insertOne({
        title: 'India: The Legend of Aritra',
        description: 'In the bustling streets of Kolkata, 2025, Aritra Naskar is just another...',
        coverImage: '/images/placeholder-cover.jpg',
        views: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Get featured novels from the database
    const novels = await db
      .collection('novels')
      .find({})
      .limit(6)
      .toArray();

    // Format the novels to match the expected structure
    const formattedNovels = await Promise.all(
      novels.map(async (novel) => {
        // If the novel has an author ID, fetch the author details
        let authorDetails = { _id: 'unknown', name: 'Unknown Author' };
        
        if (novel.author) {
          try {
            let authorId = novel.author;
            if (typeof authorId === 'string') {
              try {
                authorId = new ObjectId(authorId);
              } catch (e) {
                console.error('Invalid ObjectId format for author:', authorId);
              }
            }
            
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
        
        return {
          _id: novel._id.toString(),
          title: novel.title || 'Untitled Novel',
          coverImage: novel.coverImage || '/images/placeholder-cover.jpg',
          description: novel.description || '',
          author: authorDetails,
          createdAt: novel.createdAt || new Date(),
          updatedAt: novel.updatedAt || new Date()
        };
      })
    );

    return NextResponse.json({ novels: formattedNovels || [] });
  } catch (error) {
    console.error('Error fetching featured novels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured novels', novels: [] },
      { status: 500 }
    );
  }
} 