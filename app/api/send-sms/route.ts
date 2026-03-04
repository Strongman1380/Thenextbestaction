import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/utils/error-handler';

// Twilio client - lazy initialization
let twilioClient: any = null;

function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return null;
    }

    // Dynamic import to avoid issues if Twilio is not installed
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

// Format phone number to E.164 format
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // If it starts with 1 and is 11 digits, it's already US format
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // If it's 10 digits, assume US and add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Otherwise return with + prefix
  return `+${cleaned}`;
}

// Convert markdown to plain text for SMS
function markdownToPlainText(markdown: string): string {
  return markdown
    // Remove bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Convert headers to plain text with line breaks
    .replace(/^#{1,6}\s+(.+)$/gm, '\n$1\n')
    // Convert bullet points
    .replace(/^[-*]\s+/gm, '• ')
    // Convert numbered lists
    .replace(/^\d+\.\s+/gm, (match) => match)
    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Truncate message for SMS (keeping it under 1600 chars for multi-part SMS)
function truncateForSMS(text: string, maxLength: number = 1500): string {
  if (text.length <= maxLength) return text;

  // Find a good breaking point
  const truncated = text.substring(0, maxLength);
  const lastNewline = truncated.lastIndexOf('\n');
  const lastPeriod = truncated.lastIndexOf('. ');

  const breakPoint = Math.max(lastNewline, lastPeriod);

  if (breakPoint > maxLength * 0.7) {
    return truncated.substring(0, breakPoint + 1) + '\n\n[Message truncated - full version available from your caseworker]';
  }

  return truncated + '...\n\n[Message truncated]';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, resourceContent, resourceTopic, clientName } = body;

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!resourceContent) {
      return NextResponse.json(
        { success: false, error: 'Resource content is required' },
        { status: 400 }
      );
    }

    // Check if Twilio is configured
    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!client || !fromNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMS service is not configured. Please contact your administrator.',
          code: 'SMS_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    // Format the phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Validate phone number format
    if (formattedPhone.length < 11 || formattedPhone.length > 15) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Convert markdown to plain text
    const plainTextContent = markdownToPlainText(resourceContent);

    // Build the message
    const greeting = clientName
      ? `Hi ${clientName},\n\n`
      : 'Hi,\n\n';

    const intro = `Your caseworker has shared a resource with you about "${resourceTopic}":\n\n`;

    const footer = '\n\n---\nSent with care from Next Right Step Recovery';

    const fullMessage = greeting + intro + plainTextContent + footer;

    // Truncate if needed
    const smsMessage = truncateForSMS(fullMessage);

    // Send the SMS
    const message = await client.messages.create({
      body: smsMessage,
      from: fromNumber,
      to: formattedPhone,
    });

    console.log(`SMS sent successfully: ${message.sid}`);

    return NextResponse.json({
      success: true,
      messageId: message.sid,
      message: 'Resource sent successfully!'
    });

  } catch (error: any) {
    logError(error, 'send-sms-api');

    // Handle specific Twilio errors
    if (error.code === 21211) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number. Please check the number and try again.' },
        { status: 400 }
      );
    }

    if (error.code === 21608) {
      return NextResponse.json(
        { success: false, error: 'This phone number cannot receive SMS messages.' },
        { status: 400 }
      );
    }

    if (error.code === 20003) {
      return NextResponse.json(
        { success: false, error: 'SMS service authentication failed. Please contact your administrator.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send SMS. Please try again.',
      },
      { status: 500 }
    );
  }
}
