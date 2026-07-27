import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium transition-colors [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-salie-700 text-white",
        zacht: "border-transparent bg-salie-100 text-salie-800",
        outline: "border-salie-700/25 text-salie-800",
        nieuw: "border-transparent bg-inkt text-creme",
        korting: "border-transparent bg-koraal text-white",
        goud: "border-transparent bg-goud/15 text-goud",
        wit: "border-transparent bg-white/90 text-inkt backdrop-blur-sm",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.6875rem] tracking-wide",
        default: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { Badge, badgeVariants };
