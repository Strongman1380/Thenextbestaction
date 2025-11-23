'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  casePlan: string;
  urgency: string;
  onNewCase: () => void;
}

const urgencyStyles: Record<string, { label: string; gradient: string }> = {
  high: { label: 'High urgency', gradient: 'from-red-500 to-red-600' },
  medium: { label: 'Medium urgency', gradient: 'from-amber-500 to-amber-600' },
  low: { label: 'Low urgency', gradient: 'from-emerald-500 to-emerald-600' },
};

export default function CasePlanCard({ casePlan, urgency, onNewCase }: Props) {
  const [copied, setCopied] = useState(false);
  const meta = urgencyStyles[urgency] ?? urgencyStyles.medium;

  const copyPlan = () => {
    navigator.clipboard.writeText(casePlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printPlan = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Case Plan</title>');
      printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;line-height:1.6;}h2{color:#2563eb;}ul{margin-left:20px;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<h1>Case Plan - ${new Date().toLocaleDateString()}</h1>`);
      printWindow.document.write(`<p><strong>Urgency:</strong> ${urgency.toUpperCase()}</p><hr>`);
      printWindow.document.write(casePlan.replace(/\n/g, '<br>'));
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Case plan</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">AI-Generated Case Plan</h2>
            <p className="text-sm text-gray-500">
              Recommendations for stabilization, coordination, and client-centered next steps.
            </p>
            <span
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold text-white shadow-sm bg-gradient-to-r ${meta.gradient}`}
            >
              <span className="h-2 w-2 rounded-full bg-white/90"></span>
              {meta.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyPlan}
              className="btn-outline flex items-center gap-2 text-sm"
              title="Copy to clipboard"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h9v9H8z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 20H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              </svg>
              {copied ? 'Copied' : 'Copy plan'}
            </button>
            <button
              onClick={printPlan}
              className="btn-primary-alt flex items-center gap-2 text-sm"
              title="Print case plan"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V4h12v5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 15h12" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 15v5h8v-5" />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Case Plan Content */}
        <div className="prose prose-blue max-w-none">
          <div className="bg-gray-50/90 p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mb-4" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-6" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="text-gray-700 leading-relaxed" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="text-gray-700 mb-3 leading-relaxed" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-semibold text-gray-900" {...props} />
                ),
              }}
            >
              {casePlan}
            </ReactMarkdown>
          </div>
        </div>

        {/* AI Attribution */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Generated by Claude 3.5 Haiku • {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onNewCase} className="btn-primary">
          Create a new case plan
        </button>
        <button onClick={onNewCase} className="btn-primary-alt">
          Reset form
        </button>
      </div>

      {/* Professional Note */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 2h2v3h-2zM12 6a4 4 0 104 4" />
          </svg>
          Professional guidance
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Use this AI output as an initial map. Connect it with your clinical priorities, highlight safety concerns, and consult supervisors before sharing with clients.
        </p>
      </div>
    </div>
  );
}
