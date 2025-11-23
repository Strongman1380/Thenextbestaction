export type UrgencyLevel = 'low' | 'medium' | 'high';

export type CrisisType =
  | 'withdrawal'
  | 'isolation'
  | 'family_conflict'
  | 'relapse_risk'
  | 'housing'
  | 'mental_health'
  | 'employment'
  | 'spiritual'
  | 'reentry'
  | 'followup';

export type ButtonType = 'call' | 'text' | 'schedule' | 'link';

export interface Playbook {
  id: string;
  domain: string;
  triggers: {
    crisis_type: CrisisType;
    urgency: UrgencyLevel;
  };
  action: string;
  script: string;
  resource_link: string;
  resource_label: string;
  button_type: ButtonType;
  rationale: string;
  compassion_note: string;
}

export interface CaseInput {
  crisis_type: CrisisType;
  urgency: UrgencyLevel;
  zip_code?: string;
  client_initials?: string;
  caseworker_name?: string;
  additional_context?: string;
}

export interface ActionRecommendation extends Playbook {
  personalized_script: string;
  timestamp: string;
  case_id?: string;
}

export interface MetricLog {
  timestamp: string;
  action_id: string;
  urgency: UrgencyLevel;
  crisis_type: CrisisType;
  completed?: boolean;
  feedback_score?: number;
  feedback_notes?: string;
}
