import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'week';
    
    // Calculate the date range based on the period
    const now = new Date();
    let dateFilter = new Date();
    
    switch (period) {
      case 'day':
        dateFilter.setDate(now.getDate() - 1);
        break;
      case 'week':
        dateFilter.setDate(now.getDate() - 7);
        break;
      case 'month':
        dateFilter.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        dateFilter.setFullYear(now.getFullYear() - 1);
        break;
      default:
        dateFilter.setDate(now.getDate() - 7); // Default to week
    }
    
    // Check if we have novels collection
    const hasNovels = await db.listCollections({ name: 'novels' }).hasNext();
    
    if (!hasNovels) {
      console.log('No novels collection found, creating sample novel');
      // Create a sample novel if no collection exists
      await db.collection('novels').insertOne({
        title: 'The Mystic Journey',
        description: 'A captivating tale of adventure and discovery...',
        coverImage: '/images/placeholder-cover.jpg',
        views: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Find novels updated within the time period
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
          views: novel.views || 0,
          updatedAt: novel.updatedAt || new Date()
        };
      })
    );

    return NextResponse.json({ 
      novels: formattedNovels || [],
      period: period
    });
  } catch (error) {
    console.error('Error fetching popular novels:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch popular novels', 
        novels: [],
        period: 'week'
      },
      { status: 500 }
    );
  }
} 