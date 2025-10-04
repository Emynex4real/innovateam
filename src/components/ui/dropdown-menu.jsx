import * as React from "react"
import { useState, useRef, useEffect } from "react"

const DropdownMenu = ({ children }) => {
  return <div className="relative">{children}</div>
}

const DropdownMenuTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(({ className, align = "end", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute ${align === 'end' ? 'right-0' : 'left-0'} mt-2 w-56 rounded-md border border-slate-200 bg-white p-1 shadow-lg z-50 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ className, children, onClick, ...props }, ref) => (
  <button
    ref={ref}
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${className || ''}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`px-2 py-1.5 text-sm font-semibold ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`-mx-1 my-1 h-px bg-slate-200 ${className || ''}`}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}