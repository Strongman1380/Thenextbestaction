'use client';

import type { ButtonType } from '@/types';

interface Props {
  link: string;
  label: string;
  type: ButtonType;
}

export default function ActionButton({ link, label, type }: Props) {
  const handleClick = () => {
    // Handle different action types
    if (type === 'call') {
      window.location.href = link;
    } else if (type === 'text') {
      window.location.href = link;
    } else if (type === 'schedule') {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'call':
        return 'btn-call';
      case 'text':
        return 'btn-text';
      case 'schedule':
        return 'btn-schedule';
      default:
        return 'btn-link';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'call':
        return '📞';
      case 'text':
        return '💬';
      case 'schedule':
        return '📅';
      default:
        return '🔗';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${getButtonClass()} w-full text-lg flex items-center justify-center gap-2`}
    >
      <span>{getIcon()}</span>
      <span>{label}</span>
    </button>
  );
}
