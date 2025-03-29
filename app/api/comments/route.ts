import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST handler to create a new comment
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'You must be logged in to comment' }, { status: 401 });
  }
  
  try {
    const { chapterId, content } = await request.json();
    
    if (!chapterId || !content) {
      return NextResponse.json({ error: 'Chapter ID and content are required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Get user info
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Create the comment
    const newComment = {
      userId: user._id.toString(),
      userName: user.name || session.user.name || user.email,
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
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'You must be logged in to delete a comment' }, { status: 401 });
  }
  
  try {
    const { commentId } = await request.json();
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Get user info
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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