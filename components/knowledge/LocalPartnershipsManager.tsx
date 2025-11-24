'use client';

import { useState } from 'react';
import { LocalPartnership } from '@/lib/types/knowledge';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface LocalPartnershipsManagerProps {
  partnerships: LocalPartnership[];
  onChange: (partnerships: LocalPartnership[]) => void;
}

export default function LocalPartnershipsManager({ partnerships, onChange }: LocalPartnershipsManagerProps) {
  const [editingPartnership, setEditingPartnership] = useState<LocalPartnership | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const emptyPartnership: LocalPartnership = {
    id: Date.now().toString(),
    organization: '',
    services: '',
    contact: '',
    address: '',
    location: '',
    notes: '',
    categories: [],
  };

  const startAdding = () => {
    setEditingPartnership(emptyPartnership);
    setIsAdding(true);
  };

  const startEditing = (partnership: LocalPartnership) => {
    setEditingPartnership({ ...partnership });
    setIsAdding(false);
  };

  const savePartnership = () => {
    if (!editingPartnership || !editingPartnership.organization.trim()) {
      alert('Please fill in at least the organization name');
      return;
    }

    if (isAdding) {
      onChange([...partnerships, editingPartnership]);
    } else {
      onChange(partnerships.map(p => p.id === editingPartnership.id ? editingPartnership : p));
    }

    setEditingPartnership(null);
    setIsAdding(false);
  };

  const deletePartnership = (id: string) => {
    if (!confirm('Delete this partnership?')) return;
    onChange(partnerships.filter(p => p.id !== id));
  };

  const cancelEditing = () => {
    setEditingPartnership(null);
    setIsAdding(false);
  };

  const updateField = (field: keyof LocalPartnership, value: any) => {
    if (editingPartnership) {
      setEditingPartnership({ ...editingPartnership, [field]: value });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Local Partnerships</h2>
          <p className="text-sm text-gray-600">
            External organizations you work with. These will be included in case plans as referral options.
          </p>
        </div>
        <button
          onClick={startAdding}
          disabled={isAdding || !!editingPartnership}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Partnership
        </button>
      </div>

      {/* Editing Form */}
      {editingPartnership && (
        <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdding ? 'New Local Partnership' : 'Edit Local Partnership'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={savePartnership}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={editingPartnership.organization}
                  onChange={(e) => updateField('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lexington Regional Health Center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services Provided</label>
                <input
                  type="text"
                  value={editingPartnership.services}
                  onChange={(e) => updateField('services', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Behavioral Health Services"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="text"
                  value={editingPartnership.contact}
                  onChange={(e) => updateField('contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone: 555-1234 | http://example.org"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingPartnership.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hastings, NE"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={editingPartnership.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={editingPartnership.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Special arrangements, referral process, or other notes"
              />
            </div>
          </div>
        </div>
      )}

      {/* Partnerships List */}
      <div className="space-y-2">
        {partnerships.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-400">
            No local partnerships yet. Click "Add Partnership" to create one.
          </div>
        )}

        {partnerships.map((partnership) => (
          <div key={partnership.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{partnership.organization}</h4>
                  {partnership.location && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {partnership.location}
                    </span>
                  )}
                </div>
                {partnership.services && (
                  <p className="text-sm text-gray-600 mb-2">{partnership.services}</p>
                )}
                <div className="space-y-1 text-sm">
                  {partnership.contact && (
                    <div>
                      <span className="font-medium text-gray-700">Contact:</span>
                      <span className="ml-2 text-gray-600">{partnership.contact}</span>
                    </div>
                  )}
                  {partnership.address && (
                    <div>
                      <span className="font-medium text-gray-700">Address:</span>
                      <span className="ml-2 text-gray-600">{partnership.address}</span>
                    </div>
                  )}
                  {partnership.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <span className="ml-2 text-gray-600">{partnership.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => startEditing(partnership)}
                  disabled={!!editingPartnership}
                  className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePartnership(partnership.id!)}
                  disabled={!!editingPartnership}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
