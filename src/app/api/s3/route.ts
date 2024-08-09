import { NextRequest, NextResponse } from 'next/server';
import { generateUploadURL, generateDownloadURL } from '@/utils/s3';

export async function POST(request: NextRequest) {
  const { fileName, contentType } = await request.json();
  const authHeader = request.headers.get('Authorization');

  // Validate auth header (replace with your actual validation logic)
  if (!authHeader || !validateAuthHeader(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = await generateUploadURL(fileName, contentType);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Error generating upload URL' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get('fileName');
  const authHeader = request.headers.get('Authorization');

  // Validate auth header (replace with your actual validation logic)
  if (!authHeader || !validateAuthHeader(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!fileName) {
    return NextResponse.json({ error: 'File name is required' }, { status: 400 });
  }

  try {
    const url = await generateDownloadURL(fileName);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Error generating download URL' }, { status: 500 });
  }
}

// Dummy function to simulate auth header validation
function validateAuthHeader(authHeader: string): boolean {
  // Implement your actual authentication logic here
  return authHeader === 'Bearer valid_token';
}