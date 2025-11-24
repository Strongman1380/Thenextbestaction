import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { KnowledgeBase } from '@/lib/types/knowledge';

const KNOWLEDGE_FILE_PATH = path.join(process.cwd(), 'data', 'organizational-knowledge.json');

// GET - Read entire knowledge base
export async function GET(request: NextRequest) {
  try {
    const fileContent = await fs.readFile(KNOWLEDGE_FILE_PATH, 'utf-8');
    const knowledgeBase: KnowledgeBase = JSON.parse(fileContent);

    return NextResponse.json(knowledgeBase);
  } catch (error) {
    console.error('Error reading knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to load knowledge base' },
      { status: 500 }
    );
  }
}

// PUT - Update entire knowledge base
export async function PUT(request: NextRequest) {
  try {
    const knowledgeBase: KnowledgeBase = await request.json();

    // Write to file with pretty formatting
    await fs.writeFile(
      KNOWLEDGE_FILE_PATH,
      JSON.stringify(knowledgeBase, null, 2),
      'utf-8'
    );

    return NextResponse.json({ success: true, message: 'Knowledge base updated successfully' });
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge base' },
      { status: 500 }
    );
  }
}
