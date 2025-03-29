'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ChapterContentProps {
  content: string;
  externalImages?: string[] | {url?: string, src?: string, caption?: string}[];
}

export default function ChapterContent({ content, externalImages = [] }: ChapterContentProps) {
  const [processedContent, setProcessedContent] = useState(content);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [normalizedExternalImages, setNormalizedExternalImages] = useState<{src: string, alt: string, caption?: string}[]>([]);
  const [debug, setDebug] = useState<{message: string, data: any}[]>([]);
  
  // Process external images from database
  useEffect(() => {
    // Debug logging - but without exposing full image URLs
    if (process.env.NODE_ENV === 'development') {
      console.log('External images count:', externalImages ? externalImages.length : 0);
    }
    
    if (!externalImages || !externalImages.length) return;
    
    // Normalize the external images format
    const normalizedImages = externalImages.map((img, index) => {
      if (typeof img === 'string') {
        return {
          src: img,
          alt: `Chapter image ${index + 1}`,
          caption: ''
        };
      }
      
      // Handle object format
      const normalized = {
        src: img.url || img.src || '',
        alt: `Chapter image ${index + 1}`,
        caption: img.caption || ''
      };
      
      // Don't log full image URLs
      if (process.env.NODE_ENV === 'development') {
        console.log(`Normalized image ${index} caption:`, normalized.caption || '[No caption]');
      }
      return normalized;
    }).filter(img => img.src); // Only keep images with valid URLs
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Normalized images count:', normalizedImages.length);
    }
    
    setNormalizedExternalImages(normalizedImages);
  }, [externalImages]);
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      // Access the images stored in the global variable
      const images = (window as any).__CHAPTER_IMAGES__ || [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Embedded images count:', images.length);
      }
      
      if (images.length > 0) {
        // Replace image markers with actual image components
        let newContent = content;
        images.forEach((img: any, index: number) => {
          const marker = `<div data-chapter-image="${index}"></div>`;
          // Now we add classes to position images to the right or left alternately
          const alignment = index % 2 === 0 ? 'float-right ml-6 mb-4' : 'float-left mr-6 mb-4';
          newContent = newContent.replace(
            marker,
            `<img 
              src="${img.src}" 
              alt="${img.alt}" 
              class="chapter-image cursor-pointer ${alignment} max-w-[40%] md:max-w-[300px]" 
              data-index="${index}" 
              onclick="document.dispatchEvent(new CustomEvent('expand-image', {detail: {src: '${img.src}', alt: '${img.alt}'}}));"
            />`
          );
        });
        setProcessedContent(newContent);
      }
    }
  }, [content]);
  
  // Listen for the custom event to expand an image
  useEffect(() => {
    const handleExpandImage = (e: Event) => {
      const customEvent = e as CustomEvent;
      setExpandedImage(customEvent.detail.src);
    };
    
    document.addEventListener('expand-image', handleExpandImage);
    
    return () => {
      document.removeEventListener('expand-image', handleExpandImage);
    };
  }, []);
  
  // Close expanded image when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = () => {
      setExpandedImage(null);
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedImage(null);
      }
    };
    
    if (expandedImage) {
      document.addEventListener('keydown', handleEscape);
      // Minor delay to prevent immediate closing when clicking on the image
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('click', handleClickOutside);
        clearTimeout(timer);
      };
    }
  }, [expandedImage]);
  
  // Handle click on external images
  const handleExternalImageClick = (imageSrc: string) => {
    console.log('Image clicked:', imageSrc);
    setExpandedImage(imageSrc);
  };
  
  return (
    <>
      <div 
        dangerouslySetInnerHTML={{ __html: processedContent }} 
        className="chapter-content clearfix"
      />
      
      {/* Render external images from database */}
      {normalizedExternalImages.length > 0 ? (
        <div className="chapter-external-images my-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-xl font-medium mb-6 text-center">Chapter Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {normalizedExternalImages.map((img, index) => (
              <div key={index} className="chapter-image-container">
                <figure>
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="chapter-image cursor-pointer mx-auto"
                    onClick={() => handleExternalImageClick(img.src)}
                    onError={(e) => {
                      console.error(`Failed to load image #${index}`);
                      setDebug(prev => [...prev, {
                        message: 'Image load error',
                        data: { index }
                      }]);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {img.caption && (
                    <figcaption className="chapter-image-caption text-center mt-2">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              </div>
            ))}
          </div>
        </div>
      ) : externalImages && externalImages.length > 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 my-8 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Images are available but could not be processed. Raw data: {JSON.stringify(externalImages)}
          </p>
        </div>
      ) : null}
      
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={expandedImage} 
              alt="Expanded chapter image"
              className="max-w-full max-h-[90vh] object-contain"
              onError={(e) => {
                console.error(`Failed to load expanded image`);
                setDebug(prev => [...prev, {
                  message: 'Expanded image load error',
                  data: { error: 'Image failed to load' }
                }]);
              }}
            />
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setExpandedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Debug panel - only shown in development */}
      {process.env.NODE_ENV === 'development' && debug.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-md max-h-[300px] overflow-auto">
          <h4 className="font-bold text-sm mb-2">Debug Information</h4>
          <button 
            className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => setDebug([])}
          >
            Clear
          </button>
          <div className="text-xs">
            {debug.map((item, i) => (
              <div key={i} className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <p className="font-medium">{item.message}</p>
                <pre className="mt-1 bg-gray-100 dark:bg-gray-900 p-1 rounded overflow-auto">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 