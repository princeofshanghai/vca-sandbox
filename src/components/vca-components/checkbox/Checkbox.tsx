"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/utils"

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    label?: string;
    description?: string;
}

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    CheckboxProps
>(({ className, label, description, ...props }, ref) => (
    <div className="flex items-start gap-vca-lg">
        <CheckboxPrimitive.Root
            ref={ref}
            className={cn(
                "peer h-vca-xxl w-vca-xxl shrink-0 rounded-vca-xs border border-vca-border shadow-sm transition-colors",
                // Focus state
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                // Disabled state
                "disabled:cursor-not-allowed disabled:opacity-50",
                // Checked state (VCA Green)
                "data-[state=checked]:bg-vca-positive data-[state=checked]:border-vca-positive data-[state=checked]:text-white",
                // Indeterminate state (VCA Green)
                "data-[state=indeterminate]:bg-vca-positive data-[state=indeterminate]:border-vca-positive data-[state=indeterminate]:text-white",
                // Hover state (Unchecked only - VCA tokens)
                "hover:bg-vca-background-transparent-hover data-[state=checked]:hover:bg-vca-positive-hover data-[state=indeterminate]:hover:bg-vca-positive-hover",
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                className={cn("flex items-center justify-center text-current")}
            >
                {props.checked === 'indeterminate' ? (
                    // Custom indeterminate line: 12px wide, 2px tall, sharp corners
                    <div className="w-[12px] h-[2px] bg-current" />
                ) : (
                    // Custom 18px stroke-based check icon with 2px width
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                    >
                        <path d="M20 6L9 17L4 12" />
                    </svg>
                )}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {(label || description) && (
            <div className="grid gap-1.5 leading-none pt-1">
                {label && (
                    <label
                        htmlFor={props.id}
                        className={cn(
                            "text-vca-medium-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                            "cursor-pointer"
                        )}
                        onClick={(_e) => {
                            // Allow clicking label to toggle if needed
                        }}
                    >
                        {label}
                    </label>
                )}
                {description && (
                    <p className="text-vca-text-meta text-vca-xsmall">
                        {description}
                    </p>
                )}
            </div>
        )}
    </div>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
