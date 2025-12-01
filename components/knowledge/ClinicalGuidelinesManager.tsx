'use client';

import CategorizedDocumentsManager from './CategorizedDocumentsManager';

export default function ClinicalGuidelinesManager() {
  return (
    <CategorizedDocumentsManager
      category="clinical_guideline"
      title="Clinical Guidelines"
      description="Upload or paste documents related to clinical guidelines. The AI will reference this material."
    />
  );
}