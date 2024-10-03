import { NextResponse } from 'next/server';
import { getRandomImage, getRandomQuote } from '../../lib/utils';

export async function GET() {
  try {
    const image = await getRandomImage();
    const quote = await getRandomQuote();
    return NextResponse.json({ image, quote });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch random data' }, { status: 500 });
  }
}