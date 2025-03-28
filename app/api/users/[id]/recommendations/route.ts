import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/utils/db';
import Library from '@/app/lib/models/Library';
import Novel from '@/app/lib/models/Novel';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = params.id;
    const genre = request.nextUrl.searchParams.get('genre') || '';
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Get the user's reading history to find preferred genres
    const userLibrary = await Library.find({ userId })
      .populate({
        path: 'novelId',
        select: 'genres',
      })
      .lean();
    
    // Extract all genres the user has read
    const userGenres = new Set<string>();
    userLibrary.forEach(item => {
      if (item.novelId && item.novelId.genres) {
        item.novelId.genres.forEach((g: string) => userGenres.add(g));
      }
    });
    
    // Get the novels the user has already read (to exclude from recommendations)
    const readNovelIds = userLibrary.map(item => item.novelId._id);
    
    // Build the query
    const query: any = {
      _id: { $nin: readNovelIds }
    };
    
    // If a specific genre is requested, use that
    if (genre) {
      query.genres = { $in: [genre] };
    } 
    // Otherwise use the user's preferred genres if available
    else if (userGenres.size > 0) {
      query.genres = { $in: Array.from(userGenres) };
    }
    
    // Find recommendations
    const recommendations = await Novel.find(query)
      .populate('author', 'name')
      .sort({ views: -1 })
      .limit(4)
      .lean();
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
} 