import * as React from 'react'
import { cn } from '@/lib/utils'

type AccentColor = 'gold' | 'green' | 'red' | 'cyan'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  variant?: 'default' | 'highlight'
  accent?: AccentColor
}

const accentStyles: Record<AccentColor, string> = {
  gold: 'border-t-2 border-t-yellow-400/60',
  green: 'border-t-2 border-t-green-400/60',
  red: 'border-t-2 border-t-red-400/60',
  cyan: 'border-t-2 border-t-cyan-400/60',
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, variant = 'default', accent, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-white/[0.06] p-6 shadow-xl backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:bg-white/[0.08]',
        variant === 'highlight' && 'gradient-border',
        accent && accentStyles[accent],
        className
      )}
      {...props}
    />
  )
)
GlassCard.displayName = 'GlassCard'

export { GlassCard }
