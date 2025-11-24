'use client';

import { useState } from 'react';
import { ClinicalGuideline } from '@/lib/types/knowledge';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

interface ClinicalGuidelinesManagerProps {
  guidelines: ClinicalGuideline[];
  onChange: (guidelines: ClinicalGuideline[]) => void;
}

export default function ClinicalGuidelinesManager({ guidelines, onChange }: ClinicalGuidelinesManagerProps) {
  const [expandedGuideline, setExpandedGuideline] = useState<string | null>(null);
  const [editingGuideline, setEditingGuideline] = useState<ClinicalGuideline | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const emptyGuideline: ClinicalGuideline = {
    id: Date.now().toString(),
    name: '',
    category: '',
    situation: '',
    guidance: [''],
    redFlags: [],
    assessmentQuestions: [],
    evidenceBase: '',
  };

  const startAdding = () => {
    setEditingGuideline(emptyGuideline);
    setIsAdding(true);
    setExpandedGuideline(emptyGuideline.id!);
  };

  const startEditing = (guideline: ClinicalGuideline) => {
    setEditingGuideline({ ...guideline });
    setIsAdding(false);
  };

  const saveGuideline = () => {
    if (!editingGuideline || !editingGuideline.name.trim() || !editingGuideline.category.trim()) {
      alert('Please fill in at least the name and category');
      return;
    }

    const cleanedGuideline = {
      ...editingGuideline,
      guidance: editingGuideline.guidance.filter(g => g.trim()),
      redFlags: editingGuideline.redFlags?.filter(r => r.trim()),
      assessmentQuestions: editingGuideline.assessmentQuestions?.filter(q => q.trim()),
    };

    if (isAdding) {
      onChange([...guidelines, cleanedGuideline]);
    } else {
      onChange(guidelines.map(g => g.id === cleanedGuideline.id ? cleanedGuideline : g));
    }

    setEditingGuideline(null);
    setIsAdding(false);
  };

  const deleteGuideline = (id: string) => {
    if (!confirm('Delete this clinical guideline?')) return;
    onChange(guidelines.filter(g => g.id !== id));
    if (expandedGuideline === id) setExpandedGuideline(null);
  };

  const cancelEditing = () => {
    setEditingGuideline(null);
    setIsAdding(false);
  };

  const updateField = (field: keyof ClinicalGuideline, value: any) => {
    if (editingGuideline) {
      setEditingGuideline({ ...editingGuideline, [field]: value });
    }
  };

  const addArrayItem = (field: 'guidance' | 'redFlags' | 'assessmentQuestions') => {
    if (editingGuideline) {
      const array = editingGuideline[field] || [];
      updateField(field, [...array, '']);
    }
  };

  const updateArrayItem = (field: 'guidance' | 'redFlags' | 'assessmentQuestions', index: number, value: string) => {
    if (editingGuideline) {
      const array = [...(editingGuideline[field] || [])];
      array[index] = value;
      updateField(field, array);
    }
  };

  const removeArrayItem = (field: 'guidance' | 'redFlags' | 'assessmentQuestions', index: number) => {
    if (editingGuideline) {
      const array = [...(editingGuideline[field] || [])];
      array.splice(index, 1);
      updateField(field, array);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinical Guidelines</h2>
          <p className="text-sm text-gray-600">
            Define clinical guidelines for specific situations. The AI will reference these to provide appropriate guidance.
          </p>
        </div>
        <button
          onClick={startAdding}
          disabled={isAdding || !!editingGuideline}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Guideline
        </button>
      </div>

      {/* Editing Form */}
      {editingGuideline && (
        <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdding ? 'New Clinical Guideline' : 'Edit Clinical Guideline'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={saveGuideline}
                className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
              <button
                onClick={cancelEditing}
                className="inline-flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guideline Name *</label>
                <input
                  type="text"
                  value={editingGuideline.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Suicide Risk Assessment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={editingGuideline.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., mental_health, crisis_intervention"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Situation</label>
              <textarea
                value={editingGuideline.situation}
                onChange={(e) => updateField('situation', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="When to use this guideline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Base (Optional)</label>
              <input
                type="text"
                value={editingGuideline.evidenceBase || ''}
                onChange={(e) => updateField('evidenceBase', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Based on Columbia Suicide Severity Rating Scale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guidance Steps</label>
              {editingGuideline.guidance.map((item, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <span className="text-gray-500 text-sm mt-2">{index + 1}.</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('guidance', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What to do"
                  />
                  <button
                    onClick={() => removeArrayItem('guidance', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('guidance')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Guidance
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Red Flags (Optional)</label>
              {(editingGuideline.redFlags || []).map((item, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('redFlags', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Warning signs to watch for"
                  />
                  <button
                    onClick={() => removeArrayItem('redFlags', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('redFlags')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Red Flag
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Questions (Optional)</label>
              {(editingGuideline.assessmentQuestions || []).map((item, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('assessmentQuestions', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Questions to ask during assessment"
                  />
                  <button
                    onClick={() => removeArrayItem('assessmentQuestions', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('assessmentQuestions')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines List */}
      <div className="space-y-2">
        {guidelines.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-400">
            No clinical guidelines yet. Click "Add Guideline" to create one.
          </div>
        )}

        {guidelines.map((guideline) => (
          <div key={guideline.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandedGuideline(expandedGuideline === guideline.id ? null : guideline.id!)}
            >
              <div className="flex items-center space-x-3 flex-1">
                {expandedGuideline === guideline.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{guideline.name}</h4>
                  <p className="text-sm text-gray-500">{guideline.category}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(guideline);
                  }}
                  disabled={!!editingGuideline}
                  className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGuideline(guideline.id!);
                  }}
                  disabled={!!editingGuideline}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedGuideline === guideline.id && (
              <div className="p-4 bg-white border-t border-gray-200">
                {guideline.situation && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Situation:</h5>
                    <p className="text-sm text-gray-600">{guideline.situation}</p>
                  </div>
                )}

                {guideline.evidenceBase && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Evidence Base:</h5>
                    <p className="text-sm text-gray-600">{guideline.evidenceBase}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Guidance:</h5>
                  <ol className="list-decimal list-inside space-y-1">
                    {guideline.guidance.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">{item}</li>
                    ))}
                  </ol>
                </div>

                {guideline.redFlags && guideline.redFlags.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-red-700 mb-2">Red Flags:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {guideline.redFlags.map((item, index) => (
                        <li key={index} className="text-sm text-red-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {guideline.assessmentQuestions && guideline.assessmentQuestions.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Assessment Questions:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {guideline.assessmentQuestions.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
