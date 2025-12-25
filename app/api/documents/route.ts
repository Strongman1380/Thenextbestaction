import { NextRequest, NextResponse } from 'next/server';
import { loadDocumentsMetadata, saveDocument, deleteDocument } from '@/lib/document-parser';

// GET - List all documents (optionally filtered by category)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let documents = await loadDocumentsMetadata();

    // Ensure documents is an array
    if (!Array.isArray(documents)) {
      documents = [];
    }

    // Filter by category if provided
    if (category) {
      documents = documents.filter(doc => doc.category === category);
    }

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error('Error loading documents:', error);
    return NextResponse.json(
      { success: false, error: error.message, documents: [] },
      { status: 500 }
    );
  }
}

// POST - Upload new document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save document
    const metadata = await saveDocument(
      buffer,
      file.name,
      file.type,
      category || undefined,
      description || undefined
    );

    return NextResponse.json({
      success: true,
      document: metadata,
      message: 'Document uploaded successfully'
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Document ID required' },
        { status: 400 }
      );
    }

    await deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
