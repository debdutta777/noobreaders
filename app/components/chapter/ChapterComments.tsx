'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userType?: 'writer' | 'reader';
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
        setError('');
        
        // Add a brief delay to prevent immediate API calls that might get throttled
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const response = await fetch(`/api/comments?chapterId=${chapterId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load comments. Please try again later.';
        console.error('Error fetching comments:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (chapterId) {
      fetchComments();
    }
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
      
      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.error === 'User not found. Please complete your profile setup.') {
          throw new Error('Your user profile is incomplete. Please complete your profile setup to comment.');
        }
        throw new Error(responseData.error || 'Failed to submit comment');
      }
      
      // Add the new comment to the list
      setComments(prev => [responseData, ...prev]);
      setNewComment(''); // Clear the input
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit comment. Please try again.';
      console.error('Error submitting comment:', err);
      setError(errorMessage);
      
      // If it's a user profile issue, add a help link
      if (errorMessage.includes('user profile is incomplete')) {
        setError(errorMessage + ' Please visit your profile page to complete setup.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
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
              disabled={isSubmitting}
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
          <div className="animate-pulse">Loading authentication...</div>
        </div>
      ) : (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center">
          <p className="mb-2">You need to be logged in to comment</p>
          <a 
            href="/auth/signin?callbackUrl=/novels" 
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Log In
          </a>
        </div>
      )}

      {/* Comments list */}
      <div className="comment-list">
        <h3 className="text-lg font-semibold mb-4">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            <p className="mt-2 text-gray-500">Loading comments...</p>
          </div>
        ) : error && comments.length === 0 ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No comments yet.</p>
            <p className="mt-2">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div>
            {comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-header">
                  <div className="flex items-center">
                    <span className="comment-user">{comment.userName}</span>
                    {comment.userType === 'writer' && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200">
                        Author
                      </span>
                    )}
                  </div>
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