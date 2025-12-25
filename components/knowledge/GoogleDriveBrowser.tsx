'use client';

import { useState, useEffect } from 'react';
import { Cloud, FileText, Download, RefreshCw, LogOut, Search, AlertCircle, Check } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

interface GoogleDriveBrowserProps {
  category?: string;
  onImport?: () => void;
}

export default function GoogleDriveBrowser({ category, onImport }: GoogleDriveBrowserProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [importedFiles, setImportedFiles] = useState<Set<string>>(new Set());
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-drive/files');
      const data = await response.json();

      if (data.needsAuth) {
        setIsConnected(false);
      } else if (data.success) {
        setIsConnected(true);
        setFiles(data.files || []);
        setNextPageToken(data.nextPageToken);
      }
    } catch (err) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/google-drive/auth');
      const data = await response.json();

      if (data.success && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (err) {
      setError('Failed to connect to Google Drive');
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/google-drive/disconnect', { method: 'POST' });
      setIsConnected(false);
      setFiles([]);
    } catch (err) {
      setError('Failed to disconnect');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      checkConnection();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/google-drive/files?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        setFiles(data.files || []);
        setNextPageToken(data.nextPageToken);
      } else {
        setError(data.error || 'Failed to search files');
      }
    } catch (err) {
      setError('Failed to search files');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextPageToken) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ pageToken: nextPageToken });
      if (searchQuery) params.append('query', searchQuery);

      const response = await fetch(`/api/google-drive/files?${params}`);
      const data = await response.json();

      if (data.success) {
        setFiles(prev => [...prev, ...(data.files || [])]);
        setNextPageToken(data.nextPageToken);
      }
    } catch (err) {
      setError('Failed to load more files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (file: DriveFile) => {
    setImporting(file.id);
    setError(null);

    try {
      const response = await fetch('/api/google-drive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id,
          mimeType: file.mimeType,
          category: category || 'google_drive',
          description: `Imported from Google Drive: ${file.name}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setImportedFiles(prev => new Set(prev).add(file.id));
        onImport?.();
      } else {
        setError(data.error || 'Failed to import file');
      }
    } catch (err) {
      setError('Failed to import file');
    } finally {
      setImporting(null);
    }
  };

  const formatFileSize = (size?: string): string => {
    if (!size) return '';
    const bytes = parseInt(size, 10);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMimeTypeLabel = (mimeType: string): string => {
    const labels: Record<string, string> = {
      'application/vnd.google-apps.document': 'Google Doc',
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/msword': 'Word',
      'text/plain': 'Text',
      'text/markdown': 'Markdown',
    };
    return labels[mimeType] || 'Document';
  };

  if (isLoading && !isConnected && files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-3" />
          <span className="text-gray-600">Checking Google Drive connection...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Google Drive</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Import documents directly from your Google Drive to add to your knowledge base.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Cloud className="w-5 h-5 mr-2" />
            Connect Google Drive
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Cloud className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Google Drive</h3>
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Connected
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Disconnect
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search your Drive..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          Search
        </button>
        <button
          onClick={checkConnection}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Files List */}
      {files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No documents found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Upload documents to Google Drive to import them'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {file.iconLink ? (
                  <img src={file.iconLink} alt="" className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{getMimeTypeLabel(file.mimeType)}</span>
                    {file.size && <span>{formatFileSize(file.size)}</span>}
                    {file.modifiedTime && <span>{formatDate(file.modifiedTime)}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {importedFiles.has(file.id) ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Imported
                  </span>
                ) : (
                  <button
                    onClick={() => handleImport(file)}
                    disabled={importing === file.id}
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing === file.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Import
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {nextPageToken && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More Files'}
          </button>
        </div>
      )}
    </div>
  );
}
