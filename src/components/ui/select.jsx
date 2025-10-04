import * as React from "react"

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  )
}

const SelectGroup = ({ children }) => children

const SelectValue = ({ placeholder }) => (
  <option value="" disabled>
    {placeholder}
  </option>
)

const SelectTrigger = ({ className, children, ...props }) => (
  <div className={`relative ${className || ''}`} {...props}>
    {children}
  </div>
)

const SelectContent = ({ children }) => children

const SelectLabel = ({ className, children, ...props }) => (
  <optgroup label={children} className={className} {...props} />
)

const SelectItem = ({ className, children, value, ...props }) => (
  <option value={value} className={className} {...props}>
    {children}
  </option>
)

const SelectSeparator = ({ className, ...props }) => (
  <hr className={`border-slate-200 ${className || ''}`} {...props} />
)

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}