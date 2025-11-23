'use client';

import { useEffect, useState } from 'react';
import { getMetricsSummary } from '@/lib/engine';
import Link from 'next/link';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState({
    total_actions: 0,
    completion_rate: 0,
    avg_feedback_score: 0,
    by_urgency: {} as Record<string, number>,
  });

  useEffect(() => {
    setMetrics(getMetricsSummary());
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/" className="text-nrs-blue hover:underline text-sm">
          ← Back to Coach
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Impact Metrics
        </h1>
        <p className="text-gray-600">
          Tracking your team's usage and outcomes—celebrating progress, not perfection.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Total Actions */}
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Actions Suggested</div>
          <div className="text-4xl font-bold text-nrs-blue">
            {metrics.total_actions}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
          <div className="text-4xl font-bold text-nrs-hope">
            {metrics.completion_rate.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Target: 80%
          </div>
        </div>

        {/* Avg Feedback Score */}
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Avg. Helpfulness Score</div>
          <div className="text-4xl font-bold text-nrs-warmth">
            {metrics.avg_feedback_score > 0 ? metrics.avg_feedback_score.toFixed(1) : '—'}
            <span className="text-lg text-gray-500">/5</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Target: 4.0+
          </div>
        </div>
      </div>

      {/* Breakdown by Urgency */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Actions by Urgency Level
        </h2>
        <div className="space-y-3">
          {Object.entries(metrics.by_urgency).map(([urgency, count]) => (
            <div key={urgency} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                {urgency === 'high' && '🔴'}
                {urgency === 'medium' && '🟡'}
                {urgency === 'low' && '🟢'}
                {' '}{urgency}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full flex items-center justify-end pr-2 text-xs font-semibold text-white ${
                    urgency === 'high' ? 'bg-red-500' :
                    urgency === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(count / metrics.total_actions) * 100}%` }}
                >
                  {count > 0 && count}
                </div>
              </div>
              <div className="w-16 text-right text-sm text-gray-600">
                {metrics.total_actions > 0
                  ? `${((count / metrics.total_actions) * 100).toFixed(0)}%`
                  : '0%'
                }
              </div>
            </div>
          ))}
        </div>

        {metrics.total_actions === 0 && (
          <p className="text-center text-gray-500 py-8">
            No actions logged yet. Start using the coach to see metrics here.
          </p>
        )}
      </div>

      {/* Compassion Note */}
      <div className="mt-8 compassion-note">
        <p>
          💜 These numbers represent real people and real progress. Every action taken is a step
          toward hope and healing. Thank you for your dedicated care.
        </p>
      </div>
    </main>
  );
}
