import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            position="top-center"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-shell-dark-panel group-[.toaster]:text-shell-dark-text group-[.toaster]:border-shell-dark-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-shell-dark-muted",
                    actionButton:
                        "group-[.toast]:bg-shell-dark-text group-[.toast]:text-shell-dark-bg",
                    cancelButton:
                        "group-[.toast]:bg-shell-dark-surface group-[.toast]:text-shell-dark-muted",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
