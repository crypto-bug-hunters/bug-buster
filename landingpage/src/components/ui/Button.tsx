import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex font-heading tracking-wide uppercase no-underline items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:text-secondary',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-foreground bg-transparent hover:text-secondary',
        'outline-invert':
          'border border-background bg-transparent hover:text-secondary text-background',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/80',
        white:
          'bg-background text-foreground hover:text-tertiary border border-primary',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-base tracking-wide font-semibold normal-case underline underline-offset-4 hover:decoration-tertiary hover:decoration-4',
        'link-invert':
          'text-background text-base tracking-wide font-semibold normal-case underline underline-offset-4 hover:decoration-secondary hover:decoration-4',
      },
      size: {
        default: 'px-3 py-2',
        sm: 'h-9 px-3',
        lg: 'py-3 px-8',
        icon: 'h-10 w-10',
        link: 'px-0 py-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
