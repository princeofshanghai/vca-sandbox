import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/utils";

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "md";
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors",
      size === "sm" ? "h-4 w-7" : "h-5 w-9",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-shell-bg",
      "disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-shell-accent data-[state=unchecked]:bg-shell-border",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block rounded-full bg-shell-bg shadow-sm ring-0 transition-transform",
        size === "sm" ? "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0" : "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
));

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
