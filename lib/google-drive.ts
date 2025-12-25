import { google, drive_v3 } from 'googleapis';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '793879556692-h1508ha7srl23o778oj6dheia92vnan0.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`
  : 'http://localhost:3000/api/google-drive/callback';

// Scopes for Google Drive access
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

// Supported document types
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.google-apps.document', // Google Docs
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
  'text/markdown',
];

// Google export MIME types for Google Docs
const EXPORT_MIME_TYPE = 'text/plain';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleDriveTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

/**
 * Create OAuth2 client
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthUrl(): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string): Promise<GoogleDriveTokens> {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token || undefined,
    expiry_date: tokens.expiry_date || undefined,
  };
}

/**
 * Create Drive client with tokens
 */
export function createDriveClient(tokens: GoogleDriveTokens): drive_v3.Drive {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * List files from Google Drive
 */
export async function listDriveFiles(
  tokens: GoogleDriveTokens,
  options?: {
    pageSize?: number;
    pageToken?: string;
    folderId?: string;
    query?: string;
  }
): Promise<{ files: GoogleDriveFile[]; nextPageToken?: string }> {
  const drive = createDriveClient(tokens);

  // Build query for supported document types
  const mimeTypeQuery = SUPPORTED_MIME_TYPES
    .map(type => `mimeType='${type}'`)
    .join(' or ');

  let query = `(${mimeTypeQuery}) and trashed=false`;

  // Add folder filter if specified
  if (options?.folderId) {
    query += ` and '${options.folderId}' in parents`;
  }

  // Add search query if specified
  if (options?.query) {
    query += ` and name contains '${options.query}'`;
  }

  const response = await drive.files.list({
    pageSize: options?.pageSize || 20,
    pageToken: options?.pageToken,
    q: query,
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)',
    orderBy: 'modifiedTime desc',
  });

  const files: GoogleDriveFile[] = (response.data.files || []).map(file => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    size: file.size || undefined,
    modifiedTime: file.modifiedTime || undefined,
    webViewLink: file.webViewLink || undefined,
    iconLink: file.iconLink || undefined,
  }));

  return {
    files,
    nextPageToken: response.data.nextPageToken || undefined,
  };
}

/**
 * Get file content from Google Drive
 */
export async function getFileContent(
  tokens: GoogleDriveTokens,
  fileId: string,
  mimeType: string
): Promise<{ content: string; name: string }> {
  const drive = createDriveClient(tokens);

  // Get file metadata
  const fileMetadata = await drive.files.get({
    fileId,
    fields: 'name, mimeType',
  });

  const fileName = fileMetadata.data.name || 'Untitled';

  // Handle Google Docs - export as plain text
  if (mimeType === 'application/vnd.google-apps.document') {
    const response = await drive.files.export({
      fileId,
      mimeType: EXPORT_MIME_TYPE,
    });

    return {
      content: response.data as string,
      name: fileName,
    };
  }

  // Handle regular files - download content
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  const buffer = Buffer.from(response.data as ArrayBuffer);

  // For text files, return as string
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return {
      content: buffer.toString('utf-8'),
      name: fileName,
    };
  }

  // For other files, we'd need to parse them (PDF, DOCX)
  // For now, return a placeholder - in production, use pdf-parse or mammoth
  return {
    content: `[Binary file: ${fileName}]`,
    name: fileName,
  };
}

/**
 * Import a file from Google Drive into the knowledge base
 */
export async function importDriveFile(
  tokens: GoogleDriveTokens,
  fileId: string,
  mimeType: string,
  category?: string
): Promise<{ success: boolean; content?: string; name?: string; error?: string }> {
  try {
    const { content, name } = await getFileContent(tokens, fileId, mimeType);

    return {
      success: true,
      content,
      name,
    };
  } catch (error: any) {
    console.error('Error importing Drive file:', error);
    return {
      success: false,
      error: error.message || 'Failed to import file',
    };
  }
}

/**
 * Check if tokens are expired
 */
export function areTokensExpired(tokens: GoogleDriveTokens): boolean {
  if (!tokens.expiry_date) return false;
  return Date.now() >= tokens.expiry_date - 60000; // 1 minute buffer
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<GoogleDriveTokens> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    access_token: credentials.access_token!,
    refresh_token: credentials.refresh_token || refreshToken,
    expiry_date: credentials.expiry_date || undefined,
  };
}
