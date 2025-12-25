'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/lib/context/ToastContext';

const icons: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastVariant, { container: string; icon: string }> = {
  success: {
    container: 'bg-white border-l-4 border-l-success shadow-lg',
    icon: 'text-success',
  },
  error: {
    container: 'bg-white border-l-4 border-l-red-500 shadow-lg',
    icon: 'text-red-500',
  },
  warning: {
    container: 'bg-white border-l-4 border-l-amber-500 shadow-lg',
    icon: 'text-amber-500',
  },
  info: {
    container: 'bg-white border-l-4 border-l-info shadow-lg',
    icon: 'text-info',
  },
};

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border border-slate-200
        transition-all duration-200 ease-out
        ${style.container}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-slate-600 mt-0.5">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleClose();
            }}
            className="text-sm font-medium text-primary underline mt-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
