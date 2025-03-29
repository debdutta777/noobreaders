'use client';

import { useState } from 'react';
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

  const handleAddToLibrary = async () => {
    // If not logged in, redirect to login
    if (status !== 'authenticated' || !session) {
      router.push('/signin');
      return;
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to library');
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