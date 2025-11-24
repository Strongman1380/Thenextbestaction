import fs from 'fs';
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

/**
 * Ensure documents directory exists
 */
function ensureDocumentsDir() {
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
  }
}

/**
 * Load all document metadata
 */
export function loadDocumentsMetadata(): DocumentMetadata[] {
  try {
    const data = fs.readFileSync(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save document metadata
 */
function saveDocumentsMetadata(metadata: DocumentMetadata[]) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
}

/**
 * Parse text from file based on type
 */
async function parseFileContent(filePath: string, fileType: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);

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
    // Simple text extraction from PDF buffer
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ').trim();
  }

  // Default: try to read as text
  return buffer.toString('utf-8');
}

/**
 * Save uploaded document
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
  fs.writeFileSync(filePath, fileBuffer);

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
  const allMetadata = loadDocumentsMetadata();
  allMetadata.push(metadata);
  saveDocumentsMetadata(allMetadata);

  return metadata;
}

/**
 * Delete document
 */
export function deleteDocument(id: string): void {
  const allMetadata = loadDocumentsMetadata();
  const doc = allMetadata.find(d => d.id === id);

  if (!doc) {
    throw new Error('Document not found');
  }

  // Delete file
  const filePath = path.join(DOCUMENTS_DIR, doc.filename);
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  // Update metadata
  const updatedMetadata = allMetadata.filter(d => d.id !== id);
  saveDocumentsMetadata(updatedMetadata);
}

/**
 * Get document content
 */
export async function getDocumentContent(id: string): Promise<string> {
  const allMetadata = loadDocumentsMetadata();
  const doc = allMetadata.find(d => d.id === id);

  if (!doc) {
    throw new Error('Document not found');
  }

  const filePath = path.join(DOCUMENTS_DIR, doc.filename);
  return parseFileContent(filePath, doc.fileType);
}

/**
 * Read and parse all documents (legacy + uploaded)
 * Returns formatted knowledge context for AI
 */
export async function loadDocumentKnowledge(category?: string): Promise<string> {
  try {
    let documentContext = '';
    const MAX_DOC_LENGTH = 3000; // Limit each doc to ~3000 chars to save tokens
    const MAX_TOTAL_LENGTH = 12000; // Limit total context to ~12000 chars

    // Load legacy Word documents from data directory
    const dataDir = path.join(process.cwd(), 'data');
    if (fs.existsSync(dataDir)) {
      const legacyFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.docx'));

      for (const file of legacyFiles) {
        if (documentContext.length >= MAX_TOTAL_LENGTH) break;

        const filePath = path.join(dataDir, file);
        const buffer = fs.readFileSync(filePath);

        try {
          const result = await mammoth.extractRawText({ buffer });
          let text = result.value.trim();

          if (text) {
            // Truncate if too long
            if (text.length > MAX_DOC_LENGTH) {
              text = text.substring(0, MAX_DOC_LENGTH) + '... [content truncated]';
            }
            documentContext += `\n\n### Document: ${file}\n${text}\n`;
          }
        } catch (err) {
          console.error(`Error parsing legacy document ${file}:`, err);
        }
      }
    }

    // Load uploaded documents
    const allMetadata = loadDocumentsMetadata();
    const relevantDocs = category
      ? allMetadata.filter(doc => doc.category?.toLowerCase().includes(category.toLowerCase()))
      : allMetadata;

    for (const doc of relevantDocs) {
      if (documentContext.length >= MAX_TOTAL_LENGTH) break;

      try {
        let content = await getDocumentContent(doc.id);
        content = content.trim();

        if (content) {
          // Truncate if too long
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
