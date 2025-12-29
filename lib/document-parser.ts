import mammoth from 'mammoth';
import { createClient } from '@supabase/supabase-js';

export interface DocumentMetadata {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  uploadedAt: string;
  category?: string;
  description?: string;
  size: number;
}

interface DocumentRecord {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  uploaded_at: string;
  category: string | null;
  description: string | null;
  size: number;
}

interface DocumentRecordWithContent extends DocumentRecord {
  content: string;
}

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory cache for document content
interface CacheEntry {
  content: string;
  timestamp: number;
}

const documentCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache for metadata
let metadataCache: DocumentMetadata[] | null = null;
let metadataCacheTimestamp = 0;
const METADATA_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Parse text from buffer based on type
 */
async function parseFileContent(buffer: Buffer, fileType: string, fileName: string): Promise<string> {
  // Word documents (.docx)
  if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Text files
  if (fileType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return buffer.toString('utf-8');
  }

  // PDFs - basic extraction (just extract readable text)
  if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ').trim();
  }

  // Default: try to read as text
  return buffer.toString('utf-8');
}

/**
 * Convert database record to metadata
 */
function recordToMetadata(record: DocumentRecord): DocumentMetadata {
  return {
    id: record.id,
    filename: record.filename,
    originalName: record.original_name,
    fileType: record.file_type,
    uploadedAt: record.uploaded_at,
    category: record.category || undefined,
    description: record.description || undefined,
    size: record.size,
  };
}

/**
 * Load all document metadata with caching
 */
export async function loadDocumentsMetadata(): Promise<DocumentMetadata[]> {
  const now = Date.now();

  // Return cached if valid
  if (metadataCache && (now - metadataCacheTimestamp) < METADATA_CACHE_TTL) {
    return metadataCache;
  }

  try {
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('id, filename, original_name, file_type, uploaded_at, category, description, size')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error loading documents from Supabase:', error);
      return metadataCache || [];
    }

    metadataCache = (data || []).map(recordToMetadata);
    metadataCacheTimestamp = now;
    return metadataCache;
  } catch (error) {
    console.error('Error loading documents:', error);
    return metadataCache || [];
  }
}

/**
 * Invalidate metadata cache
 */
export function invalidateMetadataCache() {
  metadataCache = null;
  metadataCacheTimestamp = 0;
}

/**
 * Get cached document content
 */
function getCachedContent(cacheKey: string): string | null {
  const entry = documentCache.get(cacheKey);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) {
    return entry.content;
  }
  return null;
}

/**
 * Set cached document content
 */
function setCachedContent(cacheKey: string, content: string) {
  documentCache.set(cacheKey, {
    content,
    timestamp: Date.now(),
  });

  // Limit cache size
  if (documentCache.size > 50) {
    const oldestKey = documentCache.keys().next().value;
    if (oldestKey) documentCache.delete(oldestKey);
  }
}

/**
 * Save uploaded document to Supabase
 */
export async function saveDocument(
  fileBuffer: Buffer,
  originalName: string,
  fileType: string,
  category?: string,
  description?: string
): Promise<DocumentMetadata> {
  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const filename = `${id}${originalName.substring(originalName.lastIndexOf('.'))}`;

  // Parse content from buffer
  const content = await parseFileContent(fileBuffer, fileType, originalName);

  // Save to Supabase
  const { error } = await supabase
    .from('knowledge_documents')
    .insert({
      id,
      filename,
      original_name: originalName,
      file_type: fileType,
      uploaded_at: new Date().toISOString(),
      category: category || null,
      description: description || null,
      size: fileBuffer.length,
      content,
    });

  if (error) {
    console.error('Error saving document to Supabase:', error);
    throw new Error(`Failed to save document: ${error.message}`);
  }

  // Invalidate cache
  invalidateMetadataCache();

  const metadata: DocumentMetadata = {
    id,
    filename,
    originalName,
    fileType,
    uploadedAt: new Date().toISOString(),
    category,
    description,
    size: fileBuffer.length,
  };

  return metadata;
}

/**
 * Delete document from Supabase
 */
export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document from Supabase:', error);
    throw new Error(`Failed to delete document: ${error.message}`);
  }

  // Invalidate caches
  invalidateMetadataCache();
  documentCache.delete(id);
}

/**
 * Get document content with caching
 */
export async function getDocumentContent(id: string): Promise<string> {
  // Check cache first
  const cached = getCachedContent(id);
  if (cached !== null) {
    return cached;
  }

  const { data, error } = await supabase
    .from('knowledge_documents')
    .select('content')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('Document not found');
  }

  // Cache the content
  setCachedContent(id, data.content);

  return data.content;
}

/**
 * Read and parse all documents
 * Returns formatted knowledge context for AI
 */
export async function loadDocumentKnowledge(category?: string): Promise<string> {
  try {
    let documentContext = '';
    const MAX_DOC_LENGTH = 3000;
    const MAX_TOTAL_LENGTH = 12000;

    // Build query
    let query = supabase
      .from('knowledge_documents')
      .select('id, original_name, description, content, category')
      .order('uploaded_at', { ascending: false });

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Error loading documents:', error);
      return '';
    }

    for (const doc of documents || []) {
      if (documentContext.length >= MAX_TOTAL_LENGTH) break;

      let content = (doc.content || '').trim();

      if (content) {
        if (content.length > MAX_DOC_LENGTH) {
          content = content.substring(0, MAX_DOC_LENGTH) + '... [content truncated]';
        }

        documentContext += `\n\n### ${doc.original_name}`;
        if (doc.description) {
          documentContext += `\n*${doc.description}*`;
        }
        documentContext += `\n${content}\n`;
      }
    }

    if (documentContext) {
      return `\n\n## KNOWLEDGE FROM UPLOADED DOCUMENTS${documentContext}\n`;
    }

    return '';
  } catch (error) {
    console.error('Error loading document knowledge:', error);
    return '';
  }
}

/**
 * Clear all document caches
 */
export function clearDocumentCaches() {
  documentCache.clear();
  invalidateMetadataCache();
}
