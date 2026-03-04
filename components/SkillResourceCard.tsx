'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import FeedbackButtons from './FeedbackButtons';
import { printDocument } from '../lib/printUtils';
import { exportPlanToText } from '../lib/exportUtils';
import SendToClientModal from './SendToClientModal';

interface Props {
  skillResource: string;
  skillTopic: string;
  onRegenerate: () => void;
  onCreateNew: () => void;
  resourceType?: 'worker' | 'client';
}

interface ParsedSection {
  title: string;
  content: string;
  icon: React.ReactNode;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
}

// Icons for different section types
const SectionIcons = {
  why: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  ),
  knowledge: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  activities: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  competence: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  growth: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
  reflection: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  ),
  practice: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  coping: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  ),
  encouragement: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
    </svg>
  ),
  progress: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  help: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  ),
  understanding: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
};

// Section configurations for worker skills
const workerSectionConfig: Record<string, { icon: React.ReactNode; accentColor: string; bgGradient: string; borderColor: string }> = {
  why: {
    icon: SectionIcons.why,
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-50/50',
    borderColor: 'border-purple-200',
  },
  knowledge: {
    icon: SectionIcons.knowledge,
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50/50',
    borderColor: 'border-blue-200',
  },
  activities: {
    icon: SectionIcons.activities,
    accentColor: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-teal-50/50',
    borderColor: 'border-emerald-200',
  },
  competence: {
    icon: SectionIcons.competence,
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-orange-50/50',
    borderColor: 'border-amber-200',
  },
  growth: {
    icon: SectionIcons.growth,
    accentColor: 'text-rose-600',
    bgGradient: 'from-rose-50 to-pink-50/50',
    borderColor: 'border-rose-200',
  },
};

// Section configurations for client resources
const clientSectionConfig: Record<string, { icon: React.ReactNode; accentColor: string; bgGradient: string; borderColor: string }> = {
  why: {
    icon: SectionIcons.why,
    accentColor: 'text-teal-600',
    bgGradient: 'from-teal-50 to-cyan-50/50',
    borderColor: 'border-teal-200',
  },
  reflection: {
    icon: SectionIcons.reflection,
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-50 to-sky-50/50',
    borderColor: 'border-blue-200',
  },
  activities: {
    icon: SectionIcons.activities,
    accentColor: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-green-50/50',
    borderColor: 'border-emerald-200',
  },
  practice: {
    icon: SectionIcons.practice,
    accentColor: 'text-violet-600',
    bgGradient: 'from-violet-50 to-purple-50/50',
    borderColor: 'border-violet-200',
  },
  coping: {
    icon: SectionIcons.coping,
    accentColor: 'text-rose-600',
    bgGradient: 'from-rose-50 to-pink-50/50',
    borderColor: 'border-rose-200',
  },
  encouragement: {
    icon: SectionIcons.encouragement,
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50/50',
    borderColor: 'border-amber-200',
  },
  progress: {
    icon: SectionIcons.progress,
    accentColor: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-blue-50/50',
    borderColor: 'border-indigo-200',
  },
  help: {
    icon: SectionIcons.help,
    accentColor: 'text-sky-600',
    bgGradient: 'from-sky-50 to-cyan-50/50',
    borderColor: 'border-sky-200',
  },
  understanding: {
    icon: SectionIcons.understanding,
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-50/50',
    borderColor: 'border-purple-200',
  },
};

