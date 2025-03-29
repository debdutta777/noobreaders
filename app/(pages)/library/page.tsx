import React from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import NovelGrid from '@/app/components/NovelGrid';

export const metadata: Metadata = {
  title: 'My Library | NoobReaders',
  description: 'Your personal reading library on NoobReaders',
};

async function getReadingList(userId: string) {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    const res = await fetch(`${baseUrl}/api/users/${userId}/reading-list`, {
      cache: 'no-store',
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
  
  if (!session || !session.user) {
    redirect('/api/auth/signin');
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
        <div className="text-center py-10">
          <p className="text-gray-500">Your library is empty. Start adding novels to your reading list!</p>
        </div>
      )}
    </div>
  );
} 