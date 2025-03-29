import React from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NovelGrid from '@/app/components/NovelGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Library | NoobReaders',
  description: 'Your personal reading library on NoobReaders',
};

async function getReadingList(userId: string) {
  try {
    // Use absolute URL instead of relying on NEXTAUTH_URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
    const res = await fetch(`${baseUrl}/api/users/${userId}/reading-list`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch reading list');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching reading list:', error);
    return { novels: [] };
  }
}

export default async function LibraryPage() {
  const session = await auth();
  
  // If no session, show login message instead of redirecting
  if (!session || !session.user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">My Library</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your personal library of novels.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  const userId = (session.user as any).id || '';
  const data = await getReadingList(userId);
  const novels = data.novels || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      
      {novels.length > 0 ? (
        <NovelGrid novels={novels} />
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-6">Your library is empty. Start adding novels to your reading list!</p>
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