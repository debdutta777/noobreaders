'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ChapterContentProps {
  content: string;
}

export default function ChapterContent({ content }: ChapterContentProps) {
  const [processedContent, setProcessedContent] = useState(content);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      // Access the images stored in the global variable
      const images = (window as any).__CHAPTER_IMAGES__ || [];
      
      if (images.length > 0) {
        // Replace image markers with actual image components
        let newContent = content;
        images.forEach((img: any, index: number) => {
          const marker = `<div data-chapter-image="${index}"></div>`;
          // We can't directly insert React components into HTML string
          // Instead, we'll use a placeholder that will be replaced by React
          newContent = newContent.replace(
            marker,
            `<img 
              src="${img.src}" 
              alt="${img.alt}" 
              class="chapter-image cursor-pointer" 
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
  
  return (
    <>
      <div 
        dangerouslySetInnerHTML={{ __html: processedContent }} 
        className="chapter-content"
      />
      
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={expandedImage} 
              alt="Expanded chapter image"
              className="max-w-full max-h-[90vh] object-contain"
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
    </>
  );
} 