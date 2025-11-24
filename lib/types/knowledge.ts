// Knowledge Base Type Definitions

export interface Organization {
  name: string;
  location: string;
  mission: string;
  philosophy: string;
}

export interface InternalResource {
  id?: string;
  name: string;
  type: string;
  description: string;
  contact: string;
  eligibility: string;
  categories?: string[];
}

export interface LocalPartnership {
  id?: string;
  organization: string;
  services: string;
  contact: string;
  address?: string;
  location?: string;
  notes: string;
  categories?: string[];
}

export interface BestPractice {
  id?: string;
  category: string;
  practice: string;
  description?: string;
  source?: string;
}

export interface TreatmentProtocol {
  id?: string;
  name: string;
  category: string;
  description: string;
  steps: string[];
  contraindications?: string[];
  expectedOutcomes?: string[];
  timeframe?: string;
  relatedResources?: string[];
}

export interface ClinicalGuideline {
  id?: string;
  name: string;
  category: string;
  situation: string;
  guidance: string[];
  redFlags?: string[];
  assessmentQuestions?: string[];
  evidenceBase?: string;
}

export interface ReferralPath {
  category: string;
  immediate?: string[];
  short_term?: string[];
  long_term?: string[];
}

export interface StaffContact {
  role: string;
  name: string;
  phone: string;
  email: string;
  hours: string;
}

export interface ClientDocument {
  id?: string;
  name: string;
  location: string;
  required_for: string;
}

export interface CommunityInfo {
  location: string;
  transportation?: string;
  food_resources?: string;
  healthcare?: string;
  notes?: string;
}

export interface KnowledgeBase {
  organization: Organization;
  internal_resources: InternalResource[];
  local_partnerships: LocalPartnership[];
  best_practices: { [category: string]: string[] };
  treatment_protocols?: TreatmentProtocol[];
  clinical_guidelines?: ClinicalGuideline[];
  common_referral_paths: { [category: string]: ReferralPath };
  staff_contacts: { [role: string]: Omit<StaffContact, 'role'> };
  client_forms_documents: ClientDocument[];
  community_specific_info: { [location: string]: Omit<CommunityInfo, 'location'> };
}

export type KnowledgeItemType =
  | 'best_practice'
  | 'treatment_protocol'
  | 'clinical_guideline'
  | 'internal_resource'
  | 'local_partnership'
  | 'referral_path'
  | 'staff_contact'
  | 'client_document'
  | 'community_info';

export interface KnowledgeSearchParams {
  query?: string;
  type?: KnowledgeItemType;
  category?: string;
}
