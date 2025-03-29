import React from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import Link from 'next/link';
import NovelGrid from '@/app/components/NovelGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Library | NoobReaders',
  description: 'Your personal reading library on NoobReaders',
};

async function getUserLibrary() {
  try {
    // Use absolute URL instead of relying on NEXTAUTH_URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Get from the new /api/user/library endpoint which handles session internally
    const res = await fetch(`${baseUrl}/api/user/library`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      if (res.status === 404) {
        // User not found in database, return empty list instead of throwing error
        return { novels: [] };
      }
      throw new Error('Failed to fetch library');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching library:', error);
    return { novels: [] };
  }
}

export default async function LibraryPage() {
  const session = await auth();

  // If no session, show login message instead of redirecting
  if (!session || !session.user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4 dark:text-white">My Library</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please sign in to view your personal library of novels.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // No need to pass userId anymore, it's handled by the API
  const data = await getUserLibrary();
  const novels = data.novels || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">My Library</h1>

      {novels.length > 0 ? (
        <NovelGrid novels={novels} />
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your library is empty. Start adding novels to your reading list!</p>
          <Link
            href="/explore"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Novels
          </Link>
        </div>
      )}
    </div>
  );
} 