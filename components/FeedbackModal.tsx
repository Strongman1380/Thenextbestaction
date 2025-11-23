'use client';

import { useState } from 'react';
import type { CrisisType, UrgencyLevel } from '@/types';
import { logAction } from '@/lib/engine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  actionId: string;
  urgency: UrgencyLevel;
  crisisType: CrisisType;
}

export default function FeedbackModal({ isOpen, onClose, actionId, urgency, crisisType }: Props) {
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Log feedback
    logAction({
      timestamp: new Date().toISOString(),
      action_id: actionId,
      urgency,
      crisis_type: crisisType,
      completed: completed ?? undefined,
      feedback_score: score || undefined,
      feedback_notes: notes || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      // Reset form
      setCompleted(null);
      setScore(0);
      setNotes('');
      setSubmitted(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {!submitted ? (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Share Your Experience
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Completion */}
              <div>
                <label className="label">Did you follow through with this action?</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCompleted(true)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                      completed === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✓ Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompleted(false)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                      completed === false
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Not Yet
                  </button>
                </div>
              </div>

              {/* Score */}
              <div>
                <label className="label">How helpful was this guidance? (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setScore(num)}
                      className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                        score === num
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Any additional thoughts? (Optional)</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="What worked? What could be better?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600">
              Your feedback helps us serve you better.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
