'use client';

import { useState } from 'react';
import type { ActionRecommendation } from '@/types';
import ActionButton from './ActionButton';
import FeedbackModal from './FeedbackModal';

interface Props {
  recommendation: ActionRecommendation;
}

export default function ActionCard({ recommendation }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  const copyScript = () => {
    navigator.clipboard.writeText(recommendation.personalized_script);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  return (
    <>
      <div className="card space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-success text-white text-sm font-semibold rounded-full mb-2">
                {recommendation.domain}
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                {recommendation.action}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Your Next Step</span>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-primary">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Why this step?</h3>
          <p className="text-sm text-gray-700">{recommendation.rationale}</p>
        </div>

        {/* Script */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Your Script</h3>
            <button
              onClick={copyScript}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {scriptCopied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-800 leading-relaxed italic">
              "{recommendation.personalized_script}"
            </p>
          </div>
        </div>

        {/* Action Button */}
        <ActionButton
          link={recommendation.resource_link}
          label={recommendation.resource_label}
          type={recommendation.button_type}
        />

        {/* Compassion Note */}
        <div className="compassion-note">
          <p className="text-sm leading-relaxed">
            💜 {recommendation.compassion_note}
          </p>
        </div>

        {/* Feedback Prompt */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">Did this guidance help?</p>
          <button
            onClick={() => setShowFeedback(true)}
            className="btn-secondary text-sm"
          >
            Share Feedback
          </button>
        </div>
      </div>

      {/* Pause for Intuition Reminder */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <span className="text-2xl mr-2">🤲</span>
          Pause for Your Intuition
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          This tool offers guidance, but your relationship with the client and your professional wisdom matter most.
          If something feels off or you need support, reach out to your supervisor or clinical team.
        </p>
      </div>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        actionId={recommendation.id}
        urgency={recommendation.triggers.urgency}
        crisisType={recommendation.triggers.crisis_type}
      />
    </>
  );
}
