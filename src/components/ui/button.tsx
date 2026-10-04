import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui button. Structure and state come from borders, not shadows
 * (plan §5.4). Press feedback is scale(0.96) exactly.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-panel)] t-small font-medium transition-[background-color,border-color,color,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 active:scale-[0.96] motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        primary:
          "border border-transparent bg-ink text-white hover:bg-[#000] focus-visible:outline-offset-2",
        secondary:
          "border border-line-strong bg-surface text-ink hover:border-ink focus-visible:outline-offset-2",
        ghost:
          "border border-transparent bg-transparent text-ink hover:border-line-strong",
        console:
          "border border-dark-line bg-dark-panel text-dark-text hover:border-cyan focus-visible:outline-cyan focus-visible:outline-offset-2",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-5",
        lg: "h-12 px-6 t-body",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };