'use client';

import CategorizedDocumentsManager from './CategorizedDocumentsManager';

export default function TreatmentProtocolsManager() {
  return (
    <CategorizedDocumentsManager
      category="treatment_protocol"
      title="Treatment Protocols"
      description="Upload or paste documents related to treatment protocols. The AI will reference this material."
    />
  );
}