// Parse resource content into sections
function parseResourceContent(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

  // Define section patterns for both worker and client resources
  const sectionPatterns = [
    // Worker skill sections
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Why This Matters(?:\s+for\s+YOU)?(?:\s+as\s+a\s+Social\s+Worker)?(?:\*{1,2})?:?\s*/i, type: 'why', title: 'Why This Matters', configType: 'worker' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Core Knowledge\s*(?:&|and)?\s*Skills?(?:\*{1,2})?:?\s*/i, type: 'knowledge', title: 'Core Knowledge & Skills', configType: 'worker' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Self[- ]?Directed Learning Activities?(?:\*{1,2})?:?\s*/i, type: 'activities', title: 'Learning Activities', configType: 'worker' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Building Your Competence(?:\*{1,2})?:?\s*/i, type: 'competence', title: 'Building Your Competence', configType: 'worker' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Continuing Your Professional Growth(?:\*{1,2})?:?\s*/i, type: 'growth', title: 'Professional Growth', configType: 'worker' },

    // Client resource sections
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:Understanding|Introduction)(?:\*{1,2})?:?\s*/i, type: 'understanding', title: 'Understanding', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:Think About It|Reflection Questions?)(?:\*{1,2})?:?\s*/i, type: 'reflection', title: 'Reflection Questions', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:Things You Can Try|Practice Exercises?|(?:How to )?Do It|Exercises?|Activities?)(?:\*{1,2})?:?\s*/i, type: 'activities', title: 'Activities & Exercises', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?Your Daily Practice(?:\*{1,2})?:?\s*/i, type: 'practice', title: 'Daily Practice', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:When Things Get Hard|Quick Coping|Coping Tools?)(?:\*{1,2})?:?\s*/i, type: 'coping', title: 'Coping Tools', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:Words of Encouragement|Affirmations?|Encouragement)(?:\*{1,2})?:?\s*/i, type: 'encouragement', title: 'Encouragement', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:Tracking Your Progress|Progress|Key Takeaways?)(?:\*{1,2})?:?\s*/i, type: 'progress', title: 'Your Progress', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:When to (?:Reach Out|Ask) for Help|Additional Resources?|Next Steps?)(?:\*{1,2})?:?\s*/i, type: 'help', title: 'Getting Help', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:What You Can Do|Practical Tips?|Strategies?)(?:\*{1,2})?:?\s*/i, type: 'activities', title: 'What You Can Do', configType: 'client' },
    { regex: /(?:^|\n)(?:#+\s*)?(?:\*{1,2})?\d*\.?\s*(?:\*{1,2})?(?:Real Examples?|Examples?|Scenarios?)(?:\*{1,2})?:?\s*/i, type: 'activities', title: 'Examples', configType: 'client' },
  ];

  // Find all section positions
  const sectionMatches: { type: string; title: string; start: number; end: number; configType: string }[] = [];

  for (const pattern of sectionPatterns) {
    const match = content.match(pattern.regex);
    if (match && match.index !== undefined) {
      // Avoid duplicates for the same position
      const existingAtPosition = sectionMatches.find(m => Math.abs(m.start - (match.index! + match[0].length)) < 10);
      if (!existingAtPosition) {
        sectionMatches.push({
          type: pattern.type,
          title: pattern.title,
          start: match.index + match[0].length,
          end: content.length,
          configType: pattern.configType,
        });
      }
    }
  }

  // Sort by position
  sectionMatches.sort((a, b) => a.start - b.start);

  // Set end positions
  for (let i = 0; i < sectionMatches.length; i++) {
    if (i < sectionMatches.length - 1) {
      sectionMatches[i].end = sectionMatches[i + 1].start - 1;
      // Find where the next section header actually starts
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
    const configMap = match.configType === 'worker' ? workerSectionConfig : clientSectionConfig;
    const config = configMap[match.type];

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

// Markdown components for content
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
    <h4 className="text-sm font-semibold text-gray-700 mb-1 mt-2 first:mt-0" {...props} />
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
        <span className="text-purple-500 mt-1.5 flex-shrink-0">
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
  blockquote: ({ ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-purple-300 pl-4 italic my-4 text-gray-600 bg-purple-50/50 py-2 pr-4 rounded-r-lg" {...props} />
  ),
  a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-purple-600 hover:text-purple-800 underline" {...props} />
  ),
};

function SectionCard({ section }: { section: ParsedSection }) {
  return (
    <div className={`rounded-2xl border ${section.borderColor} bg-gradient-to-br ${section.bgGradient} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200/50">
        <div className={`p-2 rounded-xl bg-white/80 shadow-sm ${section.accentColor}`}>
          {section.icon}
        </div>
        <h3 className={`text-base font-semibold ${section.accentColor}`}>
          {section.title}
        </h3>
      </div>

      {/* Section Content */}
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown components={markdownComponents}>
          {section.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function SkillResourceCard({ skillResource, skillTopic, onRegenerate, onCreateNew, resourceType = 'worker' }: Props) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [contentId] = useState(() => `skill-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // Parse the resource into sections
  const sections = useMemo(() => parseResourceContent(skillResource), [skillResource]);

  const isWorkerResource = resourceType === 'worker';
  const typeLabel = isWorkerResource ? 'Professional Development' : 'Client Resource';
  const printAudience = isWorkerResource ? 'caseworker' : 'client';

  // Use explicit classes for Tailwind purging
  const headerLabelClass = isWorkerResource ? 'text-purple-400' : 'text-teal-400';
  const badgeClass = isWorkerResource
    ? 'text-purple-700 bg-purple-50 border-purple-200'
    : 'text-teal-700 bg-teal-50 border-teal-200';
  const noteCardClass = isWorkerResource
    ? 'from-purple-50 to-blue-50 border-purple-200'
    : 'from-teal-50 to-blue-50 border-teal-200';
  const noteIconClass = isWorkerResource ? 'text-purple-600' : 'text-teal-600';
  const fallbackBgClass = isWorkerResource
    ? 'from-purple-50/70 to-indigo-50/70 border-purple-200/70'
    : 'from-teal-50/70 to-cyan-50/70 border-teal-200/70';

  const copyResource = () => {
    navigator.clipboard.writeText(skillResource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    exportPlanToText(skillResource, `${typeLabel}: ${skillTopic}`);
    setTimeout(() => setIsExporting(false), 500);
  };

  const printResource = () => {
    printDocument({
      title: skillTopic,
      subtitle: typeLabel,
      content: skillResource,
      type: 'resource',
      audience: printAudience,
      metadata: {
        'Topic': skillTopic,
        'Type': typeLabel,
        'Date Generated': new Date().toLocaleDateString(),
        'Status': 'Ready for Use',
        'Audience': isWorkerResource ? 'Caseworker' : 'Client-facing'
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className={`text-xs uppercase tracking-[0.35em] ${headerLabelClass}`}>{typeLabel}</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{skillTopic}</h2>
            <p className="text-sm text-gray-500">
              {isWorkerResource
                ? 'Tailored content for your professional development and skill building.'
                : 'Ready-to-use resource designed for client self-help and growth.'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-medium border ${badgeClass}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Ready to Use
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
              onClick={copyResource}
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
              onClick={printResource}
              className="btn-outline flex items-center gap-2 text-sm"
              title="Print resource"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V4h12v5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 15h12" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 15v5h8v-5" />
              </svg>
              Print
            </button>
            {!isWorkerResource && (
              <button
                onClick={() => setShowSendModal(true)}
                className="btn-primary flex items-center gap-2 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                title="Text this resource to your client"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                Text to Client
              </button>
            )}
          </div>
        </div>

        {/* Section Summary Pills */}
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#resource-section-${index}`}
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
          <div className="grid gap-4">
            {sections.map((section, index) => (
              <div key={index} id={`resource-section-${index}`} className="scroll-mt-4">
                <SectionCard section={section} />
              </div>
            ))}
          </div>
        ) : (
          // Fallback to raw markdown if parsing fails
          <div className="prose prose-purple max-w-none">
            <div className={`bg-gradient-to-br ${fallbackBgClass} p-4 sm:p-6 rounded-2xl border shadow-sm`}>
              <ReactMarkdown components={markdownComponents}>
                {skillResource}
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
          contentType="skill-resource"
          generatedContent={skillResource}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onRegenerate}
          className="btn-outline flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Regenerate
        </button>
        <button
          onClick={onCreateNew}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New
        </button>
      </div>

      {/* Professional Note */}
      <div className={`card bg-gradient-to-r ${noteCardClass} border`}>
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className={`w-5 h-5 ${noteIconClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          {isWorkerResource ? 'Using this resource' : 'Sharing with clients'}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {isWorkerResource
            ? 'Adapt this material to your learning style, discuss with supervisors, and apply it gradually to your practice. Professional growth is a journey.'
            : 'Review this resource before sharing. Adapt language as needed for your client\'s reading level and cultural context. Follow up to discuss their experience.'}
        </p>
      </div>

      {/* Send to Client Modal */}
      {!isWorkerResource && (
        <SendToClientModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          resourceContent={skillResource}
          resourceTopic={skillTopic}
        />
      )}
    </div>
  );
}
