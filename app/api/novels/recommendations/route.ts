import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const genre = searchParams.get('genre') || '';
    
    let novels = [];
    
    // If a genre is specified, get recommendations by genre
    if (genre) {
      novels = await db
        .collection('novels')
        .find({ genres: genre })
        .sort({ views: -1 })
        .limit(6)
        .toArray();
    } else {
      // Otherwise, get general recommendations (most popular)
      novels = await db
        .collection('novels')
        .find({})
        .sort({ views: -1 })
        .limit(6)
        .toArray();
    }

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
          views: novel.views || 0
        };
      })
    );

    return NextResponse.json({ 
      novels: formattedNovels || [], 
      genre: genre || 'All'
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recommendations', 
        novels: [],
        genre: ''
      },
      { status: 500 }
    );
  }
} 