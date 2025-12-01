'use client';

import CategorizedDocumentsManager from './CategorizedDocumentsManager';

export default function InternalResourcesManager() {
  return (
    <CategorizedDocumentsManager
      category="internal_resource"
      title="Internal Resources"
      description="Upload or paste documents with internal resources, links, and other information. The AI will reference this material."
    />
  );
}