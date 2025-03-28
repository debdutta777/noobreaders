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
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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
    
    return NextResponse.json(readingList);
  } catch (error) {
    console.error('Error fetching reading list:', error);
    return NextResponse.json({ error: 'Failed to fetch reading list' }, { status: 500 });
  }
} 