"use client";

import { useState } from 'react';

interface FeedbackButtonsProps {
  contentId: string;
  contentType: 'case-plan' | 'skill-resource' | 'client-resource';
  generatedContent: string;
}

export default function FeedbackButtons({ contentId, contentType, generatedContent }: FeedbackButtonsProps) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [error, setError] = useState('');

  const handleFeedback = async (isPositive: boolean) => {
    if (feedbackSent) return;
    setError('');

    try {
      const response = await fetch('/api/log-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          contentType,
          feedback: isPositive ? 'positive' : 'negative',
          generatedContent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback.');
      }

      setFeedbackSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      // Optionally reset state to allow retrying
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  if (feedbackSent) {
    return (
      <div className="mt-4 text-center text-sm text-gray-500">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-center space-x-4">
      <span className="text-sm text-gray-600">Was this helpful?</span>
      <button
        onClick={() => handleFeedback(true)}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Helpful"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-2-2v-7a2 2 0 012-2h2V6a2 2 0 012-2h-1zM6 21H3a2 2 0 01-2-2v-7a2 2 0 012-2h3v9z" />
        </svg>
      </button>
      <button
        onClick={() => handleFeedback(false)}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Not Helpful"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017a2 2 0 012 2v7a2 2 0 01-2 2h-2v4a2 2 0 01-2 2h1zM18 3h3a2 2 0 012 2v7a2 2 0 01-2 2h-3V3z" />
        </svg>
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
