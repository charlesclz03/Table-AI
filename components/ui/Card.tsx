import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`
        glass-panel-soft rounded-xl
        ${paddingClasses[padding]} 
        ${hover ? 'hover:shadow-glow hover:-translate-y-1 transition-all cursor-pointer duration-300' : ''} 
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-xl font-bold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface CardSectionProps {
  children: ReactNode
  className?: string
  border?: boolean
}

export function CardSection({
  children,
  className = '',
  border = false,
}: CardSectionProps) {
  return (
    <div
      className={`
        ${border ? 'border-t border-stroke-subtle pt-6 mt-6' : ''} 
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}
