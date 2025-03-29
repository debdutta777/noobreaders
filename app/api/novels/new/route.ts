import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const novels = await db
      .collection('novels')
      .aggregate([
        {
          $sort: { createdAt: -1 }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'authorDetails'
          }
        },
        {
          $limit: 10
        },
        {
          $project: {
            _id: 1,
            title: 1,
            coverImage: 1,
            createdAt: 1,
            author: {
              $cond: {
                if: { $gt: [{ $size: '$authorDetails' }, 0] },
                then: {
                  _id: { $arrayElemAt: ['$authorDetails._id', 0] },
                  name: { $arrayElemAt: ['$authorDetails.name', 0] }
                },
                else: {
                  _id: null,
                  name: 'Unknown Author'
                }
              }
            }
          }
        }
      ])
      .toArray();
      
    // Convert ObjectId to string for proper JSON serialization
    const serializedNovels = novels.map(novel => ({
      ...novel,
      _id: novel._id.toString(),
      author: {
        ...novel.author,
        _id: novel.author._id ? novel.author._id.toString() : null
      }
    }));

    return NextResponse.json({ novels: serializedNovels });
  } catch (error) {
    console.error('Error fetching new novels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new novels' },
      { status: 500 }
    );
  }
} 