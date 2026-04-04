import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Generic Premium Button Component
const buttonVariants = cva(
  'group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full text-sm font-semibold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'glass-button hover:bg-white/12 disabled:opacity-50',
        brand:
          'glass-button-amber text-amber-50 hover:bg-amber-300/24 disabled:opacity-50',
        destructive:
          'glass-alert-rose text-rose-50 hover:bg-rose-400/18 disabled:opacity-50',
        outline:
          'border border-white/14 bg-transparent text-text-primary hover:bg-white/10 disabled:opacity-50',
        secondary:
          'glass-panel-soft text-text-primary hover:bg-white/10 disabled:opacity-50',
        ghost:
          'text-text-secondary hover:bg-white/10 hover:text-text-primary disabled:opacity-50',
        link: 'text-accent-primary underline-offset-4 hover:underline disabled:opacity-50',
        glass:
          'glass-button text-text-primary hover:bg-white/12 disabled:opacity-50',
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
            <div className="absolute inset-0 -z-10 rounded-full bg-inherit blur-md opacity-50 transition-opacity group-hover:opacity-70" />
          )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
