import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/utils/db';
import Novel from '@/app/lib/models/Novel';

export async function GET() {
  try {
    await dbConnect();
    
    // Attempt to get all unique genres from the database
    const result = await Novel.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres" } },
      { $sort: { _id: 1 } }
    ]);
    
    const genres = result.map(item => item._id);
    
    // If no genres found in database, return default set
    if (genres.length === 0) {
      return NextResponse.json([
        'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 
        'Horror', 'Adventure', 'Action', 'Drama'
      ]);
    }
    
    return NextResponse.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    // Return default genres if there's an error
    return NextResponse.json([
      'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 
      'Horror', 'Adventure', 'Action', 'Drama'
    ]);
  }
} 