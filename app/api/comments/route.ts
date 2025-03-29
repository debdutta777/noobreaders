import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';

// GET handler to fetch comments for a chapter
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chapterId = searchParams.get('chapterId');
  
  if (!chapterId) {
    return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
  }
  
  try {
    const { db } = await connectToDatabase();
    
    // Find all comments for this chapter, sorted by newest first
    const comments = await db.collection('comments')
      .find({ chapterId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // If any comments don't have userType, determine it now
    const commentsWithUserType = await Promise.all(comments.map(async (comment) => {
      // If comment already has userType, return as is
      if (comment.userType) {
        return comment;
      }
      
      try {
        // Check if user is a writer
        const isWriter = await db.collection('writer-user').findOne({ 
          _id: new ObjectId(comment.userId) 
        });
        
        if (isWriter) {
          // Update comment in database for future queries
          await db.collection('comments').updateOne(
            { _id: comment._id },
            { $set: { userType: 'writer' } }
          );
          return { ...comment, userType: 'writer' };
        } else {
          // Update comment in database for future queries
          await db.collection('comments').updateOne(
            { _id: comment._id },
            { $set: { userType: 'reader' } }
          );
          return { ...comment, userType: 'reader' };
        }
      } catch (error) {
        console.error(`Error determining userType for comment ${comment._id}:`, error);
        return { ...comment, userType: 'reader' }; // Default to reader on error
      }
    }));
    
    return NextResponse.json(commentsWithUserType);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST handler to create a new comment
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'You must be logged in to comment' }, { status: 401 });
  }
  
  try {
    const { chapterId, content } = await request.json();
    
    if (!chapterId || !content) {
      return NextResponse.json({ error: 'Chapter ID and content are required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Try to find the user in multiple collections
    let user = null;
    let userType = 'reader'; // Default user type
    const userEmail = session.user.email;
    
    // First check writer-user collection to prioritize writer status
    user = await db.collection('writer-user').findOne({ email: userEmail });
    if (user) {
      userType = 'writer';
    }
    
    // If not found, check users collection
    if (!user) {
      user = await db.collection('users').findOne({ email: userEmail });
    }
    
    // If still not found, check reader-user collection
    if (!user) {
      user = await db.collection('reader-user').findOne({ email: userEmail });
    }
    
    if (!user) {
      console.error(`User not found for email: ${userEmail} in any collection`);
      return NextResponse.json({ error: 'User not found. Please complete your profile setup.' }, { status: 404 });
    }
    
    // Create the comment
    const newComment = {
      userId: user._id.toString(),
      userName: user.name || session.user.name || userEmail,
      userType, // Add userType field to identify writers
      chapterId,
      content,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection('comments').insertOne(newComment);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...newComment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// DELETE handler to remove a comment
export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'You must be logged in to delete a comment' }, { status: 401 });
  }
  
  try {
    const { commentId } = await request.json();
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Try to find the user in multiple collections
    let user = null;
    const userEmail = session.user.email;
    
    // First check users collection
    user = await db.collection('users').findOne({ email: userEmail });
    
    // If not found, check reader-user collection
    if (!user) {
      user = await db.collection('reader-user').findOne({ email: userEmail });
    }
    
    // If still not found, check writer-user collection
    if (!user) {
      user = await db.collection('writer-user').findOne({ email: userEmail });
    }
    
    if (!user) {
      console.error(`User not found for email: ${userEmail} in any collection`);
      return NextResponse.json({ error: 'User not found. Please complete your profile setup.' }, { status: 404 });
    }
    
    // Find the comment
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    // Check if user is the comment author or an admin
    if (comment.userId !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
    }
    
    // Delete the comment
    await db.collection('comments').deleteOne({ _id: new ObjectId(commentId) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
} 