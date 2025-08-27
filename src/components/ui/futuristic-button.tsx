
import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 tap-feedback disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-button text-white font-semibold hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:-translate-y-1 shadow-button',
        secondary: 'glass-surface text-text-primary hover:bg-glass-2 border border-glass-2 hover:border-glass-3',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-glass-1',
        danger: 'bg-status-danger text-white hover:bg-red-500',
        success: 'bg-status-success text-white hover:bg-green-500',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-sm font-medium',
        lg: 'h-14 px-8 text-base font-semibold',
        xl: 'h-16 px-10 text-lg font-bold',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface FuturisticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const FuturisticButton = React.forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        <span className="relative z-10 font-medium tracking-wide inline-flex items-center">{children}</span>
      </button>
    );
  }
);

FuturisticButton.displayName = 'FuturisticButton';

export { FuturisticButton, buttonVariants };
