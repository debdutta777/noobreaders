import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the novel ID from the request body
    const { novelId } = await req.json();
    
    if (!novelId) {
      return NextResponse.json(
        { error: 'Novel ID is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const { db } = await connectToDatabase();
    
    // Check if the novel exists
    let novelObjectId;
    try {
      novelObjectId = new ObjectId(novelId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid novel ID format' },
        { status: 400 }
      );
    }
    
    const novel = await db.collection('novels').findOne({ _id: novelObjectId });
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }
    
    // Find the user's library document or create one if it doesn't exist
    const userObjectId = new ObjectId(userId);
    const library = await db.collection('userLibraries').findOne({ userId: userObjectId });
    
    if (library) {
      // Check if the novel is already in the library
      const novelIds = library.novelIds || [];
      const novelIdStrings = novelIds.map((id: ObjectId) => id.toString());
      
      if (novelIdStrings.includes(novelId)) {
        return NextResponse.json(
          { message: 'Novel already in library' },
          { status: 200 }
        );
      }
      
      // Add the novel to the library
      await db.collection('userLibraries').updateOne(
        { userId: userObjectId },
        { 
          $addToSet: { novelIds: novelObjectId },
          $set: { updatedAt: new Date() }
        }
      );
    } else {
      // Create a new library for the user
      await db.collection('userLibraries').insertOne({
        userId: userObjectId,
        novelIds: [novelObjectId],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json(
      { success: true, message: 'Novel added to library' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding novel to library:', error);
    return NextResponse.json(
      { error: 'Failed to add novel to library' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { db } = await connectToDatabase();
    
    // Find the user's library
    const userObjectId = new ObjectId(userId);
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