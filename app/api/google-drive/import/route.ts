import { NextRequest, NextResponse } from 'next/server';
import { importDriveFile, GoogleDriveTokens } from '@/lib/google-drive';
import { saveDocument } from '@/lib/document-parser';

/**
 * POST /api/google-drive/import
 * Imports a file from Google Drive into the knowledge base
 */
export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookie
    const tokensCookie = request.cookies.get('gdrive_tokens');

    if (!tokensCookie) {
      return NextResponse.json(
        { success: false, error: 'Not connected to Google Drive', needsAuth: true },
        { status: 401 }
      );
    }

    let tokens: GoogleDriveTokens;
    try {
      tokens = JSON.parse(tokensCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token data', needsAuth: true },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { fileId, mimeType, category, description } = body;

    if (!fileId || !mimeType) {
      return NextResponse.json(
        { success: false, error: 'fileId and mimeType are required' },
        { status: 400 }
      );
    }

    // Import the file content
    const result = await importDriveFile(tokens, fileId, mimeType, category);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Save to local knowledge base
    const buffer = Buffer.from(result.content || '', 'utf-8');
    const fileName = `${result.name || 'drive-import'}.txt`;

    const metadata = await saveDocument(
      buffer,
      fileName,
      'text/plain',
      category || 'google_drive',
      description || `Imported from Google Drive: ${result.name}`
    );

    return NextResponse.json({
      success: true,
      document: metadata,
      message: `Successfully imported "${result.name}" from Google Drive`,
    });
  } catch (error: any) {
    console.error('Error importing Drive file:', error);

    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json(
        { success: false, error: 'Authentication expired', needsAuth: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import file' },
      { status: 500 }
    );
  }
}
