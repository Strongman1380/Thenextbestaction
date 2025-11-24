'use client';

import { useState } from 'react';
import { TreatmentProtocol } from '@/lib/types/knowledge';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

interface TreatmentProtocolsManagerProps {
  protocols: TreatmentProtocol[];
  onChange: (protocols: TreatmentProtocol[]) => void;
}

export default function TreatmentProtocolsManager({ protocols, onChange }: TreatmentProtocolsManagerProps) {
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
  const [editingProtocol, setEditingProtocol] = useState<TreatmentProtocol | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const emptyProtocol: TreatmentProtocol = {
    id: Date.now().toString(),
    name: '',
    category: '',
    description: '',
    steps: [''],
    contraindications: [],
    expectedOutcomes: [],
    timeframe: '',
    relatedResources: [],
  };

  const startAdding = () => {
    setEditingProtocol(emptyProtocol);
    setIsAdding(true);
    setExpandedProtocol(emptyProtocol.id!);
  };

  const startEditing = (protocol: TreatmentProtocol) => {
    setEditingProtocol({ ...protocol });
    setIsAdding(false);
  };

  const saveProtocol = () => {
    if (!editingProtocol || !editingProtocol.name.trim() || !editingProtocol.category.trim()) {
      alert('Please fill in at least the name and category');
      return;
    }

    const cleanedProtocol = {
      ...editingProtocol,
      steps: editingProtocol.steps.filter(s => s.trim()),
      contraindications: editingProtocol.contraindications?.filter(c => c.trim()),
      expectedOutcomes: editingProtocol.expectedOutcomes?.filter(o => o.trim()),
      relatedResources: editingProtocol.relatedResources?.filter(r => r.trim()),
    };

    if (isAdding) {
      onChange([...protocols, cleanedProtocol]);
    } else {
      onChange(protocols.map(p => p.id === cleanedProtocol.id ? cleanedProtocol : p));
    }

    setEditingProtocol(null);
    setIsAdding(false);
  };

  const deleteProtocol = (id: string) => {
    if (!confirm('Delete this treatment protocol?')) return;
    onChange(protocols.filter(p => p.id !== id));
    if (expandedProtocol === id) setExpandedProtocol(null);
  };

  const cancelEditing = () => {
    setEditingProtocol(null);
    setIsAdding(false);
  };

  const updateField = (field: keyof TreatmentProtocol, value: any) => {
    if (editingProtocol) {
      setEditingProtocol({ ...editingProtocol, [field]: value });
    }
  };

  const addArrayItem = (field: 'steps' | 'contraindications' | 'expectedOutcomes' | 'relatedResources') => {
    if (editingProtocol) {
      const array = editingProtocol[field] || [];
      updateField(field, [...array, '']);
    }
  };

  const updateArrayItem = (
    field: 'steps' | 'contraindications' | 'expectedOutcomes' | 'relatedResources',
    index: number,
    value: string
  ) => {
    if (editingProtocol) {
      const array = [...(editingProtocol[field] || [])];
      array[index] = value;
      updateField(field, array);
    }
  };

  const removeArrayItem = (
    field: 'steps' | 'contraindications' | 'expectedOutcomes' | 'relatedResources',
    index: number
  ) => {
    if (editingProtocol) {
      const array = [...(editingProtocol[field] || [])];
      array.splice(index, 1);
      updateField(field, array);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Treatment Protocols</h2>
          <p className="text-sm text-gray-600">
            Define step-by-step treatment protocols. The AI will reference these when creating case plans for specific conditions.
          </p>
        </div>
        <button
          onClick={startAdding}
          disabled={isAdding || !!editingProtocol}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Protocol
        </button>
      </div>

      {/* Editing Form */}
      {editingProtocol && (
        <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdding ? 'New Treatment Protocol' : 'Edit Treatment Protocol'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={saveProtocol}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Protocol Name *</label>
                <input
                  type="text"
                  value={editingProtocol.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Opioid Withdrawal Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={editingProtocol.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., substance_use, mental_health"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editingProtocol.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief overview of this protocol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <input
                type="text"
                value={editingProtocol.timeframe || ''}
                onChange={(e) => updateField('timeframe', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 7-14 days, 6 weeks, 3 months"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Steps</label>
              {editingProtocol.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <span className="text-gray-500 text-sm mt-2">{index + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateArrayItem('steps', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this step"
                  />
                  <button
                    onClick={() => removeArrayItem('steps', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('steps')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Step
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraindications (Optional)</label>
              {(editingProtocol.contraindications || []).map((item, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('contraindications', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="When NOT to use this protocol"
                  />
                  <button
                    onClick={() => removeArrayItem('contraindications', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('contraindications')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Contraindication
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Outcomes (Optional)</label>
              {(editingProtocol.expectedOutcomes || []).map((item, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('expectedOutcomes', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What to expect if protocol is followed"
                  />
                  <button
                    onClick={() => removeArrayItem('expectedOutcomes', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('expectedOutcomes')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Outcome
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protocols List */}
      <div className="space-y-2">
        {protocols.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-400">
            No treatment protocols yet. Click "Add Protocol" to create one.
          </div>
        )}

        {protocols.map((protocol) => (
          <div key={protocol.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandedProtocol(expandedProtocol === protocol.id ? null : protocol.id!)}
            >
              <div className="flex items-center space-x-3 flex-1">
                {expandedProtocol === protocol.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{protocol.name}</h4>
                  <p className="text-sm text-gray-500">
                    {protocol.category} {protocol.timeframe && `• ${protocol.timeframe}`}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(protocol);
                  }}
                  disabled={!!editingProtocol}
                  className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProtocol(protocol.id!);
                  }}
                  disabled={!!editingProtocol}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedProtocol === protocol.id && (
              <div className="p-4 bg-white border-t border-gray-200">
                {protocol.description && (
                  <p className="text-sm text-gray-600 mb-4">{protocol.description}</p>
                )}

                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Steps:</h5>
                  <ol className="list-decimal list-inside space-y-1">
                    {protocol.steps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-600">{step}</li>
                    ))}
                  </ol>
                </div>

                {protocol.contraindications && protocol.contraindications.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Contraindications:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {protocol.contraindications.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {protocol.expectedOutcomes && protocol.expectedOutcomes.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Expected Outcomes:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {protocol.expectedOutcomes.map((item, index) => (
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
