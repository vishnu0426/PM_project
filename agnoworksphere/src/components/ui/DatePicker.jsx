import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

const DatePicker = React.forwardRef(({
  className,
  value,
  onChange,
  label,
  description,
  error,
  required = false,
  disabled = false,
  placeholder = "Select date",
  minDate,
  maxDate,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || '');

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onChange?.(newDate);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          disabled={disabled}
          min={minDate}
          max={maxDate}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            "appearance-none"
          )}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Icon 
            name="Calendar" 
            className={cn(
              "h-4 w-4 text-muted-foreground",
              disabled && "opacity-50"
            )} 
          />
        </div>
      </div>
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

DatePicker.displayName = "DatePicker";

export default DatePicker;
