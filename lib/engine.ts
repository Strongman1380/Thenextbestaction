import type { CaseInput, ActionRecommendation, Playbook, MetricLog } from '@/types';
import playbooks from '@/data/playbooks.json';

/**
 * Core decision engine - Rules-based matching
 * Prioritizes exact urgency + crisis type match
 * Falls back to escalation if no match found
 */
export function getNextBestAction(input: CaseInput): ActionRecommendation {
  const { crisis_type, urgency, client_initials, caseworker_name } = input;

  // Find matching playbook
  const matches = (playbooks as Playbook[]).filter(
    p => p.triggers.crisis_type === crisis_type && p.triggers.urgency === urgency
  );

  if (matches.length > 0) {
    const playbook = matches[0]; // Take first match (can add priority weighting later)

    // Personalize the script with actual names
    let personalizedScript = playbook.script;
    if (caseworker_name) {
      personalizedScript = personalizedScript.replace('[Your Name]', caseworker_name);
    }
    if (client_initials) {
      personalizedScript = personalizedScript.replace('[Client Initials]', client_initials);
      personalizedScript = personalizedScript.replace('[Client Name]', client_initials);
    }

    return {
      ...playbook,
      personalized_script: personalizedScript,
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback: Escalation recommendation
  return {
    id: 'escalate-supervisor',
    domain: 'Escalation',
    triggers: { crisis_type, urgency },
    action: 'Escalate to Supervisor',
    script: 'This situation needs team wisdom. Pause and connect with your supervisor or clinical lead for guidance.',
    personalized_script: 'This situation needs team wisdom. Pause and connect with your supervisor or clinical lead for guidance.',
    resource_link: 'internal:supervisor-chat',
    resource_label: 'Contact Supervisor',
    button_type: 'link',
    rationale: 'When complexity exceeds playbook scope, collective wisdom ensures safety and quality care.',
    compassion_note: 'Asking for help is strength, not weakness. Your client benefits from the team care.',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log action for metrics tracking
 * Writes to simple append-only log (can be upgraded to DB later)
 */
export function logAction(log: MetricLog): void {
  // For MVP: Store in memory/local file
  // For production: Send to analytics service or database
  if (typeof window !== 'undefined') {
    const logs = JSON.parse(localStorage.getItem('nrs_action_logs') || '[]');
    logs.push(log);
    localStorage.setItem('nrs_action_logs', JSON.stringify(logs));
  }
}

/**
 * Get basic metrics summary
 */
export function getMetricsSummary(): {
  total_actions: number;
  completion_rate: number;
  avg_feedback_score: number;
  by_urgency: Record<string, number>;
} {
  if (typeof window === 'undefined') {
    return { total_actions: 0, completion_rate: 0, avg_feedback_score: 0, by_urgency: {} };
  }

  const logs: MetricLog[] = JSON.parse(localStorage.getItem('nrs_action_logs') || '[]');

  const completed = logs.filter(l => l.completed === true);
  const withFeedback = logs.filter(l => l.feedback_score !== undefined);

  const by_urgency = logs.reduce((acc, log) => {
    acc[log.urgency] = (acc[log.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total_actions: logs.length,
    completion_rate: logs.length > 0 ? (completed.length / logs.length) * 100 : 0,
    avg_feedback_score: withFeedback.length > 0
      ? withFeedback.reduce((sum, l) => sum + (l.feedback_score || 0), 0) / withFeedback.length
      : 0,
    by_urgency,
  };
}

/**
 * Get all available crisis types for form dropdown
 */
export function getCrisisTypes(): Array<{ value: string; label: string }> {
  return [
    { value: 'withdrawal', label: 'Acute Crisis - Withdrawal/Overdose' },
    { value: 'isolation', label: 'Isolation/Loneliness' },
    { value: 'family_conflict', label: 'Family Conflict' },
    { value: 'relapse_risk', label: 'Relapse Risk' },
    { value: 'housing', label: 'Housing Instability' },
    { value: 'mental_health', label: 'Mental Health (Co-Occurring)' },
    { value: 'employment', label: 'Employment Barrier' },
    { value: 'spiritual', label: 'Spiritual Disconnect' },
    { value: 'reentry', label: 'Re-Entry Support' },
    { value: 'followup', label: 'Follow-Up Check-In' },
  ];
}
