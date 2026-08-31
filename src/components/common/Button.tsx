import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover border border-transparent shadow-sm',
  secondary: 'bg-surface-3 text-text hover:bg-border border border-border',
  ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-surface-2 border border-transparent',
  danger: 'bg-transparent text-danger hover:bg-danger/10 border border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-8 px-3 text-[13px] gap-2 rounded-md',
  icon: 'h-8 w-8 rounded-md justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
