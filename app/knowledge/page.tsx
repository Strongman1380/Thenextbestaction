'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { KnowledgeBase, KnowledgeItemType } from '@/lib/types/knowledge';
import { Plus, Search, Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import BestPracticesManager from '@/components/knowledge/BestPracticesManager';
import TreatmentProtocolsManager from '@/components/knowledge/TreatmentProtocolsManager';
import ClinicalGuidelinesManager from '@/components/knowledge/ClinicalGuidelinesManager';
import InternalResourcesManager from '@/components/knowledge/InternalResourcesManager';
import LocalPartnershipsManager from '@/components/knowledge/LocalPartnershipsManager';
import OrganizationInfoManager from '@/components/knowledge/OrganizationInfoManager';
import DocumentsManager from '@/components/knowledge/DocumentsManager';
import PINProtection from '@/components/PINProtection';

export default function KnowledgeManagementPage() {
  // Default to unlocked for easier access
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<string>('organization');
  const [searchQuery, setSearchQuery] = useState('');

  // Check session storage for unlock status
  useEffect(() => {
    const unlocked = sessionStorage.getItem('knowledge_base_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      loadKnowledgeBase();
    }
  }, [isUnlocked]);

  const loadKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/knowledge');
      if (!response.ok) throw new Error('Failed to load knowledge base');
      const data = await response.json();
      setKnowledgeBase(data);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const saveKnowledgeBase = async () => {
    if (!knowledgeBase) return;

    setSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/knowledge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledgeBase),
      });

      if (!response.ok) throw new Error('Failed to save knowledge base');

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving knowledge base:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'organization', label: 'Organization Info', icon: '🏢' },
    { id: 'best_practices', label: 'Best Practices', icon: '✓' },
    { id: 'treatment_protocols', label: 'Treatment Protocols', icon: '📋' },
    { id: 'clinical_guidelines', label: 'Clinical Guidelines', icon: '🩺' },
    { id: 'internal_resources', label: 'Internal Resources', icon: '🏠' },
    { id: 'local_partnerships', label: 'Local Partnerships', icon: '🤝' },
    { id: 'documents', label: 'Documents', icon: '📄' },
  ];

  // Show PIN protection if not unlocked
  if (!isUnlocked) {
    return <PINProtection onUnlock={() => setIsUnlocked(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  if (!knowledgeBase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load knowledge base</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage the information that powers AI-generated case plans and skill resources
                </p>
              </div>
              <button
                onClick={saveKnowledgeBase}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Save Status */}
            {saveStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">Knowledge base saved successfully!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-800">Failed to save changes. Please try again.</span>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'organization' && (
          <OrganizationInfoManager
            organization={knowledgeBase.organization}
            onChange={(org) => setKnowledgeBase({ ...knowledgeBase, organization: org })}
          />
        )}

        {activeTab === 'best_practices' && (
          <BestPracticesManager
            bestPractices={knowledgeBase.best_practices}
            onChange={(practices) => setKnowledgeBase({ ...knowledgeBase, best_practices: practices })}
          />
        )}

        {activeTab === 'treatment_protocols' && (
          <TreatmentProtocolsManager
            protocols={knowledgeBase.treatment_protocols || []}
            onChange={(protocols) => setKnowledgeBase({ ...knowledgeBase, treatment_protocols: protocols })}
          />
        )}

        {activeTab === 'clinical_guidelines' && (
          <ClinicalGuidelinesManager
            guidelines={knowledgeBase.clinical_guidelines || []}
            onChange={(guidelines) => setKnowledgeBase({ ...knowledgeBase, clinical_guidelines: guidelines })}
          />
        )}

        {activeTab === 'internal_resources' && (
          <InternalResourcesManager
            resources={knowledgeBase.internal_resources}
            onChange={(resources) => setKnowledgeBase({ ...knowledgeBase, internal_resources: resources })}
          />
        )}

        {activeTab === 'local_partnerships' && (
          <LocalPartnershipsManager
            partnerships={knowledgeBase.local_partnerships}
            onChange={(partnerships) => setKnowledgeBase({ ...knowledgeBase, local_partnerships: partnerships })}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsManager />
        )}
      </div>
    </div>
  );
}
