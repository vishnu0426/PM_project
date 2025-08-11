import React, { useState } from 'react';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import Icon from '../../AppIcon';

const BulkEditPanel = ({ selectedCount, onUpdate, onClose }) => {
  const [bulkChanges, setBulkChanges] = useState({});
  const [activeFields, setActiveFields] = useState(new Set());

  const priorityOptions = [
    { value: '', label: 'Keep current' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const assigneeOptions = [
    { value: '', label: 'Keep current' },
    { value: 'unassign', label: 'Unassign all' },
    { value: 'john-doe', label: 'John Doe (Developer)' },
    { value: 'jane-smith', label: 'Jane Smith (Designer)' },
    { value: 'mike-wilson', label: 'Mike Wilson (PM)' }
  ];

  const phaseOptions = [
    { value: '', label: 'Keep current' },
    { value: 'planning', label: 'Planning' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployment', label: 'Deployment' }
  ];

  const tagOptions = [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'database', label: 'Database' },
    { value: 'api', label: 'API' },
    { value: 'ui-ux', label: 'UI/UX' },
    { value: 'testing', label: 'Testing' },
    { value: 'documentation', label: 'Documentation' }
  ];

  const handleFieldToggle = (field) => {
    const newActiveFields = new Set(activeFields);
    if (newActiveFields.has(field)) {
      newActiveFields.delete(field);
      const newChanges = { ...bulkChanges };
      delete newChanges[field];
      setBulkChanges(newChanges);
    } else {
      newActiveFields.add(field);
    }
    setActiveFields(newActiveFields);
  };

  const handleFieldChange = (field, value) => {
    setBulkChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyChanges = () => {
    const changes = {};
    activeFields.forEach(field => {
      if (bulkChanges[field] !== undefined && bulkChanges[field] !== '') {
        changes[field] = bulkChanges[field];
      }
    });

    if (Object.keys(changes).length > 0) {
      onUpdate(changes);
      onClose();
    }
  };

  const handleEstimateAdjustment = (operation) => {
    const field = 'estimated_hours_adjustment';
    setActiveFields(prev => new Set([...prev, field]));
    setBulkChanges(prev => ({
      ...prev,
      [field]: { operation, value: 0 }
    }));
  };

  const bulkOperations = [
    {
      id: 'priority',
      label: 'Priority',
      icon: 'Flag',
      description: 'Change priority for all selected tasks'
    },
    {
      id: 'assignee_role',
      label: 'Assignee',
      icon: 'User',
      description: 'Assign or reassign selected tasks'
    },
    {
      id: 'phase',
      label: 'Phase',
      icon: 'Layers',
      description: 'Move tasks to a different phase'
    },
    {
      id: 'due_date',
      label: 'Due Date',
      icon: 'Calendar',
      description: 'Set due date for selected tasks'
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: 'Tag',
      description: 'Add or remove tags'
    },
    {
      id: 'estimated_hours',
      label: 'Time Estimates',
      icon: 'Clock',
      description: 'Adjust time estimates'
    }
  ];

  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Icon name="Edit" size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Edit Tasks</h3>
              <p className="text-sm text-gray-600">
                Editing {selectedCount} selected task{selectedCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
            className="text-gray-500 hover:text-gray-700"
          />
        </div>

        {/* Bulk Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {bulkOperations.map(operation => (
            <div
              key={operation.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${activeFields.has(operation.id)
                  ? 'border-purple-300 bg-purple-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
              onClick={() => handleFieldToggle(operation.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${activeFields.has(operation.id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  <Icon name={operation.icon} size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{operation.label}</h4>
                    {activeFields.has(operation.id) && (
                      <Icon name="Check" size={14} className="text-purple-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{operation.description}</p>
                </div>
              </div>

              {/* Field-specific controls */}
              {activeFields.has(operation.id) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {operation.id === 'priority' && (
                    <Select
                      value={bulkChanges.priority || ''}
                      onChange={(value) => handleFieldChange('priority', value)}
                      options={priorityOptions}
                      className="w-full"
                      size="sm"
                    />
                  )}

                  {operation.id === 'assignee_role' && (
                    <Select
                      value={bulkChanges.assignee_role || ''}
                      onChange={(value) => handleFieldChange('assignee_role', value)}
                      options={assigneeOptions}
                      className="w-full"
                      size="sm"
                    />
                  )}

                  {operation.id === 'phase' && (
                    <Select
                      value={bulkChanges.phase || ''}
                      onChange={(value) => handleFieldChange('phase', value)}
                      options={phaseOptions}
                      className="w-full"
                      size="sm"
                    />
                  )}

                  {operation.id === 'due_date' && (
                    <Input
                      type="date"
                      value={bulkChanges.due_date || ''}
                      onChange={(e) => handleFieldChange('due_date', e.target.value)}
                      className="w-full"
                      size="sm"
                    />
                  )}

                  {operation.id === 'tags' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {tagOptions.map(tag => (
                          <button
                            key={tag.value}
                            onClick={() => {
                              const currentTags = bulkChanges.tags || [];
                              const newTags = currentTags.includes(tag.value)
                                ? currentTags.filter(t => t !== tag.value)
                                : [...currentTags, tag.value];
                              handleFieldChange('tags', newTags);
                            }}
                            className={`
                              px-2 py-1 text-xs rounded border
                              ${(bulkChanges.tags || []).includes(tag.value)
                                ? 'bg-purple-100 border-purple-300 text-purple-700'
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {operation.id === 'estimated_hours' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEstimateAdjustment('multiply')}
                          className="text-xs"
                        >
                          × Multiply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEstimateAdjustment('add')}
                          className="text-xs"
                        >
                          + Add Hours
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEstimateAdjustment('set')}
                          className="text-xs"
                        >
                          = Set Value
                        </Button>
                      </div>
                      {bulkChanges.estimated_hours_adjustment && (
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Enter value..."
                          value={bulkChanges.estimated_hours_adjustment.value || ''}
                          onChange={(e) => handleFieldChange('estimated_hours_adjustment', {
                            ...bulkChanges.estimated_hours_adjustment,
                            value: parseFloat(e.target.value)
                          })}
                          className="w-full"
                          size="sm"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Preview Changes */}
        {activeFields.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Changes:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {Array.from(activeFields).map(field => {
                const operation = bulkOperations.find(op => op.id === field);
                const value = bulkChanges[field];
                return (
                  <div key={field} className="flex items-center gap-2">
                    <Icon name={operation.icon} size={14} />
                    <span>
                      {operation.label}: {
                        field === 'tags' 
                          ? (value || []).join(', ') || 'No tags'
                          : field === 'estimated_hours_adjustment'
                            ? `${value?.operation} ${value?.value || 0}`
                            : value || 'Not set'
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activeFields.size} field{activeFields.size !== 1 ? 's' : ''} will be updated
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyChanges}
              disabled={activeFields.size === 0}
              iconName="Check"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Apply Changes to {selectedCount} Task{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditPanel;
