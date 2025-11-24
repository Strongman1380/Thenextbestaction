'use client';

import { useState, useRef, useEffect } from 'react';
import { DocumentMetadata } from '@/lib/document-parser';
import { Upload, File, Trash2, FileText, AlertCircle, RefreshCw } from 'lucide-react';

export default function DocumentsManager() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (category) formData.append('category', category);
      if (description) formData.append('description', description);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Clear form
      setCategory('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload documents
      fetchDocuments();
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      fetchDocuments();
    } catch (error: any) {
      alert(`Error deleting document: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Documents</h2>
          <p className="text-sm text-gray-600">
            Upload documents (PDF, Word, Text files) to add to your knowledge base. The AI will use this information when generating plans and resources.
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          title="Refresh list"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., housing, mental_health, protocols"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this document contains"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Document
            </label>
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.doc,.txt,.md"
                disabled={uploading}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {uploading && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="animate-spin h-5 w-5 mr-2 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: PDF, Word (.docx), Text (.txt), Markdown (.md)
            </p>
          </div>

          {uploadError && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{uploadError}</div>
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Uploaded Documents ({documents.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 font-medium">No documents uploaded yet</p>
            <p className="text-sm text-gray-500 mt-2">Upload documents to enhance your knowledge base</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.originalName}</h4>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    )}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                      <span>{formatFileSize(doc.size)}</span>
                      {doc.category && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {doc.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">How this works</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Upload PDFs, Word documents, or text files containing knowledge you want the AI to use</li>
          <li>Categorize documents to help the AI find relevant information</li>
          <li>The AI will automatically reference these documents when generating case plans and resources</li>
          <li>Delete documents you no longer need - they will no longer be referenced</li>
        </ul>
      </div>
    </div>
  );
}
