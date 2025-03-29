import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { db } = await connectToDatabase();
    
    // Check if user ID is valid
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await db.collection('users').findOne({ _id: userObjectId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the user's library
    const library = await db.collection('userLibraries').findOne({ userId: userObjectId });
    
    if (!library || !library.novelIds || library.novelIds.length === 0) {
      return NextResponse.json({ novels: [] });
    }
    
    // Get the novel details
    const novels = await db.collection('novels')
      .find({ _id: { $in: library.novelIds } })
      .project({
        _id: 1,
        title: 1,
        coverImage: 1,
        author: 1,
        updatedAt: 1
      })
      .toArray();
    
    // Format the novels
    const formattedNovels = novels.map(novel => ({
      ...novel,
      _id: novel._id.toString(),
      author: novel.author ? {
        _id: novel.author._id ? novel.author._id.toString() : null,
        name: novel.author.name || 'Unknown Author'
      } : {
        _id: null,
        name: 'Unknown Author'
      }
    }));
    
    return NextResponse.json({ novels: formattedNovels });
  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library' },
      { status: 500 }
    );
  }
} 