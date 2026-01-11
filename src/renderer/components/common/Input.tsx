import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'h-8 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
            icon && 'pl-8',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
