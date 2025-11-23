'use client';

import { useState, useRef } from 'react';

interface Props {
  onSubmit: (input: SkillBuildingData) => void;
  loading: boolean;
}

export interface SkillBuildingData {
  skill_topic: string;
  worker_name: string;
  context: string;
  resource_type: 'worksheet' | 'reading' | 'exercise' | 'any';
}

export default function SkillBuildingForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<SkillBuildingData>({
    skill_topic: '',
    worker_name: '',
    context: '',
    resource_type: 'any',
  });

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof SkillBuildingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Speech-to-text functionality
  const startDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    accumulatedTextRef.current = formData.context;

    recognition.onresult = (event: any) => {
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

      if (finalTranscript) {
        accumulatedTextRef.current += finalTranscript;
      }

      const fullText = accumulatedTextRef.current + interimTranscript;
      updateField('context', fullText);

      silenceTimerRef.current = setTimeout(() => {
        stopDictation();
      }, 10000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        stopDictation();
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skill/Topic */}
      <div>
        <label className="label" htmlFor="skill_topic">
          Skill or Challenge to Address *
        </label>
        <input
          id="skill_topic"
          type="text"
          className="input"
          placeholder="e.g., Setting boundaries with clients, Managing compassion fatigue..."
          value={formData.skill_topic}
          onChange={(e) => updateField('skill_topic', e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          What specific skill or challenge would you like to develop?
        </p>
      </div>

      {/* Worker Name */}
      <div>
        <label className="label" htmlFor="worker_name">
          Your Name (Optional)
        </label>
        <input
          id="worker_name"
          type="text"
          className="input"
          placeholder="e.g., Sarah"
          value={formData.worker_name}
          onChange={(e) => updateField('worker_name', e.target.value)}
        />
      </div>

      {/* Resource Type Preference */}
      <div>
        <label className="label" htmlFor="resource_type">
          Preferred Resource Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'any', label: '✨ Any', color: 'from-primary to-primary-light' },
            { value: 'worksheet', label: '📝 Worksheet', color: 'from-secondary to-secondary-light' },
            { value: 'reading', label: '📚 Reading', color: 'from-info to-cyan-500' },
            { value: 'exercise', label: '💪 Exercise', color: 'from-success to-emerald-500' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateField('resource_type', type.value as any)}
              className={`py-3 px-4 rounded-xl font-semibold transition-all transform ${
                formData.resource_type === type.value
                  ? `bg-gradient-to-r ${type.color} text-white shadow-lg scale-105`
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:shadow-md'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="label" htmlFor="context">
          Additional Context *
        </label>
        <div className="relative">
          <textarea
            id="context"
            className="input min-h-[150px]"
            placeholder="Describe the situation, challenges you're facing, or specific areas you want to focus on..."
            value={formData.context}
            onChange={(e) => updateField('context', e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => isRecording ? stopDictation() : startDictation()}
            className={`microphone-btn absolute bottom-3 right-3 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse shadow-lg'
                : 'bg-gradient-to-r from-secondary to-secondary-light text-white hover:shadow-md'
            }`}
            title={isRecording ? 'Stop recording' : 'Start dictation'}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Click microphone to dictate or type your context
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !formData.skill_topic.trim() || !formData.context.trim()}
        className="btn-accent w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Resources...
          </span>
        ) : (
          'Generate Skill Building Resources'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        AI will create customized learning materials tailored to your needs
      </p>
    </form>
  );
}
