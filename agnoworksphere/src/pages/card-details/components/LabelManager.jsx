import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LabelManager = ({ card, onLabelsChange, canEdit, hasChanged = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mock available labels
  const availableLabels = [
    { id: 1, name: 'High Priority', color: 'bg-red-500', textColor: 'text-white' },
    { id: 2, name: 'Medium Priority', color: 'bg-yellow-500', textColor: 'text-white' },
    { id: 3, name: 'Low Priority', color: 'bg-green-500', textColor: 'text-white' },
    { id: 4, name: 'Bug', color: 'bg-red-600', textColor: 'text-white' },
    { id: 5, name: 'Feature', color: 'bg-blue-500', textColor: 'text-white' },
    { id: 6, name: 'Enhancement', color: 'bg-purple-500', textColor: 'text-white' },
    { id: 7, name: 'Documentation', color: 'bg-gray-500', textColor: 'text-white' },
    { id: 8, name: 'Testing', color: 'bg-orange-500', textColor: 'text-white' },
    { id: 9, name: 'Review', color: 'bg-indigo-500', textColor: 'text-white' },
    { id: 10, name: 'Blocked', color: 'bg-red-700', textColor: 'text-white' }
  ];

  const assignedLabels = availableLabels.filter(label =>
    card.labels?.includes(label.id)
  );

  const handleLabelToggle = (labelId) => {
    const currentLabels = card.labels || [];
    const updatedLabels = currentLabels.includes(labelId)
      ? currentLabels.filter(id => id !== labelId)
      : [...currentLabels, labelId];
    
    onLabelsChange(updatedLabels);
  };

  const handleRemoveLabel = (labelId) => {
    const updatedLabels = (card.labels || []).filter(id => id !== labelId);
    onLabelsChange(updatedLabels);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="Tag" size={16} className="text-text-secondary" />
          <h4 className="font-medium text-text-primary">Labels</h4>
          {hasChanged && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-md">
              <Icon name="Edit" size={12} />
              <span>Modified</span>
            </div>
          )}
        </div>
        {canEdit && (
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Icon name="Plus" size={16} />
            </Button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-elevated z-1010">
                <div className="p-3">
                  <div className="text-sm font-medium text-text-primary mb-3">Select Labels</div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelToggle(label.id)}
                        className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted transition-micro"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${label.color}`}></div>
                          <span className="text-sm text-text-primary">{label.name}</span>
                        </div>
                        {card.labels?.includes(label.id) && (
                          <Icon name="Check" size={16} className="text-success" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {assignedLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignedLabels.map((label) => (
              <div
                key={label.id}
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${label.color} ${label.textColor}`}
              >
                <span>{label.name}</span>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveLabel(label.id)}
                    className="hover:bg-black/20 rounded-full p-0.5 transition-micro"
                  >
                    <Icon name="X" size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-text-secondary text-sm italic">No labels assigned</div>
        )}
      </div>
    </div>
  );
};

export default LabelManager;