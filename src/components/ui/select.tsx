/**
 * Select nativo, stilizzato col brand.
 * Per Sprint 1 basta — un combobox accessibile arriverà se serve dopo.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-[var(--radius-button)] border border-[var(--wgp-grey-line)] bg-white px-4 pr-10 text-sm text-[var(--wgp-navy)] appearance-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wgp-electric)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
