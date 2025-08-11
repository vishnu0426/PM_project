import React from 'react';
import { cn } from '../../utils/cn';

const Slider = React.forwardRef(({
  className,
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  label,
  description,
  showValue = true,
  formatValue,
  disabled = false,
  ...props
}, ref) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
          {showValue && (
            <span className="text-sm text-muted-foreground font-mono">
              {displayValue}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
            "slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:rounded-full",
            "slider-thumb:bg-primary slider-thumb:cursor-pointer slider-thumb:border-0",
            "slider-thumb:shadow-md slider-thumb:transition-all slider-thumb:duration-200",
            "hover:slider-thumb:scale-110 focus:slider-thumb:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        
        {/* Progress track */}
        <div 
          className="absolute top-0 h-2 bg-primary rounded-lg pointer-events-none"
          style={{ 
            width: `${((value - min) / (max - min)) * 100}%`,
            transition: 'width 0.2s ease'
          }}
        />
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
});

Slider.displayName = "Slider";

export default Slider;
