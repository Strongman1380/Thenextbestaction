import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the path for the feedback log file in the project root
const logFilePath = path.join(process.cwd(), 'feedback.jsonl');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.contentType || !body.feedback || !body.generatedContent) {
      return NextResponse.json({ message: 'Missing required feedback fields.' }, { status: 400 });
    }

    // Create a log entry string from the JSON body
    const logEntry = JSON.stringify(body) + '\n';

    // Append the log entry to the file
    // The 'a' flag stands for 'append'
    await fs.appendFile(logFilePath, logEntry, 'utf8');

    return NextResponse.json({ message: 'Feedback logged successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to log feedback:', error);

    // Differentiate between parsing errors and file system errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

