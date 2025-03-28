import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/utils/db';
import Novel from '@/app/lib/models/Novel';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const period = request.nextUrl.searchParams.get('period') || 'week';
    
    // Define date ranges based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default: // 'all'
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // For now, we'll just use a simple sort by views as we don't have complex stats
    const novels = await Novel.find({
      createdAt: { $gte: startDate }
    })
      .populate('author', 'name')
      .sort({ views: -1, likes: -1 })
      .limit(4)
      .lean();
    
    return NextResponse.json(novels);
  } catch (error) {
    console.error('Error fetching popular novels:', error);
    return NextResponse.json({ error: 'Failed to fetch popular novels' }, { status: 500 });
  }
} 