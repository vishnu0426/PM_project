import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DueDatePicker = ({ card, onDueDateChange, canEdit, hasChanged = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );

  const handleSave = () => {
    onDueDateChange(selectedDate ? new Date(selectedDate) : null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
    setIsEditing(false);
  };

  const handleRemove = () => {
    onDueDateChange(null);
    setSelectedDate('');
    setIsEditing(false);
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completed;
  const isDueSoon = card.dueDate && new Date(card.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && !card.completed;

  const formatDueDate = (date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return dueDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="Calendar" size={16} className="text-text-secondary" />
          <h4 className="font-medium text-text-primary">Due Date</h4>
          {hasChanged && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-md">
              <Icon name="Edit" size={12} />
              <span>Modified</span>
            </div>
          )}
        </div>
        {canEdit && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Icon name={card.dueDate ? "Edit" : "Plus"} size={16} />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            {card.dueDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemove}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {card.dueDate ? (
            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              isOverdue 
                ? 'bg-destructive/10 text-destructive' 
                : isDueSoon 
                ? 'bg-warning/10 text-warning' :'bg-muted text-text-primary'
            }`}>
              <Icon 
                name={isOverdue ? "AlertTriangle" : "Calendar"} 
                size={14} 
                className={isOverdue ? "text-destructive" : isDueSoon ? "text-warning" : "text-text-secondary"}
              />
              <span>{formatDueDate(card.dueDate)}</span>
              {card.completed && (
                <Icon name="Check" size={14} className="text-success" />
              )}
            </div>
          ) : (
            <div className="text-text-secondary text-sm italic">No due date set</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DueDatePicker;