import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  min?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange([parseFloat(e.target.value)])
    }

    const percentage = ((value[0] - min) / (max - min)) * 100

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
            type="range"
            max={max}
            min={min}
            step={step}
            value={value[0]}
            onChange={handleChange}
            ref={ref}
            className="absolute h-full w-full opacity-0 cursor-pointer z-10"
            {...props}
        />
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div 
             className="absolute h-full bg-primary" 
             style={{ width: `${percentage}%` }}
          />
        </div>
        <div
            className="absolute h-5 w-5 rounded-full border-2 border-primary bg-white dark:bg-slate-950 ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-50 dark:focus-visible:ring-slate-300"
            style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
