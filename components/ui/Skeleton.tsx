'use client';

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component for loading states
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200',
        className
      )}
    />
  );
}

/**
 * Skeleton for text content
 */
export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for the case plan card
 */
export function CasePlanSkeleton() {
  return (
    <div className="card space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <TextSkeleton lines={3} />
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                <TextSkeleton lines={2} className="flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 - Resources */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-44" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 space-y-2">
                <Skeleton className="h-5 w-32" />
                <TextSkeleton lines={2} />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the skill resource card
 */
export function SkillResourceSkeleton() {
  return (
    <div className="card space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-64" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <TextSkeleton lines={4} />

        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>

        <TextSkeleton lines={3} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton for dashboard panels
 */
export function DashboardPanelSkeleton() {
  return (
    <div className="panel space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-32" />
      <TextSkeleton lines={2} />
    </div>
  );
}

/**
 * Skeleton for the form
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Text area */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Urgency buttons */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
        </div>
      </div>

      {/* Input fields */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Submit button */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
