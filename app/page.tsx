import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import LatestUpdates from './components/home/LatestUpdates';
import PopularNovelsWrapper from './components/home/PopularNovelsWrapper';
import GenreRecommendationsWrapper from './components/home/GenreRecommendationsWrapper';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'NoobReaders | Discover and Read Web Novels',
  description: 'Discover and read the best web novels from new and emerging authors',
};

// Wrapper component for Continue Reading that only renders for logged-in users
async function ContinueReadingSection() {
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }
  
  const userId = (session.user as any).id;
  
  // Don't import the component if no user is logged in
  const ContinueReading = (await import('./components/home/ContinueReading')).default;
  
  return <ContinueReading userId={userId} />;
}

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!(session && session.user);
  
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Discover Stories Worth Reading
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100">
                Explore thousands of original novels from emerging authors and find your next favorite read.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/explore"
                  className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Explore Novels
                </Link>
                {isLoggedIn ? (
                  <Link
                    href="/library"
                    className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors"
                  >
                    My Library
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors"
                  >
                    Sign Up Free
                  </Link>
                )}
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-blue-100 h-64 md:h-96 w-full rounded-lg flex items-center justify-center">
                <div className="text-blue-600 font-bold text-xl">NoobReaders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Latest Updates Section */}
        <LatestUpdates />
        
        {/* Continue Reading Section - Only visible for logged-in users */}
        {/* @ts-expect-error Server Component */}
        <ContinueReadingSection />
        
        {/* Popular Novels Section */}
        <PopularNovelsWrapper />
        
        {/* Genre Recommendations Section */}
        <GenreRecommendationsWrapper />

        {/* Genres Section */}
        <section className="py-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Adventure', 'Horror', 'Thriller', 'History'].map(genre => (
              <Link 
                key={genre}
                href={`/genres/${genre.toLowerCase()}`} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold">{genre}</h3>
                <p className="text-sm text-blue-100 mt-2">Explore {genre} novels</p>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Call-to-Action Section - Only shown for non-logged in users */}
        {!isLoggedIn && (
          <section className="py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Your Reading Journey Today</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of readers discovering new stories every day. Sign up for free and start reading instantly.
            </p>
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Create an Account
            </Link>
          </section>
        )}
        
        {/* Alternative CTA for logged-in users */}
        {isLoggedIn && (
          <section className="py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Continue Your Reading Journey</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover new books or continue reading your favorites from your personal library.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/library"
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                My Library
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors inline-block"
              >
                Discover More
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
