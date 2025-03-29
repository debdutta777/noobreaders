import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'week';
    
    // Define the date range based on period
    let dateFilter: Date;
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'month':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'week':
      default:
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
    }
    
    // Get popular novels from the database based on views
    const novels = await db
      .collection('novels')
      .find({
        updatedAt: { $gte: dateFilter }
      })
      .sort({ views: -1 })
      .limit(6)
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
          views: novel.views || 0
        };
      })
    );

    return NextResponse.json({ novels: formattedNovels || [] });
  } catch (error) {
    console.error('Error fetching popular novels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular novels', novels: [] },
      { status: 500 }
    );
  }
} 