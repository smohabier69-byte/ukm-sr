"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-[1.125rem] shrink-0 rounded-[0.3rem] border border-salie-400/60 bg-white transition-all duration-200",
        "hover:border-salie-500",
        "focus-visible:ring-2 focus-visible:ring-salie-300/50 focus-visible:outline-none",
        "data-[state=checked]:border-salie-700 data-[state=checked]:bg-salie-700 data-[state=checked]:text-white",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
