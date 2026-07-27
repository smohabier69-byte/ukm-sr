"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const aantalGrepen = Array.isArray(props.value ?? props.defaultValue)
    ? ((props.value ?? props.defaultValue) as number[]).length
    : 1;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-salie-200">
        <SliderPrimitive.Range className="absolute h-full bg-salie-600" />
      </SliderPrimitive.Track>
      {Array.from({ length: aantalGrepen }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block size-4 rounded-full border-2 border-salie-700 bg-white shadow-zacht transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-salie-300/60 focus-visible:outline-none active:scale-95"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
