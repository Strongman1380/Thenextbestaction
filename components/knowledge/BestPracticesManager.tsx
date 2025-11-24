'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface BestPracticesManagerProps {
  bestPractices: { [category: string]: string[] };
  onChange: (bestPractices: { [category: string]: string[] }) => void;
}

export default function BestPracticesManager({ bestPractices, onChange }: BestPracticesManagerProps) {
  const [newCategory, setNewCategory] = useState('');
  const [newPractice, setNewPractice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');

  const categories = Object.keys(bestPractices).sort();

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const categoryKey = newCategory.toLowerCase().replace(/\s+/g, '_');
    if (bestPractices[categoryKey]) {
      alert('Category already exists');
      return;
    }
    onChange({ ...bestPractices, [categoryKey]: [] });
    setNewCategory('');
    setSelectedCategory(categoryKey);
  };

  const deleteCategory = (category: string) => {
    if (!confirm(`Delete the "${category}" category and all its practices?`)) return;
    const updated = { ...bestPractices };
    delete updated[category];
    onChange(updated);
    if (selectedCategory === category) setSelectedCategory('');
  };

  const startEditingCategory = (category: string) => {
    setEditingCategory(category);
    setEditedCategoryName(category.replace(/_/g, ' '));
  };

  const saveEditedCategory = () => {
    if (!editingCategory || !editedCategoryName.trim()) return;
    const newKey = editedCategoryName.toLowerCase().replace(/\s+/g, '_');
    if (newKey !== editingCategory && bestPractices[newKey]) {
      alert('Category already exists');
      return;
    }
    const updated = { ...bestPractices };
    updated[newKey] = updated[editingCategory];
    if (newKey !== editingCategory) {
      delete updated[editingCategory];
    }
    onChange(updated);
    setEditingCategory(null);
    setSelectedCategory(newKey);
  };

  const addPractice = (category: string) => {
    if (!newPractice.trim()) return;
    const practices = bestPractices[category] || [];
    onChange({
      ...bestPractices,
      [category]: [...practices, newPractice.trim()],
    });
    setNewPractice('');
  };

  const deletePractice = (category: string, index: number) => {
    const practices = [...bestPractices[category]];
    practices.splice(index, 1);
    onChange({
      ...bestPractices,
      [category]: practices,
    });
  };

  const updatePractice = (category: string, index: number, value: string) => {
    const practices = [...bestPractices[category]];
    practices[index] = value;
    onChange({
      ...bestPractices,
      [category]: practices,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Best Practices</h2>
        <p className="text-sm text-gray-600">
          Define best practices by category. The AI will reference these when generating case plans and skill resources.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New category name"
              />
              <button
                onClick={addCategory}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="group">
                {editingCategory === category ? (
                  <div className="flex items-center space-x-1 p-2 bg-blue-50 rounded">
                    <input
                      type="text"
                      value={editedCategoryName}
                      onChange={(e) => setEditedCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditedCategory()}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      autoFocus
                    />
                    <button onClick={saveEditedCategory} className="text-green-600 hover:text-green-700">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingCategory(null)} className="text-gray-600 hover:text-gray-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      selectedCategory === category ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span
                      onClick={() => setSelectedCategory(category)}
                      className="flex-1 text-sm font-medium capitalize"
                    >
                      {category.replace(/_/g, ' ')}
                      <span className="ml-2 text-xs text-gray-500">
                        ({bestPractices[category]?.length || 0})
                      </span>
                    </span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingCategory(category);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(category);
                        }}
                        className="p-1 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Practices List */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practices for "{selectedCategory.replace(/_/g, ' ')}"
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newPractice}
                    onChange={(e) => setNewPractice(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPractice(selectedCategory)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a new best practice..."
                  />
                  <button
                    onClick={() => addPractice(selectedCategory)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(bestPractices[selectedCategory] || []).map((practice, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md group">
                    <span className="text-gray-400 text-sm mt-1">{index + 1}.</span>
                    <input
                      type="text"
                      value={practice}
                      onChange={(e) => updatePractice(selectedCategory, index, e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => deletePractice(selectedCategory, index)}
                      className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Select a category to view and edit practices
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
