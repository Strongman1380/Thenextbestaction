import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import mammoth from 'mammoth';

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

const DOCUMENTS_DIR = path.join(process.cwd(), 'data', 'documents');
const METADATA_FILE = path.join(process.cwd(), 'data', 'documents-metadata.json');

// Cache for parsed document content
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
 * Ensure documents directory exists (sync for initialization)
 */
function ensureDocumentsDir() {
  if (!existsSync(DOCUMENTS_DIR)) {
    mkdirSync(DOCUMENTS_DIR, { recursive: true });
  }
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
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    metadataCache = JSON.parse(data);
    metadataCacheTimestamp = now;
    return metadataCache!;
  } catch {
    metadataCache = [];
    metadataCacheTimestamp = now;
    return [];
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
 * Save document metadata (async)
 */
async function saveDocumentsMetadata(metadata: DocumentMetadata[]) {
  await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  // Update cache
  metadataCache = metadata;
  metadataCacheTimestamp = Date.now();
}

/**
 * Parse text from file based on type (async)
 */
async function parseFileContent(filePath: string, fileType: string): Promise<string> {
  const buffer = await fs.readFile(filePath);

  // Word documents (.docx)
  if (fileType.includes('wordprocessingml') || filePath.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Text files
  if (fileType.includes('text') || filePath.endsWith('.txt') || filePath.endsWith('.md')) {
    return buffer.toString('utf-8');
  }

  // PDFs - basic extraction (just extract readable text)
  if (fileType.includes('pdf') || filePath.endsWith('.pdf')) {
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ').trim();
  }

  // Default: try to read as text
  return buffer.toString('utf-8');
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
 * Save uploaded document (async)
 */
export async function saveDocument(
  fileBuffer: Buffer,
  originalName: string,
  fileType: string,
  category?: string,
  description?: string
): Promise<DocumentMetadata> {
  ensureDocumentsDir();

  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const ext = path.extname(originalName);
  const filename = `${id}${ext}`;
  const filePath = path.join(DOCUMENTS_DIR, filename);

  // Save file
  await fs.writeFile(filePath, fileBuffer);

  // Create metadata
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

  // Update metadata file
  const allMetadata = await loadDocumentsMetadata();
  allMetadata.push(metadata);
  await saveDocumentsMetadata(allMetadata);

  return metadata;
}

/**
 * Delete document (async)
 */
export async function deleteDocument(id: string): Promise<void> {
  const allMetadata = await loadDocumentsMetadata();
  const doc = allMetadata.find(d => d.id === id);

  if (!doc) {
    throw new Error('Document not found');
  }

  // Delete file
  const filePath = path.join(DOCUMENTS_DIR, doc.filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  // Update metadata
  const updatedMetadata = allMetadata.filter(d => d.id !== id);
  await saveDocumentsMetadata(updatedMetadata);

  // Invalidate cache for this document
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

  const allMetadata = await loadDocumentsMetadata();
  const doc = allMetadata.find(d => d.id === id);

  if (!doc) {
    throw new Error('Document not found');
  }

  const filePath = path.join(DOCUMENTS_DIR, doc.filename);
  const content = await parseFileContent(filePath, doc.fileType);

  // Cache the content
  setCachedContent(id, content);

  return content;
}

/**
 * Read and parse all documents (legacy + uploaded)
 * Returns formatted knowledge context for AI
 */
export async function loadDocumentKnowledge(category?: string): Promise<string> {
  try {
    let documentContext = '';
    const MAX_DOC_LENGTH = 3000;
    const MAX_TOTAL_LENGTH = 12000;

    // Load legacy Word documents from data directory
    const dataDir = path.join(process.cwd(), 'data');
    try {
      const files = await fs.readdir(dataDir);
      const legacyFiles = files.filter(file => file.endsWith('.docx'));

      for (const file of legacyFiles) {
        if (documentContext.length >= MAX_TOTAL_LENGTH) break;

        const cacheKey = `legacy_${file}`;
        let text = getCachedContent(cacheKey);

        if (text === null) {
          const filePath = path.join(dataDir, file);
          const buffer = await fs.readFile(filePath);

          try {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value.trim();
            setCachedContent(cacheKey, text);
          } catch (err) {
            console.error(`Error parsing legacy document ${file}:`, err);
            continue;
          }
        }

        if (text) {
          if (text.length > MAX_DOC_LENGTH) {
            text = text.substring(0, MAX_DOC_LENGTH) + '... [content truncated]';
          }
          documentContext += `\n\n### Document: ${file}\n${text}\n`;
        }
      }
    } catch {
      // Data directory doesn't exist, skip legacy documents
    }

    // Load uploaded documents
    const allMetadata = await loadDocumentsMetadata();
    const relevantDocs = category
      ? allMetadata.filter(doc => doc.category?.toLowerCase().includes(category.toLowerCase()))
      : allMetadata;

    for (const doc of relevantDocs) {
      if (documentContext.length >= MAX_TOTAL_LENGTH) break;

      try {
        let content = await getDocumentContent(doc.id);
        content = content.trim();

        if (content) {
          if (content.length > MAX_DOC_LENGTH) {
            content = content.substring(0, MAX_DOC_LENGTH) + '... [content truncated]';
          }

          documentContext += `\n\n### ${doc.originalName}`;
          if (doc.description) {
            documentContext += `\n*${doc.description}*`;
          }
          documentContext += `\n${content}\n`;
        }
      } catch (error) {
        console.error(`Error loading document ${doc.id}:`, error);
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
