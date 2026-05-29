/**
 * Button — variante shadcn ridotta per WGP.
 * Solo varianti necessarie a Sprint 1: primary (navy), electric (CTA), ghost, outline.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wgp-electric)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--wgp-navy)] text-white hover:bg-[var(--wgp-navy-soft)]',
        electric:
          'bg-[var(--wgp-electric)] text-white hover:bg-[var(--wgp-electric-soft)]',
        outline:
          'border border-[var(--wgp-grey-line)] bg-white text-[var(--wgp-navy)] hover:bg-[var(--wgp-grey-bg)]',
        ghost:
          'text-[var(--wgp-navy)] hover:bg-[var(--wgp-grey-bg)]',
        link:
          'text-[var(--wgp-electric)] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { buttonVariants };
