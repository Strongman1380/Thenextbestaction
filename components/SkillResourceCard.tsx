'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  skillResource: string;
  skillTopic: string;
  onNewResource: () => void;
}

export default function SkillResourceCard({ skillResource, skillTopic, onNewResource }: Props) {
  const [copied, setCopied] = useState(false);

  const copyResource = () => {
    navigator.clipboard.writeText(skillResource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printResource = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Skill Building Resource</title>');
      printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;line-height:1.6;}h2{color:#7C3AED;}ul{margin-left:20px;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<h1>Skill Building Resource - ${new Date().toLocaleDateString()}</h1>`);
      printWindow.document.write(`<p><strong>Topic:</strong> ${skillTopic}</p><hr>`);
      printWindow.document.write(skillResource.replace(/\n/g, '<br>'));
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Professional development</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{skillTopic}</h2>
            <p className="text-sm text-gray-500">
              Tailored worksheets, readings, or experiential prompts to build the skills you need for client success.
            </p>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600">
              <svg className="w-3 h-3 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              Confidence: High
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyResource}
              className="btn-outline flex items-center gap-2 text-sm"
              title="Copy to clipboard"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h9v9H8z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 20H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              </svg>
              {copied ? 'Copied' : 'Copy resource'}
            </button>
            <button
              onClick={printResource}
              className="btn-primary-alt flex items-center gap-2 text-sm"
              title="Print resource"
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

        {/* Resource Content */}
        <div className="prose prose-purple max-w-none">
          <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/70 p-4 sm:p-6 rounded-2xl border border-purple-200/70 shadow-sm">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-2xl font-bold text-secondary mb-4" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-xl font-bold text-secondary mb-3 mt-6" {...props} />
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
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-secondary pl-4 italic my-4 text-gray-600" {...props} />
                ),
              }}
            >
              {skillResource}
            </ReactMarkdown>
          </div>
        </div>

        {/* AI Attribution */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Generated by GPT-4o-mini • {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={onNewResource}
          className="btn-accent flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M7 8l5-5 5 5" />
          </svg>
          Create another resource
        </button>
      </div>

      {/* Professional Note */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l2 2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8v5H8z" />
          </svg>
          Using this resource
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Adapt this material to your team’s approach, consult supervisors, and layer it with trauma-informed practice so every coaching conversation protects client safety and dignity.
        </p>
      </div>
    </div>
  );
}
