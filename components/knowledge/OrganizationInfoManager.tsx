'use client';

import { Organization } from '@/lib/types/knowledge';

interface OrganizationInfoManagerProps {
  organization: Organization;
  onChange: (organization: Organization) => void;
}

export default function OrganizationInfoManager({ organization, onChange }: OrganizationInfoManagerProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Organization Information</h2>
      <p className="text-sm text-gray-600 mb-6">
        This information is included in all AI-generated content to maintain your organization's voice and values.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            value={organization.name}
            onChange={(e) => onChange({ ...organization, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Next Right Step Recovery"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={organization.location}
            onChange={(e) => onChange({ ...organization, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Hastings, NE 68901"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mission Statement
          </label>
          <textarea
            value={organization.mission}
            onChange={(e) => onChange({ ...organization, mission: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your organization's mission and purpose"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Philosophy
          </label>
          <textarea
            value={organization.philosophy}
            onChange={(e) => onChange({ ...organization, philosophy: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your guiding principles and approach to care"
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: "Compassion in the chaos. Accountability without shame. Hope that's practical, not pie-in-the-sky."
          </p>
        </div>
      </div>
    </div>
  );
}
