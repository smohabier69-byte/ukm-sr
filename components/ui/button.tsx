import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 ease-[var(--ease-uit)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-salie-700 text-white shadow-zacht hover:bg-salie-800 active:scale-[0.98]",
        inkt: "bg-inkt text-creme shadow-zacht hover:bg-inkt/90 active:scale-[0.98]",
        outline: "border border-salie-700/25 bg-transparent text-salie-800 hover:border-salie-700/50 hover:bg-salie-50",
        secondary: "bg-salie-100 text-salie-800 hover:bg-salie-200",
        ghost: "text-inkt hover:bg-salie-100/70",
        link: "text-salie-700 underline-offset-4 hover:underline rounded-none",
        destructive: "bg-koraal text-white hover:bg-koraal/90 active:scale-[0.98]",
        wit: "bg-white text-inkt shadow-zacht hover:bg-white/90 active:scale-[0.98]",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        default: "h-11 px-6 text-sm [&_svg]:size-4",
        lg: "h-13 px-8 text-[0.95rem] [&_svg]:size-[1.125rem]",
        icon: "size-11 [&_svg]:size-[1.125rem]",
        "icon-sm": "size-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
