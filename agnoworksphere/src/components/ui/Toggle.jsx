import React from 'react';
import { cn } from '../../utils/cn';

const Toggle = React.forwardRef(({
  className,
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'default',
  ...props
}, ref) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-8',
    default: 'h-5 w-10',
    lg: 'h-6 w-12'
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          checked ? "bg-primary" : "bg-secondary"
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
            thumbSizeClasses[size],
            checked 
              ? size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-6' : 'translate-x-5'
              : 'translate-x-0'
          )}
        />
      </button>
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label 
              className="text-sm font-medium text-foreground cursor-pointer"
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Toggle.displayName = "Toggle";

export default Toggle;
