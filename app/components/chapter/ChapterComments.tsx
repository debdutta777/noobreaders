'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  chapterId: string;
  content: string;
  createdAt: string;
}

interface ChapterCommentsProps {
  chapterId: string;
}

export default function ChapterComments({ chapterId }: ChapterCommentsProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments for this chapter
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/comments?chapterId=${chapterId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [chapterId]);

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('You must be logged in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          content: newComment,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      const savedComment = await response.json();
      
      // Add the new comment to the list
      setComments(prev => [savedComment, ...prev]);
      setNewComment(''); // Clear the input
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="chapter-comments">
      {/* Comment form for logged-in users */}
      {status === 'authenticated' ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Add a comment
            </label>
            <textarea
              id="comment"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this chapter..."
            />
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Post Comment'}
          </button>
        </form>
      ) : status === 'loading' ? (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center">
          Loading...
        </div>
      ) : (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center">
          <p className="mb-2">You need to be logged in to comment</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Log In
          </button>
        </div>
      )}

      {/* Comments list */}
      <div className="comment-list">
        <h3 className="text-lg font-semibold mb-4">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        
        {isLoading ? (
          <div className="text-center py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div>
            {comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-user">{comment.userName}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 