import { NextResponse } from 'next/server'; import { connectDB } from '@/lib/mongodb'; import Track from '@/models/Track'; import { sampleTracks } from '@/lib/catalog';
export async function GET(){try{await connectDB();const tracks=await Track.find().lean();return NextResponse.json(tracks.length?tracks:sampleTracks)}catch{return NextResponse.json(sampleTracks)}}
