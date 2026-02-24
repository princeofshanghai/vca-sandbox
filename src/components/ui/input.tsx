import * as React from "react"

import { cn } from "@/utils/index"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-shell-border bg-shell-bg px-3 py-1 text-base text-shell-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-shell-text placeholder:text-shell-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-accent/20 focus-visible:border-shell-accent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
