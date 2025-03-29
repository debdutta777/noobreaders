import React from 'react';
import { Metadata } from 'next';
import NovelGrid from '@/app/components/NovelGrid';

export const metadata: Metadata = {
  title: 'Explore Novels | NoobReaders',
  description: 'Discover new novels and stories on NoobReaders',
};

async function getNovelData() {
  try {
    // Use absolute URL instead of relying on NEXTAUTH_URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    const res = await fetch(`${baseUrl}/api/novels/featured`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch novel data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching novel data:', error);
    return { novels: [] };
  }
}

export default async function ExplorePage() {
  const data = await getNovelData();
  const novels = data.novels || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Novels</h1>
      
      {novels.length > 0 ? (
        <NovelGrid novels={novels} />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No novels found. Check back later for updates.</p>
        </div>
      )}
    </div>
  );
} 