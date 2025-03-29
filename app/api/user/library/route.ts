import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session || !session.user || !session.user.email) {
      console.log('Authentication failed: No valid session', session);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the novel ID from the request body
    const { novelId } = await req.json();
    
    if (!novelId) {
      console.log('Missing novelId in request body');
      return NextResponse.json(
        { error: 'Novel ID is required' },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;
    const { db } = await connectToDatabase();
    
    // Find user by email (more reliable than ID which might be in different formats)
    let user = await db.collection('users').findOne({ email: userEmail });
    if (!user) {
      user = await db.collection('reader-user').findOne({ email: userEmail });
    }
    
    if (!user) {
      console.error('User not found in database:', userEmail);
      return NextResponse.json(
        { error: 'User not found in database. Please complete your profile.' },
        { status: 404 }
      );
    }
    
    // Use the user's MongoDB _id for reference
    const userObjectId = user._id;
    
    // Check if the novel exists
    let novelObjectId;
    try {
      novelObjectId = new ObjectId(novelId);
    } catch (error) {
      console.error('Invalid novel ID format:', novelId);
      return NextResponse.json(
        { error: 'Invalid novel ID format' },
        { status: 400 }
      );
    }
    
    const novel = await db.collection('novels').findOne({ _id: novelObjectId });
    
    if (!novel) {
      console.error('Novel not found in database:', novelId);
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }
    
    // Check if userLibraries collection exists, create it if not
    const collections = await db.listCollections({ name: 'userLibraries' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('userLibraries');
      console.log('Created userLibraries collection');
    }
    
    // Find the user's library document or create one if it doesn't exist
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
        userEmail: userEmail, // Store email as well for easier lookup
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
      { error: 'Failed to add novel to library', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session || !session.user || !session.user.email) {
      console.log('Authentication required - missing session or email');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userEmail = session.user.email;
    console.log('Fetching library for user email:', userEmail);
    
    const { db } = await connectToDatabase();
    
    // Find user by email first
    let user = await db.collection('users').findOne({ email: userEmail });
    if (!user) {
      user = await db.collection('reader-user').findOne({ email: userEmail });
    }
    
    if (!user) {
      console.log('User not found in database with email:', userEmail);
      return NextResponse.json({
        error: 'User not found in database. Please complete your profile.',
        novels: []
      }, { status: 404 });
    }
    
    console.log('Found user:', user._id);
    
    // Find the user's library using their MongoDB _id
    const userObjectId = user._id;
    const library = await db.collection('userLibraries').findOne({ 
      $or: [
        { userId: userObjectId },
        { userEmail: userEmail }
      ]
    });
    
    console.log('Library found:', library ? 'Yes' : 'No');
    
    if (!library || !library.novelIds || library.novelIds.length === 0) {
      console.log('No novels in library or library not found');
      return NextResponse.json({ novels: [] });
    }
    
    console.log('Number of novels in library:', library.novelIds.length);
    
    // Convert all IDs to ObjectId safely
    const validNovelIds = [];
    for (const id of library.novelIds) {
      try {
        if (typeof id === 'string') {
          validNovelIds.push(new ObjectId(id));
        } else {
          validNovelIds.push(id);
        }
      } catch (error) {
        console.error('Invalid novel ID in library:', id);
        // Skip invalid IDs
      }
    }
    
    // Get the novel details
    const novels = await db.collection('novels')
      .find({ _id: { $in: validNovelIds } })
      .project({
        _id: 1,
        title: 1,
        coverImage: 1,
        author: 1,
        description: 1,
        genres: 1,
        updatedAt: 1
      })
      .toArray();
    
    console.log('Number of novels retrieved:', novels.length);
    
    // Format the novels
    const formattedNovels = novels.map(novel => {
      // Handle author info safely
      let authorInfo = { _id: null, name: 'Unknown Author' };
      if (novel.author) {
        if (typeof novel.author === 'object') {
          // If author is an object with _id
          authorInfo = {
            _id: novel.author._id ? novel.author._id.toString() : null,
            name: novel.author.name || 'Unknown Author'
          };
        } else if (typeof novel.author === 'string') {
          // If author is just an ID string
          authorInfo = {
            _id: novel.author,
            name: 'Unknown Author'
          };
        }
      }

      return {
        _id: novel._id.toString(),
        title: novel.title || 'Untitled Novel',
        coverImage: novel.coverImage || '/images/placeholder-cover.jpg',
        description: novel.description || '',
        genres: novel.genres || [],
        author: authorInfo,
        updatedAt: novel.updatedAt || new Date()
      };
    });
    
    console.log('Returning formatted novels');
    return NextResponse.json({ novels: formattedNovels });
  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library', novels: [] },
      { status: 500 }
    );
  }
} 