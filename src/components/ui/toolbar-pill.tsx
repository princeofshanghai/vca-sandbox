import * as React from "react"
import { cn } from "@/utils"

interface ToolbarPillProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function ToolbarPill({ children, className, ...props }: ToolbarPillProps) {
    const childrenArray = React.Children.toArray(children).filter(Boolean);

    return (
        <div
            className={cn(
                "flex items-center gap-0.5 bg-white p-0.5 rounded-full border border-gray-200 shadow-sm",
                className
            )}
            {...props}
        >
            {childrenArray.map((child, index) => (
                <React.Fragment key={index}>
                    {child}
                    {index < childrenArray.length - 1 && (
                        <div className="w-px h-3.5 bg-gray-100 mx-px shrink-0" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
