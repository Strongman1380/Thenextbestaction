'use client';

import ReactMarkdown from 'react-markdown';
import { StreamStatus } from '@/lib/hooks/useStreamingAI';

interface StreamingContentProps {
  content: string;
  status: StreamStatus;
  statusMessage: string;
  warnings: string[];
  error: string | null;
  onCancel?: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
      />
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: '150ms', animationDuration: '0.6s' }}
      />
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: '300ms', animationDuration: '0.6s' }}
      />
    </div>
  );
}

function StatusBadge({ status, message }: { status: StreamStatus; message: string }) {
  const statusConfig = {
    idle: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Ready' },
    connecting: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Connecting' },
    streaming: { bg: 'bg-primary/10', text: 'text-primary', label: 'Generating' },
    done: { bg: 'bg-success/10', text: 'text-success', label: 'Complete' },
    error: { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status === 'streaming' && <TypingIndicator />}
      {status === 'connecting' && (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      <span>{message || config.label}</span>
    </div>
  );
}

export default function StreamingContent({
  content,
  status,
  statusMessage,
  warnings,
  error,
  onCancel,
}: StreamingContentProps) {
  const isActive = status === 'connecting' || status === 'streaming';

  return (
    <div className="card animate-fade-in space-y-4">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status} message={statusMessage} />

        {isActive && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
            >
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Content area */}
      {content && (
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
          {isActive && (
            <span className="inline-block w-2 h-5 bg-primary/60 animate-pulse ml-0.5" />
          )}
        </div>
      )}

      {/* Empty state while connecting */}
      {!content && status === 'connecting' && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <TypingIndicator />
            </div>
            <p className="text-sm text-gray-500">{statusMessage || 'Preparing...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
