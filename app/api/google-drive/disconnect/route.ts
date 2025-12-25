import { NextResponse } from 'next/server';

/**
 * POST /api/google-drive/disconnect
 * Disconnects Google Drive by clearing the tokens cookie
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Disconnected from Google Drive',
  });

  // Clear the tokens cookie
  response.cookies.delete('gdrive_tokens');

  return response;
}
