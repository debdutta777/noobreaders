import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/utils/db';
import Library from '@/app/lib/models/Library';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = params.id;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    // Check if userId is undefined or 'undefined' string
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ 
        error: 'User ID is required',
        message: 'Please sign in to view your reading list',
        novels: [] 
      }, { status: 400 });
    }
    
    // Check if Library collection exists
    const db = (await dbConnect()).connection.db;
    const collections = await db.listCollections({ name: 'libraries' }).toArray();
    
    if (collections.length === 0) {
      // Return empty array if collection doesn't exist yet
      return NextResponse.json([]);
    }
    
    const readingList = await Library.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate({
        path: 'novelId',
        select: 'title coverImage author',
        populate: {
          path: 'author',
          select: 'name'
        }
      })
      .populate('lastReadChapter', 'title chapterNumber')
      .lean();
    
    return NextResponse.json(readingList || []);
  } catch (error) {
    console.error('Error fetching reading list:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reading list',
      message: 'There was a problem retrieving your reading list. Please try again later.',
      novels: [] 
    }, { status: 500 });
  }
} 