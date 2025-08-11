import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Icon from '../../AppIcon';
import TaskAlternatives from './TaskAlternatives';
import DependencySelector from './DependencySelector';

const TaskItem = ({
  task,
  index,
  isSelected,
  isEditing,
  organizationMembers,
  onUpdate,
  onSelect,
  onStartEdit,
  onStopEdit,
  onReorder
}) => {
  const [localTask, setLocalTask] = useState(task);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const ref = useRef(null);
  const titleRef = useRef(null);

  // Drag and Drop
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'task',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        onReorder(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  drag(drop(ref));

  // Priority options with colors
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-50' }
  ];

  // Story points options (Fibonacci sequence)
  const storyPointOptions = [
    { value: 1, label: '1 - Trivial' },
    { value: 2, label: '2 - Small' },
    { value: 3, label: '3 - Medium' },
    { value: 5, label: '5 - Large' },
    { value: 8, label: '8 - Very Large' },
    { value: 13, label: '13 - Huge' },
    { value: 21, label: '21 - Epic' }
  ];

  // Role options from organization members
  const roleOptions = organizationMembers.map(member => ({
    value: member.id,
    label: `${member.name} (${member.role})`,
    role: member.role
  }));

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isEditing]);

  const handleFieldChange = (field, value) => {
    const updatedTask = { ...localTask, [field]: value };
    setLocalTask(updatedTask);
    
    // Validate field
    const errors = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: errors }));
    
    // Auto-save after 500ms delay
    clearTimeout(window.taskUpdateTimeout);
    window.taskUpdateTimeout = setTimeout(() => {
      onUpdate(task.id, { [field]: value });
    }, 500);
  };

  const validateField = (field, value) => {
    const errors = [];
    
    switch (field) {
      case 'title':
        if (!value?.trim()) errors.push('Title is required');
        if (value?.length > 100) errors.push('Title must be less than 100 characters');
        break;
      case 'estimated_hours':
        if (!value || value <= 0) errors.push('Estimated hours must be greater than 0');
        if (value > 200) errors.push('Estimated hours seems too high (max 200)');
        break;
      case 'description':
        if (value?.length > 1000) errors.push('Description must be less than 1000 characters');
        break;
    }
    
    return errors;
  };

  const handleSaveChanges = () => {
    // Validate all fields
    const allErrors = {};
    Object.keys(localTask).forEach(field => {
      const errors = validateField(field, localTask[field]);
      if (errors.length > 0) allErrors[field] = errors;
    });
    
    if (Object.keys(allErrors).length === 0) {
      onUpdate(task.id, localTask);
      onStopEdit();
    } else {
      setValidationErrors(allErrors);
    }
  };

  const handleCancelEdit = () => {
    setLocalTask(task);
    setValidationErrors({});
    onStopEdit();
  };

  const handleAlternativeSelect = (alternative) => {
    const updatedTask = {
      ...localTask,
      title: alternative.title,
      description: alternative.description,
      estimated_hours: alternative.estimated_hours,
      story_points: alternative.story_points,
      complexity: alternative.complexity
    };
    setLocalTask(updatedTask);
    onUpdate(task.id, updatedTask);
    setShowAlternatives(false);
  };

  const getPriorityColor = (priority) => {
    const option = priorityOptions.find(p => p.value === priority);
    return option ? option.color : 'text-gray-600 bg-gray-50';
  };

  const getEstimatedDuration = () => {
    const hours = localTask.estimated_hours || 0;
    if (hours < 8) return `${hours}h`;
    const days = Math.round(hours / 8 * 10) / 10;
    return `${days}d`;
  };

  return (
    <div
      ref={ref}
      className={`
        group relative bg-white border rounded-2xl p-6 transition-all duration-300 transform
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:scale-[1.02]'}
        ${isSelected ? 'ring-2 ring-blue-400 border-blue-300 shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}
        ${task.isModified ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-transparent' : ''}
        hover:shadow-xl hover:shadow-gray-100
      `}
    >
      {/* Modern Card Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 overflow-hidden">
        <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full"></div>
        <div className="absolute top-8 right-8 w-4 h-4 bg-purple-500 rounded-full"></div>
        <div className="absolute top-12 right-12 w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
      {/* Enhanced Task Header */}
      <div className="relative flex items-start gap-4">
        {/* Modern Selection Checkbox */}
        <div className="flex items-center pt-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(task.id, e.target.checked)}
              className="sr-only"
            />
            <div className={`
              w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
              ${isSelected
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 shadow-lg shadow-blue-200'
                : 'border-gray-300 hover:border-blue-400 bg-white'
              }
            `}>
              {isSelected && <Icon name="Check" size={12} className="text-white" />}
            </div>
          </label>
        </div>

        {/* Enhanced Drag Handle */}
        <div className="flex items-center pt-2 cursor-move text-gray-400 hover:text-blue-500 transition-colors duration-200">
          <div className="p-1 rounded-lg hover:bg-blue-50">
            <Icon name="GripVertical" size={16} />
          </div>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {isEditing ? (
            <div className="space-y-2">
              <Input
                ref={titleRef}
                value={localTask.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Task title..."
                className={`text-lg font-medium ${validationErrors.title ? 'border-red-300' : ''}`}
                maxLength={100}
              />
              {validationErrors.title && (
                <div className="text-xs text-red-600">
                  {validationErrors.title.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <h3 
              className="text-lg font-medium text-gray-900 cursor-pointer hover:text-purple-600"
              onClick={() => onStartEdit(task.id)}
            >
              {localTask.title}
            </h3>
          )}

          {/* Enhanced Metadata Cards */}
          <div className="flex items-center gap-3 mt-3">
            {/* Priority Badge with Icon */}
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 hover:scale-105
              ${getPriorityColor(localTask.priority)} border-current/20
            `}>
              <Icon name="Flag" size={12} />
              {localTask.priority || 'No Priority'}
            </div>

            {/* Story Points Card */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-xl text-xs font-medium border border-purple-200">
              <Icon name="Target" size={12} />
              {localTask.story_points || 0} SP
            </div>

            {/* Estimated Duration Card */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-xl text-xs font-medium border border-blue-200">
              <Icon name="Clock" size={12} />
              {getEstimatedDuration()}
            </div>

            {/* Assignee Card */}
            {localTask.assignee_role && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-xs font-medium border border-green-200">
                <Icon name="User" size={12} />
                {localTask.assignee_role}
              </div>
            )}

            {/* Dependencies Card */}
            {localTask.dependencies?.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-xl text-xs font-medium border border-orange-200">
                <Icon name="Link" size={12} />
                {localTask.dependencies.length} deps
              </div>
            )}

            {/* Modified Indicator */}
            {task.isModified && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-xs font-medium shadow-lg shadow-blue-200 animate-pulse">
                <Icon name="Edit" size={12} />
                Modified
              </div>
            )}
          </div>

          {/* Description */}
          {(isExpanded || isEditing) && (
            <div className="mt-3">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={localTask.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Task description..."
                    rows={3}
                    maxLength={1000}
                    className={`w-full p-2 border rounded-md resize-none ${
                      validationErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.description && (
                    <div className="text-xs text-red-600">
                      {validationErrors.description.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {localTask.description}
                </p>
              )}
            </div>
          )}

          {/* Editing Fields */}
          {isEditing && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <Select
                  value={localTask.priority || 'medium'}
                  onChange={(value) => handleFieldChange('priority', value)}
                  options={priorityOptions}
                  className="w-full"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Hours</label>
                <Input
                  type="number"
                  min="0.5"
                  max="200"
                  step="0.5"
                  value={localTask.estimated_hours || ''}
                  onChange={(e) => handleFieldChange('estimated_hours', parseFloat(e.target.value))}
                  className={validationErrors.estimated_hours ? 'border-red-300' : ''}
                />
                {validationErrors.estimated_hours && (
                  <div className="text-xs text-red-600 mt-1">
                    {validationErrors.estimated_hours.join(', ')}
                  </div>
                )}
              </div>

              {/* Story Points */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Story Points</label>
                <Select
                  value={localTask.story_points || 3}
                  onChange={(value) => handleFieldChange('story_points', value)}
                  options={storyPointOptions}
                  className="w-full"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
                <Select
                  value={localTask.assignee_role || ''}
                  onChange={(value) => handleFieldChange('assignee_role', value)}
                  options={[{ value: '', label: 'Unassigned' }, ...roleOptions]}
                  className="w-full"
                />
              </div>

              {/* Due Date */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={localTask.due_date || ''}
                  onChange={(e) => handleFieldChange('due_date', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                iconName="X"
              />
              <Button
                size="sm"
                onClick={handleSaveChanges}
                iconName="Check"
                disabled={Object.keys(validationErrors).length > 0}
              />
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                title={isExpanded ? "Collapse" : "Expand"}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStartEdit(task.id)}
                iconName="Edit"
                title="Edit task"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAlternatives(!showAlternatives)}
                iconName="Lightbulb"
                title="View AI alternatives"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDependencies(!showDependencies)}
                iconName="Link"
                title="Manage dependencies"
              />
            </>
          )}
        </div>
      </div>

      {/* AI Alternatives Panel */}
      {showAlternatives && (
        <TaskAlternatives
          alternatives={task.alternatives || []}
          onSelect={handleAlternativeSelect}
          onClose={() => setShowAlternatives(false)}
        />
      )}

      {/* Dependencies Panel */}
      {showDependencies && (
        <DependencySelector
          task={localTask}
          allTasks={[]} // Will be passed from parent
          onUpdate={(dependencies) => handleFieldChange('dependencies', dependencies)}
          onClose={() => setShowDependencies(false)}
        />
      )}

      {/* Checklist Preview */}
      {localTask.checklist && localTask.checklist.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-600 mb-2">
            Checklist ({localTask.checklist.filter(item => item.completed).length}/{localTask.checklist.length})
          </div>
          <div className="space-y-1">
            {localTask.checklist.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                <Icon 
                  name={item.completed ? "CheckCircle" : "Circle"} 
                  size={12} 
                  className={item.completed ? "text-green-500" : "text-gray-400"} 
                />
                <span className={item.completed ? "line-through" : ""}>{item.title}</span>
              </div>
            ))}
            {localTask.checklist.length > 3 && (
              <div className="text-xs text-gray-500">
                +{localTask.checklist.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
