import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-[var(--radius-button)] border border-[var(--wgp-grey-line)] bg-white px-4 text-sm text-[var(--wgp-navy)] placeholder:text-[var(--wgp-grey-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wgp-electric)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
