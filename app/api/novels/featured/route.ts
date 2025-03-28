import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/utils/db';
import Novel from '@/app/lib/models/Novel';

export async function GET() {
  try {
    await dbConnect();
    
    // Get featured novels (for now, just getting the most recent ones)
    const novels = await Novel.find({})
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    
    return NextResponse.json(novels);
  } catch (error) {
    console.error('Error fetching featured novels:', error);
    return NextResponse.json({ error: 'Failed to fetch featured novels' }, { status: 500 });
  }
} 