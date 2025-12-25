'use client';

import { useState, useCallback, useRef } from 'react';

export type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error';

interface StreamEvent {
  type: 'status' | 'content' | 'done' | 'error' | 'warning';
  status?: string;
  content?: string;
  message?: string;
  error?: string;
}

interface StreamState {
  content: string;
  status: StreamStatus;
  statusMessage: string;
  error: string | null;
  warnings: string[];
}

interface UseStreamingAIReturn extends StreamState {
  stream: (data: any) => Promise<string>;
  reset: () => void;
  abort: () => void;
}

export function useStreamingAI(endpoint: string): UseStreamingAIReturn {
  const [state, setState] = useState<StreamState>({
    content: '',
    status: 'idle',
    statusMessage: '',
    error: null,
    warnings: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      content: '',
      status: 'idle',
      statusMessage: '',
      error: null,
      warnings: [],
    });
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        status: 'idle',
        statusMessage: 'Cancelled',
      }));
    }
  }, []);

  const stream = useCallback(async (data: any): Promise<string> => {
    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState({
      content: '',
      status: 'connecting',
      statusMessage: 'Connecting...',
      error: null,
      warnings: [],
    });

    let fullContent = '';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      setState(prev => ({ ...prev, status: 'streaming' }));

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const event: StreamEvent = JSON.parse(trimmed.slice(6));

            switch (event.type) {
              case 'status':
                setState(prev => ({
                  ...prev,
                  statusMessage: event.status || '',
                }));
                break;

              case 'content':
                if (event.content) {
                  fullContent += event.content;
                  setState(prev => ({
                    ...prev,
                    content: prev.content + event.content,
                  }));
                }
                break;

              case 'warning':
                if (event.message) {
                  setState(prev => ({
                    ...prev,
                    warnings: [...prev.warnings, event.message!],
                  }));
                }
                break;

              case 'done':
                setState(prev => ({
                  ...prev,
                  status: 'done',
                  statusMessage: 'Complete',
                }));
                break;

              case 'error':
                setState(prev => ({
                  ...prev,
                  status: 'error',
                  error: event.error || 'An error occurred',
                }));
                break;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      return fullContent;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          status: 'idle',
          statusMessage: 'Cancelled',
        }));
        return fullContent;
      }

      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'An unexpected error occurred',
      }));

      throw error;
    }
  }, [endpoint]);

  return {
    ...state,
    stream,
    reset,
    abort,
  };
}
