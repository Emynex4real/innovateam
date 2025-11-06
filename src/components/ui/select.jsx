import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { sanitizeUserInput, sanitizeAttribute } from "../../utils/xssProtection"

// Simple Select component without Radix UI dependency
const Select = ({ value, onValueChange, children, ...props }) => {
  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { value, onValueChange })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')
  
  React.useEffect(() => {
    setSelectedValue(value || '')
  }, [value])
  
  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span>{typeof selectedValue === 'string' ? sanitizeUserInput(selectedValue) : 'Select...'}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {React.Children.map(children, child => {
            if (child.type === SelectContent) {
              return React.cloneElement(child, {
                onSelect: (val) => {
                  const sanitizedVal = typeof val === 'string' ? sanitizeUserInput(val) : val;
                  setSelectedValue(sanitizedVal);
                  onValueChange?.(sanitizedVal);
                  setIsOpen(false);
                }
              })
            }
            return null
          })}
        </div>
      )}
    </div>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ children, onSelect, ...props }) => {
  return (
    <div className="p-1" {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, { onSelect })
        }
        return child
      })}
    </div>
  )
}

const SelectItem = React.forwardRef(({ className, children, value, onSelect, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className
    )}
    onClick={() => onSelect?.(value)}
    {...props}
  >
    {typeof children === 'string' ? sanitizeUserInput(children) : children}
  </div>
))
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder }) => (
  <span className="text-muted-foreground">{placeholder}</span>
)

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}