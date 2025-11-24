'use client';

import { useState } from 'react';
import { InternalResource } from '@/lib/types/knowledge';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface InternalResourcesManagerProps {
  resources: InternalResource[];
  onChange: (resources: InternalResource[]) => void;
}

export default function InternalResourcesManager({ resources, onChange }: InternalResourcesManagerProps) {
  const [editingResource, setEditingResource] = useState<InternalResource | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const emptyResource: InternalResource = {
    id: Date.now().toString(),
    name: '',
    type: '',
    description: '',
    contact: '',
    eligibility: '',
    categories: [],
  };

  const startAdding = () => {
    setEditingResource(emptyResource);
    setIsAdding(true);
  };

  const startEditing = (resource: InternalResource) => {
    setEditingResource({ ...resource });
    setIsAdding(false);
  };

  const saveResource = () => {
    if (!editingResource || !editingResource.name.trim()) {
      alert('Please fill in at least the name');
      return;
    }

    if (isAdding) {
      onChange([...resources, editingResource]);
    } else {
      onChange(resources.map(r => r.id === editingResource.id ? editingResource : r));
    }

    setEditingResource(null);
    setIsAdding(false);
  };

  const deleteResource = (id: string) => {
    if (!confirm('Delete this internal resource?')) return;
    onChange(resources.filter(r => r.id !== id));
  };

  const cancelEditing = () => {
    setEditingResource(null);
    setIsAdding(false);
  };

  const updateField = (field: keyof InternalResource, value: any) => {
    if (editingResource) {
      setEditingResource({ ...editingResource, [field]: value });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Internal Resources</h2>
          <p className="text-sm text-gray-600">
            Your organization's programs and services. These will be recommended in case plans when appropriate.
          </p>
        </div>
        <button
          onClick={startAdding}
          disabled={isAdding || !!editingResource}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Editing Form */}
      {editingResource && (
        <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdding ? 'New Internal Resource' : 'Edit Internal Resource'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={saveResource}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Program/Service Name *</label>
                <input
                  type="text"
                  value={editingResource.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Transitional Housing Program"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={editingResource.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., housing, counseling, case_management"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editingResource.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What does this program provide?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="text"
                  value={editingResource.contact}
                  onChange={(e) => updateField('contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone, email, or location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                <input
                  type="text"
                  value={editingResource.eligibility}
                  onChange={(e) => updateField('eligibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Who can access this?"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources List */}
      <div className="space-y-2">
        {resources.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-400">
            No internal resources yet. Click "Add Resource" to create one.
          </div>
        )}

        {resources.map((resource) => (
          <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{resource.name}</h4>
                  {resource.type && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {resource.type}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {resource.contact && (
                    <div>
                      <span className="font-medium text-gray-700">Contact:</span>
                      <span className="ml-2 text-gray-600">{resource.contact}</span>
                    </div>
                  )}
                  {resource.eligibility && (
                    <div>
                      <span className="font-medium text-gray-700">Eligibility:</span>
                      <span className="ml-2 text-gray-600">{resource.eligibility}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => startEditing(resource)}
                  disabled={!!editingResource}
                  className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteResource(resource.id!)}
                  disabled={!!editingResource}
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
