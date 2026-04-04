import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Generic Premium Button Component
const buttonVariants = cva(
  'group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-accent-primary text-text-primary hover:bg-accent-primary/90 shadow-glow disabled:opacity-50',
        brand:
          'bg-accent-brand text-text-primary hover:bg-accent-brand/90 shadow-glow disabled:opacity-50',
        destructive:
          'bg-accent-error text-text-primary hover:bg-accent-error/90 disabled:opacity-50',
        outline:
          'border border-stroke-strong bg-transparent hover:bg-surface-elevated text-text-primary disabled:opacity-50',
        secondary:
          'bg-surface-elevated text-text-primary hover:bg-stroke-strong disabled:opacity-50',
        ghost:
          'hover:bg-surface-elevated hover:text-text-primary text-text-secondary disabled:opacity-50',
        link: 'text-accent-primary underline-offset-4 hover:underline disabled:opacity-50',
        glass:
          'bg-surface-elevated/40 backdrop-blur-md border border-stroke-subtle text-text-primary hover:bg-surface-elevated/60 disabled:opacity-50',
      },
      size: {
        default: 'h-12 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'h-12 w-12',
      },
      isLoading: {
        true: 'opacity-80 pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      isLoading: false,
    },
  }
)

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, isLoading, className }))}
        ref={ref}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <span className={cn('relative z-10', isLoading && 'opacity-80')}>
          {children}
        </span>
        {/* Glow Effect specific for generic primary/brand variants */}
        {!asChild &&
          (variant === 'default' || variant === 'brand') &&
          !isLoading && (
            <div className="absolute inset-0 -z-10 rounded-full bg-inherit blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
          )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
