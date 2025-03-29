import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Check if we have novels collection and if it has any documents
    const hasNovels = await db.listCollections({ name: 'novels' }).hasNext();
    let novels = [];
    
    if (hasNovels) {
      // If collection exists, check if it has any novels
      novels = await db
        .collection('novels')
        .find({})
        .limit(6)
        .toArray();
    }

    // If we don't have any novels, create some sample novels
    if (!hasNovels || novels.length === 0) {
      console.log('No novels found, creating sample novels');
      
      // Create a writer user if none exists
      const writerExists = await db.collection('writer-user').findOne({});
      let writerId;
      
      if (!writerExists) {
        const writerResult = await db.collection('writer-user').insertOne({
          name: 'Sample Author',
          email: 'author@example.com',
          createdAt: new Date(),
        });
        writerId = writerResult.insertedId;
      } else {
        writerId = writerExists._id;
      }
      
      // Create sample novels
      const sampleNovels = [
        {
          title: 'India: The Legend of Aritra',
          description: 'In the bustling streets of Kolkata, 2025, Aritra Naskar is just another college graduate until he discovers an ancient artifact that reveals India\'s forgotten supernatural history.',
          coverImage: '/images/placeholder-cover.jpg',
          author: writerId,
          genres: ['Fantasy', 'Adventure'],
          views: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Tech Odyssey',
          description: 'A journey through the evolution of technology and its impact on society, from the early computing days to advanced AI systems shaping our future.',
          coverImage: '/images/placeholder-cover.jpg',
          author: writerId,
          genres: ['Science Fiction', 'Technology'],
          views: 98,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Mysteries of Bengal',
          description: 'A collection of supernatural tales and folklore from Bengal, featuring ghostly encounters and magical realism in rural and urban settings.',
          coverImage: '/images/placeholder-cover.jpg',
          author: writerId,
          genres: ['Mystery', 'Horror'],
          views: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      // Insert the sample novels
      await db.collection('novels').insertMany(sampleNovels);
      
      // Fetch the inserted novels
      novels = await db
        .collection('novels')
        .find({})
        .limit(6)
        .toArray();
    }

    // Format the novels to match the expected structure
    const formattedNovels = await Promise.all(
      novels.map(async (novel) => {
        // If the novel has an author ID, fetch the author details
        let authorDetails = { _id: 'unknown', name: 'Unknown Author' };

        if (novel.author) {
          try {
            let authorId = novel.author;
            if (typeof authorId === 'string') {
              try {
                authorId = new ObjectId(authorId);
              } catch (e) {
                console.error('Invalid ObjectId format for author:', authorId);
              }
            }

            // Check in both users and writer-user collections
            let authorDoc = await db
              .collection('users')
              .findOne({ _id: authorId });

            if (!authorDoc) {
              authorDoc = await db
                .collection('writer-user')
                .findOne({ _id: authorId });
            }

            if (authorDoc) {
              authorDetails = {
                _id: authorDoc._id.toString(),
                name: authorDoc.name || authorDoc.username || 'Unknown Author'
              };
            }
          } catch (error) {
            console.error('Error fetching author:', error);
          }
        }

        return {
          _id: novel._id.toString(),
          title: novel.title || 'Untitled Novel',
          coverImage: novel.coverImage || '/images/placeholder-cover.jpg',
          description: novel.description || '',
          author: authorDetails,
          genres: novel.genres || ['Fiction'],
          createdAt: novel.createdAt || new Date(),
          updatedAt: novel.updatedAt || new Date()
        };
      })
    );

    return NextResponse.json({ novels: formattedNovels || [] });
  } catch (error) {
    console.error('Error fetching featured novels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured novels', novels: [] },
      { status: 500 }
    );
  }
} 