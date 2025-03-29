'use client';

import React from 'react';
import GenreRecommendations from './GenreRecommendations';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Recommendations by Genre</h2>
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>Sorry, we couldn't load recommendations at this time. Please try again later.</p>
      </div>
    </div>
  );
}

export default function GenreRecommendationsWrapper() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <React.Suspense fallback={
        <div className="py-8">
          <h2 className="text-2xl font-bold mb-6">Recommendations by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      }>
        <GenreRecommendations />
      </React.Suspense>
    </ErrorBoundary>
  );
} 