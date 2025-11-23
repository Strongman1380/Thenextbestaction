'use client';

import { useState, useRef } from 'react';
import type { UrgencyLevel } from '@/types';

interface Props {
  onSubmit: (input: FormData) => void;
  loading: boolean;
}

export interface FormData {
  primary_need: string;
  urgency: UrgencyLevel;
  client_initials: string;
  caseworker_name: string;
  zip_code: string;
  additional_context: string;
}

export default function CaseInputForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<FormData>({
    primary_need: '',
    urgency: 'medium',
    client_initials: '',
    caseworker_name: '',
    zip_code: '',
    additional_context: '',
  });

  const [isRecordingPrimary, setIsRecordingPrimary] = useState(false);
  const [isRecordingContext, setIsRecordingContext] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Speech-to-text functionality with accumulation and auto-stop
  const startDictation = (field: 'primary_need' | 'additional_context') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Initialize accumulated text with current field value
    accumulatedTextRef.current = formData[field];

    recognition.onresult = (event: any) => {
      // Clear the silence timer since we're getting speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Accumulate final transcripts
      if (finalTranscript) {
        accumulatedTextRef.current += finalTranscript;
      }

      // Update the field with accumulated + interim text
      const fullText = accumulatedTextRef.current + interimTranscript;
      updateField(field, fullText);

      // Set a new 10-second silence timer
      silenceTimerRef.current = setTimeout(() => {
        stopDictation();
      }, 10000); // 10 seconds of silence
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        stopDictation();
      }
    };

    recognition.onend = () => {
      if (field === 'primary_need') setIsRecordingPrimary(false);
      if (field === 'additional_context') setIsRecordingContext(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    if (field === 'primary_need') setIsRecordingPrimary(true);
    if (field === 'additional_context') setIsRecordingContext(true);
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingPrimary(false);
      setIsRecordingContext(false);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Primary Need */}
      <div>
        <label className="label" htmlFor="primary_need">
          Primary Need *
        </label>
        <div className="relative">
          <textarea
            id="primary_need"
            className="input min-h-[100px]"
            placeholder="Describe or dictate the primary need..."
            value={formData.primary_need}
            onChange={(e) => updateField('primary_need', e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => isRecordingPrimary ? stopDictation() : startDictation('primary_need')}
            className={`microphone-btn absolute bottom-3 right-3 ${
              isRecordingPrimary
                ? 'bg-red-500 text-white animate-pulse shadow-lg'
                : 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-md'
            }`}
            title={isRecordingPrimary ? 'Stop recording' : 'Start dictation'}
          >
            {isRecordingPrimary ? '⏹' : '🎤'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Click microphone to dictate or type the primary need
        </p>
      </div>

      {/* Urgency */}
      <div>
        <label className="label" htmlFor="urgency">
          Urgency Level *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['low', 'medium', 'high'] as UrgencyLevel[]).map(level => (
            <button
              key={level}
              type="button"
              onClick={() => updateField('urgency', level)}
              className={`py-4 px-4 rounded-xl font-semibold transition-all transform ${
                formData.urgency === level
                  ? level === 'high'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg scale-105'
                    : level === 'medium'
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:shadow-md'
              }`}
            >
              {level === 'low' && '🟢 Low'}
              {level === 'medium' && '🟡 Medium'}
              {level === 'high' && '🔴 High'}
            </button>
          ))}
        </div>
      </div>

      {/* Client Initials & Worker Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="client_initials">
            Client Initials
          </label>
          <input
            id="client_initials"
            type="text"
            className="input"
            placeholder="e.g., J.D."
            value={formData.client_initials}
            onChange={(e) => updateField('client_initials', e.target.value)}
            maxLength={10}
          />
        </div>

        <div>
          <label className="label" htmlFor="caseworker_name">
            Your Name (Worker Name)
          </label>
          <input
            id="caseworker_name"
            type="text"
            className="input"
            placeholder="e.g., Sarah"
            value={formData.caseworker_name}
            onChange={(e) => updateField('caseworker_name', e.target.value)}
          />
        </div>
      </div>

      {/* ZIP Code */}
      <div>
        <label className="label" htmlFor="zip_code">
          ZIP Code (for local resource search)
        </label>
        <input
          id="zip_code"
          type="text"
          className="input"
          placeholder="e.g., 60601"
          value={formData.zip_code}
          onChange={(e) => updateField('zip_code', e.target.value)}
          maxLength={5}
          pattern="[0-9]{5}"
        />
        <p className="text-xs text-gray-500 mt-1">
          We'll search for local resources based on your location
        </p>
      </div>

      {/* Additional Context */}
      <div>
        <label className="label" htmlFor="additional_context">
          Additional Context
        </label>
        <div className="relative">
          <textarea
            id="additional_context"
            className="input min-h-[120px]"
            placeholder="Transcribe or dictate additional information..."
            value={formData.additional_context}
            onChange={(e) => updateField('additional_context', e.target.value)}
          />
          <button
            type="button"
            onClick={() => isRecordingContext ? stopDictation() : startDictation('additional_context')}
            className={`microphone-btn absolute bottom-3 right-3 ${
              isRecordingContext
                ? 'bg-red-500 text-white animate-pulse shadow-lg'
                : 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-md'
            }`}
            title={isRecordingContext ? 'Stop recording' : 'Start dictation'}
          >
            {isRecordingContext ? '⏹' : '🎤'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Click microphone to dictate or type additional context
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !formData.primary_need.trim()}
        className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Case Plan...
          </span>
        ) : (
          'Generate Next Best Action'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        AI will analyze your input and create a comprehensive case plan
      </p>
    </form>
  );
}
