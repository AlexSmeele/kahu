import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-gradient-button-emerald text-white elevation-2 hover:opacity-90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] active:opacity-95 active:shadow-sm",
        secondary:
          "bg-gradient-glass border border-border text-primary elevation-1 hover:elevation-2 hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-emerald-500 text-emerald-500 bg-transparent hover:bg-emerald-50 hover:scale-[1.02] active:bg-emerald-100 active:scale-[0.98] dark:hover:bg-emerald-950/20 dark:active:bg-emerald-950/30",
        ghost: "bg-transparent hover:bg-secondary hover:scale-[1.02] active:bg-accent active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground elevation-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        "gradient-emerald": "bg-gradient-button-emerald text-white elevation-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        "gradient-amber": "bg-gradient-button-amber text-white elevation-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        "gradient-blue": "bg-gradient-button-blue text-white elevation-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        "gradient-purple": "bg-gradient-button-purple text-white elevation-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        default: "bg-primary text-primary-foreground hover:opacity-90 elevation-2 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-base",
        lg: "h-13 px-6 text-lg",
        xl: "h-15 px-8 text-lg",
        icon: "h-10 w-10",
        default: "h-11 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
