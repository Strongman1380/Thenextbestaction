'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import FeedbackButtons from './FeedbackButtons';
import { exportPlanToDocx } from '../lib/exportUtils';
import { printDocument } from '../lib/printUtils';

interface Props {
  casePlan: string;
  urgency: string;
  onNewCase: () => void;
}

interface ParsedSection {
  title: string;
  content: string;
  icon: React.ReactNode;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
}

const urgencyStyles: Record<string, { label: string; gradient: string }> = {
  high: { label: 'High urgency', gradient: 'from-red-500 to-red-600' },
  medium: { label: 'Medium urgency', gradient: 'from-amber-500 to-amber-600' },
  low: { label: 'Low urgency', gradient: 'from-emerald-500 to-emerald-600' },
};

// Icons for each section
const SectionIcons = {
  need: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  action: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  resources: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  risk: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  followup: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  ),
};

// Section configuration
const sectionConfig: Record<string, { icon: React.ReactNode; accentColor: string; bgGradient: string; borderColor: string }> = {
  need: {
    icon: SectionIcons.need,
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50/50',
    borderColor: 'border-blue-200',
  },
  action: {
    icon: SectionIcons.action,
    accentColor: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-teal-50/50',
    borderColor: 'border-emerald-200',
  },
  resources: {
    icon: SectionIcons.resources,
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-50/50',
    borderColor: 'border-purple-200',
  },
  risk: {
    icon: SectionIcons.risk,
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-orange-50/50',
    borderColor: 'border-amber-200',
  },
  followup: {
    icon: SectionIcons.followup,
    accentColor: 'text-sky-600',
    bgGradient: 'from-sky-50 to-cyan-50/50',
    borderColor: 'border-sky-200',
  },
};

// Parse the case plan into sections
function parseCasePlan(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

  // Define section patterns
  const sectionPatterns = [
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Identified Need\(?s?\)?(?:\*{1,2})?:?\s*/i, type: 'need', title: 'Identified Needs' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Immediate Action Steps?(?:\*{1,2})?:?\s*/i, type: 'action', title: 'Immediate Action Steps' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:Best[- ]?Matched |Recommended )?Local Resources?(?:\*{1,2})?(?:\s*\([^)]*\))?:?\s*/i, type: 'resources', title: 'Local Resources' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Risk Assessment(?:\*{1,2})?:?\s*/i, type: 'risk', title: 'Risk Assessment' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Follow[- ]?up Plan(?:\*{1,2})?:?\s*/i, type: 'followup', title: 'Follow-up Plan' },
  ];

  // Find all section positions
  const sectionMatches: { type: string; title: string; start: number; end: number }[] = [];

  for (const pattern of sectionPatterns) {
    const match = content.match(pattern.regex);
    if (match && match.index !== undefined) {
      sectionMatches.push({
        type: pattern.type,
        title: pattern.title,
        start: match.index + match[0].length,
        end: content.length,
      });
    }
  }

  // Sort by position
  sectionMatches.sort((a, b) => a.start - b.start);

  // Set end positions
  for (let i = 0; i < sectionMatches.length; i++) {
    if (i < sectionMatches.length - 1) {
      // Find where the next section header starts (before the match)
      const nextPattern = sectionPatterns.find(p => p.type === sectionMatches[i + 1].type);
      if (nextPattern) {
        const nextMatch = content.match(nextPattern.regex);
        if (nextMatch && nextMatch.index !== undefined) {
          sectionMatches[i].end = nextMatch.index;
        }
      }
    }
  }

  // Extract content for each section
  for (const match of sectionMatches) {
    const sectionContent = content.substring(match.start, match.end).trim();
    const config = sectionConfig[match.type];

    if (sectionContent && config) {
      sections.push({
        title: match.title,
        content: sectionContent,
        icon: config.icon,
        accentColor: config.accentColor,
        bgGradient: config.bgGradient,
        borderColor: config.borderColor,
      });
    }
  }

  return sections;
}

