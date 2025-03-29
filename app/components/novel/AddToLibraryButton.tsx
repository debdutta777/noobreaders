'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AddToLibraryButtonProps {
  novelId: string;
}

export default function AddToLibraryButton({ novelId }: AddToLibraryButtonProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if novel is already in library on mount
  useEffect(() => {
    if (status === 'authenticated') {
      const checkLibrary = async () => {
        try {
          const response = await fetch('/api/user/library', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.novels && Array.isArray(data.novels)) {
              const isInLibrary = data.novels.some(novel => novel._id === novelId);
              if (isInLibrary) {
                setAdded(true);
              }
            }
          }
        } catch (error) {
          console.error('Error checking library status:', error);
        }
      };

      checkLibrary();
    }
  }, [novelId, status]);

  const handleAddToLibrary = async () => {
    // If not logged in, redirect to login
    if (status !== 'authenticated' || !session) {
      router.push(`/auth/signin?callbackUrl=/novels/${novelId}`);
      return;
    }

    if (added) {
      return; // Already added
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          novelId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to library');
      }

      setAdded(true);
      // Refresh the page data
      router.refresh();
    } catch (err) {
      console.error('Error adding to library:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to library');
    } finally {
      setLoading(false);
    }
  };

  if (added) {
    return (
      <button 
        className="w-full py-3 bg-green-600 text-white font-medium rounded-lg cursor-default"
        disabled
      >
        Added to Library
      </button>
    );
  }

  return (
    <div>
      <button 
        onClick={handleAddToLibrary}
        disabled={loading}
        className="w-full py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
      >
        {loading ? 'Adding...' : 'Add to Library'}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
} 