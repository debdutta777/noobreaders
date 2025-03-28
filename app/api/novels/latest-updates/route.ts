import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/utils/db';
import Novel from '@/app/lib/models/Novel';
import Chapter from '@/app/lib/models/Chapter';

export async function GET() {
  try {
    await dbConnect();
    
    // Get the latest chapters first
    const latestChapters = await Chapter.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'novelId',
        select: 'title coverImage author',
        populate: {
          path: 'author',
          select: 'name'
        }
      })
      .lean();
    
    // Format the response to match the expected structure
    const updates = latestChapters.map(chapter => ({
      _id: chapter.novelId._id,
      title: chapter.novelId.title,
      coverImage: chapter.novelId.coverImage,
      author: chapter.novelId.author,
      latestChapter: {
        _id: chapter._id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        createdAt: chapter.createdAt
      }
    }));
    
    // Filter out duplicates (keep only the latest chapter for each novel)
    const uniqueUpdates = updates.filter((update, index, self) => 
      index === self.findIndex(u => u._id.toString() === update._id.toString())
    );
    
    return NextResponse.json(uniqueUpdates.slice(0, 5));
  } catch (error) {
    console.error('Error fetching latest updates:', error);
    return NextResponse.json({ error: 'Failed to fetch latest updates' }, { status: 500 });
  }
} 