// Markdown components for section content
const markdownComponents = {
  h1: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0" {...props} />
  ),
  h2: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-4 first:mt-0" {...props} />
  ),
  h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-base font-semibold text-gray-800 mb-2 mt-3 first:mt-0" {...props} />
  ),
  h4: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-sm font-semibold text-gray-800 mb-1 mt-2 first:mt-0" {...props} />
  ),
  ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="space-y-2 mb-4 ml-4" {...props} />
  ),
  ol: ({ ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="space-y-2 mb-4 list-decimal ml-4" {...props} />
  ),
  li: ({ children, ordered, ...props }: React.HTMLAttributes<HTMLLIElement> & { ordered?: boolean }) => (
    ordered ? (
      <li className="text-gray-700 leading-relaxed pl-1" {...props}>{children}</li>
    ) : (
      <li className="text-gray-700 leading-relaxed flex gap-2" {...props}>
        <span className="text-primary mt-1.5 flex-shrink-0">
          <svg className="w-1.5 h-1.5 fill-current" viewBox="0 0 6 6">
            <circle cx="3" cy="3" r="3" />
          </svg>
        </span>
        <span className="flex-1">{children}</span>
      </li>
    )
  ),
  p: ({ ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 mb-3 leading-relaxed last:mb-0" {...props} />
  ),
  strong: ({ ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary hover:text-primary/80 underline" {...props} />
  ),
};

// Resource-specific markdown components with enhanced styling
const resourceMarkdownComponents = {
  ...markdownComponents,
  h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-base font-bold text-purple-900 mb-2 mt-4 first:mt-0 pb-1 border-b border-purple-200/50" {...props} />
  ),
  h4: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-sm font-semibold text-purple-800 mb-1 mt-2 first:mt-0" {...props} />
  ),
  li: ({ children, ordered, ...props }: React.HTMLAttributes<HTMLLIElement> & { ordered?: boolean }) => (
    ordered ? (
      <li className="text-gray-700 leading-relaxed pl-1 py-0.5" {...props}>{children}</li>
    ) : (
      <li className="text-gray-700 leading-relaxed flex gap-2 py-0.5" {...props}>
        <span className="text-purple-500 mt-1.5 flex-shrink-0">
          <svg className="w-1.5 h-1.5 fill-current" viewBox="0 0 6 6">
            <circle cx="3" cy="3" r="3" />
          </svg>
        </span>
        <span className="flex-1">{children}</span>
      </li>
    )
  ),
};

function SectionCard({ section }: { section: ParsedSection }) {
  const isResources = section.title === 'Local Resources';
  const components = isResources ? resourceMarkdownComponents : markdownComponents;

  return (
    <div className={`rounded-2xl border ${section.borderColor} bg-gradient-to-br ${section.bgGradient} p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200/50">
        <div className={`p-2 rounded-xl bg-white/80 shadow-sm ${section.accentColor}`}>
          {section.icon}
        </div>
        <h3 className={`text-lg font-semibold ${section.accentColor}`}>
          {section.title}
        </h3>
      </div>

      {/* Section Content */}
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown components={components}>
          {section.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function CasePlanCard({ casePlan, urgency, onNewCase }: Props) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [contentId] = useState(() => `case-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const meta = urgencyStyles[urgency] ?? urgencyStyles.medium;

  // Parse the case plan into sections
  const sections = useMemo(() => parseCasePlan(casePlan), [casePlan]);

  const copyPlan = () => {
    navigator.clipboard.writeText(casePlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportPlanToDocx(casePlan, `Case Plan - ${urgency} urgency`);
    setIsExporting(false);
  };

  const printPlan = () => {
    printDocument({
      title: 'Case Plan',
      subtitle: 'AI-Generated Recommendations',
      content: casePlan,
      type: 'case-plan',
      audience: 'caseworker',
      metadata: {
        'Urgency Level': urgency.charAt(0).toUpperCase() + urgency.slice(1),
        'Date Generated': new Date().toLocaleDateString(),
        'Status': 'Draft / Review Needed',
        'Audience': 'Caseworker view'
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Card */}
      <div className="card space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Case plan</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">AI-Generated Case Plan</h2>
            <p className="text-sm text-gray-500">
              Comprehensive recommendations organized for quick reference and action.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold text-white shadow-sm bg-gradient-to-r ${meta.gradient}`}
              >
                <span className="h-2 w-2 rounded-full bg-white/90"></span>
                {meta.label}
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
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
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleExport}
              className="btn-outline flex items-center gap-2 text-sm"
              title="Download as text file"
              disabled={isExporting}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExporting ? '...' : 'Download'}
            </button>
            <button
              onClick={printPlan}
              className="btn-primary flex items-center gap-2 text-sm"
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

        {/* Section Summary Pills */}
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${section.accentColor} bg-white border ${section.borderColor} hover:shadow-sm transition-shadow`}
              >
                <span className="w-4 h-4">{section.icon}</span>
                {section.title}
              </a>
            ))}
          </div>
        )}

        {/* Structured Sections */}
        {sections.length > 0 ? (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} id={`section-${index}`} className="scroll-mt-4">
                <SectionCard section={section} />
              </div>
            ))}
          </div>
        ) : (
          // Fallback to raw markdown if parsing fails
          <div className="prose prose-blue max-w-none">
            <div className="bg-gray-50/90 p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm">
              <ReactMarkdown components={markdownComponents}>
                {casePlan}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* AI Attribution */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Generated by Perplexity Sonar (8B) • {new Date().toLocaleString()}
          </p>
        </div>

        <FeedbackButtons
          contentId={contentId}
          contentType="case-plan"
          generatedContent={casePlan}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onNewCase} className="btn-primary">
          Create a new case plan
        </button>
        <button onClick={onNewCase} className="btn-outline">
          Reset form
        </button>
      </div>

      {/* Professional Note */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
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
