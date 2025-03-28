import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/utils/db';
import Novel from '@/app/lib/models/Novel';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const genre = request.nextUrl.searchParams.get('genre') || 'Fantasy';
    
    // Find novels with the specified genre
    const novels = await Novel.find({
      genres: { $in: [genre] }
    })
      .populate('author', 'name')
      .sort({ views: -1 })
      .limit(4)
      .lean();
    
    return NextResponse.json(novels);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
} 