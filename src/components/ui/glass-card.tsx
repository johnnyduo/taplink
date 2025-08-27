
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  panel?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = false, panel = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          panel ? 'panel' : 'glass-card',
          glow && 'glow-hover',
          'noise-texture',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
