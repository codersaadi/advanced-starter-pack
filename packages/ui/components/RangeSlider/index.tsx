'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@repo/ui/lib/utils';
import * as React from 'react';
const RangeSlider = ({
  className,
  onChange,
  onValueChange,
  ...props
}: SliderPrimitive.SliderProps) => {
  // Initialize with defaults, ensuring we have an array to work with
  const [localValues, setLocalValues] = React.useState<number[]>(
    props.defaultValue || props.value || [0]
  );

  const handleSliderChange = (newValues: number[]) => {
    setLocalValues(newValues);
    if (onChange) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      onChange(newValues as any);
    }
    if (onValueChange) {
      onValueChange(newValues);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const numValue = Number(value);
    if (!Number.isNaN(numValue)) {
      const newValues = [...localValues];
      newValues[index] = numValue;
      setLocalValues(newValues);
      if (onChange) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        onChange(newValues as any);
      }
      if (onValueChange) {
        onValueChange(newValues);
      }
    }
  };

  // Use controlled or uncontrolled values based on what's provided
  const displayValues = props.value || localValues;

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayValues.map((value, index) => (
          <input
            key={`input-${index}`}
            type="number"
            value={value}
            min={props.min}
            max={props.max}
            step={props.step || 1}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="h-10 w-20 rounded-md border border-input px-2"
          />
        ))}
      </div>
      <SliderPrimitive.Root
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        onValueChange={handleSliderChange}
        value={displayValues}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {displayValues.map((_, index) => (
          <SliderPrimitive.Thumb
            key={`thumb-${index}`}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
};

RangeSlider.displayName = 'RangeSlider';

export { RangeSlider };
