import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-8 rounded-md border border-border bg-bg-elevated px-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)

Select.displayName = 'Select'
