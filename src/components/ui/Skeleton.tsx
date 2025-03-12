'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  shimmer?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  variant?: 'default' | 'card' | 'text' | 'image' | 'avatar' | 'button';
}

/**
 * Skeleton component for indicating loading state
 */
export function Skeleton({
  className,
  animated = true,
  shimmer = true,
  rounded = 'md',
  variant = 'default',
  ...props
}: SkeletonProps) {
  // Map rounded values to Tailwind classes
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Map variant to specific styles
  const variantClass = {
    default: '',
    card: 'w-full h-32',
    text: 'h-4 w-full',
    image: 'aspect-video w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
  };

  // If shimmer effect is enabled
  if (shimmer) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
          roundedClass[rounded],
          variantClass[variant],
          className
        )}
        {...props}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={animated ? { x: ['calc(-100%)', 'calc(100%)'] } : { x: 'calc(-100%)' }}
          transition={animated ? { repeat: Infinity, duration: 1.5, ease: 'linear' } : { duration: 0 }}
        />
      </div>
    );
  }

  // Basic skeleton without shimmer
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animated && 'animate-pulse',
        roundedClass[rounded],
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}

/**
 * Creates a text skeleton with multiple lines
 */
export function TextSkeleton({
  className,
  lines = 3,
  lastLineWidth = 75,
  gap = 'sm',
  ...props
}: SkeletonProps & {
  lines?: number;
  lastLineWidth?: number;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}) {
  const gapClass = {
    none: 'space-y-0',
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-3',
  };

  return (
    <div className={cn(gapClass[gap], className)}>
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className={i === lines - 1 && lastLineWidth < 100 ? `w-[${lastLineWidth}%]` : ''}
            {...props}
          />
        ))}
    </div>
  );
}

/**
 * Creates a card skeleton with title, content and footer
 */
export function CardSkeleton({
  className,
  headerHeight = 'h-7',
  contentLines = 3,
  hasFooter = true,
  footerHeight = 'h-9',
  ...props
}: SkeletonProps & {
  headerHeight?: string;
  contentLines?: number;
  hasFooter?: boolean;
  footerHeight?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm',
        className
      )}
      {...props}
    >
      <Skeleton className={cn('mb-4 w-3/4', headerHeight)} />
      <div className="space-y-2 mb-4">
        {Array(contentLines)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              className={i === contentLines - 1 ? 'w-4/5' : ''}
            />
          ))}
      </div>
      {hasFooter && <Skeleton className={cn('w-1/3', footerHeight)} />}
    </div>
  );
}

export default Skeleton;
