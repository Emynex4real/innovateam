import * as React from "react"

const Avatar = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className, src, alt, ...props }, ref) => (
  <img
    ref={ref}
    src={src}
    alt={alt}
    className={`aspect-square h-full w-full object-cover ${className || ''}`}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-900 text-sm font-medium ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }