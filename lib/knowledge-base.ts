import fs from 'fs';
import path from 'path';

interface OrganizationInfo {
  name: string;
  location: string;
  mission: string;
  philosophy: string;
}

interface Resource {
  name: string;
  type: string;
  description: string;
  contact: string;
  eligibility: string;
}

interface Partnership {
  organization: string;
  services: string;
  contact: string;
  notes: string;
}

interface BestPractices {
  housing_crisis?: string[];
  substance_use?: string[];
  mental_health?: string[];
  [key: string]: string[] | undefined;
}

interface StaffContact {
  name: string;
  phone: string;
  email: string;
  hours: string;
}

interface ClientForm {
  name: string;
  location: string;
  required_for: string;
}

interface KnowledgeBase {
  organization: OrganizationInfo;
  internal_resources: Resource[];
  local_partnerships: Partnership[];
  best_practices: BestPractices;
  common_referral_paths: any;
  staff_contacts: Record<string, StaffContact>;
  client_forms_documents: ClientForm[];
  community_specific_info: any;
}

let cachedKnowledgeBase: KnowledgeBase | null = null;

/**
 * Load the organizational knowledge base from JSON file
 */
export function loadKnowledgeBase(): KnowledgeBase {
  if (cachedKnowledgeBase) {
    return cachedKnowledgeBase;
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'organizational-knowledge.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    cachedKnowledgeBase = JSON.parse(fileContent);
    return cachedKnowledgeBase as KnowledgeBase;
  } catch (error) {
    console.warn('Could not load knowledge base, using defaults:', error);
    // Return minimal default if file doesn't exist
    return {
      organization: {
        name: 'Next Right Step Recovery',
        location: 'Hastings, NE 68901',
        mission: 'Trauma-informed recovery support and case management',
        philosophy: 'Compassion in the chaos. Accountability without shame.'
      },
      internal_resources: [],
      local_partnerships: [],
      best_practices: {},
      common_referral_paths: {},
      staff_contacts: {},
      client_forms_documents: [],
      community_specific_info: {}
    };
  }
}

/**
 * Get relevant best practices for a specific need category
 */
export function getBestPractices(category: string): string[] {
  const kb = loadKnowledgeBase();
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');

  // Try exact match first
  if (kb.best_practices[normalizedCategory]) {
    return kb.best_practices[normalizedCategory] || [];
  }

  // Try partial matches
  const matchingKey = Object.keys(kb.best_practices).find(key =>
    key.includes(normalizedCategory) || normalizedCategory.includes(key)
  );

  return matchingKey ? kb.best_practices[matchingKey] || [] : [];
}

/**
 * Get internal resources matching a specific type or need
 */
export function getInternalResources(type?: string): Resource[] {
  const kb = loadKnowledgeBase();

  if (!type) {
    return kb.internal_resources;
  }

  return kb.internal_resources.filter(resource =>
    resource.type.toLowerCase().includes(type.toLowerCase()) ||
    resource.description.toLowerCase().includes(type.toLowerCase())
  );
}

/**
 * Get local partnerships that might be relevant
 */
export function getLocalPartnerships(serviceType?: string): Partnership[] {
  const kb = loadKnowledgeBase();

  if (!serviceType) {
    return kb.local_partnerships;
  }

  return kb.local_partnerships.filter(partner =>
    partner.services.toLowerCase().includes(serviceType.toLowerCase())
  );
}

/**
 * Get staff contact information
 */
export function getStaffContact(role: string): StaffContact | null {
  const kb = loadKnowledgeBase();
  return kb.staff_contacts[role] || null;
}

/**
 * Get community-specific information
 */
export function getCommunityInfo(location: string): any {
  const kb = loadKnowledgeBase();
  const normalizedLocation = location.toLowerCase().replace(/\s+/g, '_');
  return kb.community_specific_info[normalizedLocation] || null;
}

/**
 * Format knowledge base information for AI prompt context
 */
export function formatKnowledgeBaseContext(needType?: string, location?: string): string {
  const kb = loadKnowledgeBase();
  let context = `\n\n## ORGANIZATIONAL CONTEXT\n`;

  context += `Organization: ${kb.organization.name}\n`;
  context += `Location: ${kb.organization.location}\n`;
  context += `Mission: ${kb.organization.mission}\n`;
  context += `Philosophy: ${kb.organization.philosophy}\n`;

  // Add relevant best practices
  if (needType) {
    const practices = getBestPractices(needType);
    if (practices.length > 0) {
      context += `\n### Best Practices for ${needType}:\n`;
      practices.forEach(practice => {
        context += `- ${practice}\n`;
      });
    }
  }

  // Add internal resources
  const internalResources = getInternalResources(needType);
  if (internalResources.length > 0) {
    context += `\n### Internal Resources Available:\n`;
    internalResources.forEach(resource => {
      context += `- **${resource.name}** (${resource.type}): ${resource.description}\n`;
      context += `  Contact: ${resource.contact}\n`;
      context += `  Eligibility: ${resource.eligibility}\n`;
    });
  }

  // Add local partnerships
  const partnerships = getLocalPartnerships(needType);
  if (partnerships.length > 0) {
    context += `\n### Trusted Local Partners:\n`;
    partnerships.forEach(partner => {
      context += `- **${partner.organization}**: ${partner.services}\n`;
      context += `  Contact: ${partner.contact}\n`;
      if (partner.notes) {
        context += `  Notes: ${partner.notes}\n`;
      }
    });
  }

  // Add community-specific info if location provided
  if (location) {
    const communityInfo = getCommunityInfo(location);
    if (communityInfo) {
      context += `\n### Community-Specific Information:\n`;
      Object.entries(communityInfo).forEach(([key, value]) => {
        if (key !== 'notes') {
          context += `- ${key.replace(/_/g, ' ')}: ${value}\n`;
        }
      });
      if (communityInfo.notes) {
        context += `\nImportant: ${communityInfo.notes}\n`;
      }
    }
  }

  return context;
}

/**
 * Get common referral paths for a specific need
 */
export function getReferralPaths(needType: string): any {
  const kb = loadKnowledgeBase();
  const normalizedNeed = needType.toLowerCase().replace(/\s+/g, '_');

  return kb.common_referral_paths[normalizedNeed] || null;
}
