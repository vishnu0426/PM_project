import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Icon from '../../AppIcon';

const DependencySelector = ({ task, allTasks, onUpdate, onClose }) => {
  const [selectedDependencies, setSelectedDependencies] = useState(task.dependencies || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [cycleWarnings, setCycleWarnings] = useState([]);

  // Filter available tasks (exclude self and already selected)
  const availableTasks = allTasks.filter(t => 
    t.id !== task.id && 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Check for potential cycles when dependencies change
    const warnings = detectPotentialCycles(task.id, selectedDependencies, allTasks);
    setCycleWarnings(warnings);
  }, [selectedDependencies, task.id, allTasks]);

  const detectPotentialCycles = (taskId, dependencies, tasks) => {
    const warnings = [];
    
    const checkCycle = (currentId, targetId, visited = new Set()) => {
      if (visited.has(currentId)) return false;
      if (currentId === targetId) return true;
      
      visited.add(currentId);
      const currentTask = tasks.find(t => t.id === currentId);
      if (currentTask?.dependencies) {
        for (const depId of currentTask.dependencies) {
          if (checkCycle(depId, targetId, new Set(visited))) {
            return true;
          }
        }
      }
      return false;
    };

    dependencies.forEach(depId => {
      const depTask = tasks.find(t => t.id === depId);
      if (depTask && checkCycle(depId, taskId)) {
        warnings.push(`Adding dependency on "${depTask.title}" would create a circular dependency`);
      }
    });

    return warnings;
  };

  const handleDependencyToggle = (dependencyId) => {
    const newDependencies = selectedDependencies.includes(dependencyId)
      ? selectedDependencies.filter(id => id !== dependencyId)
      : [...selectedDependencies, dependencyId];
    
    setSelectedDependencies(newDependencies);
  };

  const handleSave = () => {
    if (cycleWarnings.length === 0) {
      onUpdate(selectedDependencies);
      onClose();
    }
  };

  const getDependencyChain = (taskId, visited = new Set()) => {
    if (visited.has(taskId)) return [];
    visited.add(taskId);
    
    const currentTask = allTasks.find(t => t.id === taskId);
    if (!currentTask?.dependencies) return [currentTask];
    
    const chain = [currentTask];
    currentTask.dependencies.forEach(depId => {
      chain.push(...getDependencyChain(depId, new Set(visited)));
    });
    
    return chain;
  };

  const getTaskPriority = (taskId) => {
    const taskObj = allTasks.find(t => t.id === taskId);
    return taskObj?.priority || 'medium';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-purple-900 flex items-center gap-2">
          <Icon name="Link" size={16} />
          Manage Dependencies
        </h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          iconName="X"
          className="text-purple-600 hover:text-purple-800"
        />
      </div>

      {/* Current Dependencies */}
      {selectedDependencies.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-purple-800 mb-2">Current Dependencies:</h5>
          <div className="space-y-2">
            {selectedDependencies.map(depId => {
              const depTask = allTasks.find(t => t.id === depId);
              if (!depTask) return null;
              
              return (
                <div
                  key={depId}
                  className="flex items-center justify-between p-2 bg-white border border-purple-200 rounded"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(depTask.priority)}`}>
                      {depTask.priority}
                    </span>
                    <span className="text-sm text-gray-900 truncate">
                      {depTask.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({depTask.estimated_hours}h)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDependencyToggle(depId)}
                    iconName="X"
                    className="text-red-500 hover:text-red-700"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cycle Warnings */}
      {cycleWarnings.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h6 className="text-sm font-medium text-red-800">Dependency Cycle Detected</h6>
              <ul className="text-xs text-red-700 mt-1 space-y-1">
                {cycleWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          iconName="Search"
        />
      </div>

      {/* Available Tasks */}
      <div className="max-h-48 overflow-y-auto space-y-2">
        {availableTasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            {searchQuery ? 'No tasks found matching your search' : 'No available tasks'}
          </div>
        ) : (
          availableTasks.map(availableTask => {
            const isSelected = selectedDependencies.includes(availableTask.id);
            const wouldCreateCycle = cycleWarnings.some(warning => 
              warning.includes(availableTask.title)
            );
            
            return (
              <div
                key={availableTask.id}
                className={`
                  p-3 border rounded cursor-pointer transition-colors
                  ${isSelected 
                    ? 'bg-purple-100 border-purple-300' 
                    : wouldCreateCycle
                      ? 'bg-red-50 border-red-200 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
                onClick={() => !wouldCreateCycle && handleDependencyToggle(availableTask.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={wouldCreateCycle}
                      onChange={() => {}} // Handled by parent click
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(availableTask.priority)}`}>
                        {availableTask.priority}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {availableTask.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{availableTask.phase}</span>
                      <span>•</span>
                      <span>{availableTask.estimated_hours}h</span>
                      <span>•</span>
                      <span>{availableTask.story_points} SP</span>
                      {availableTask.assignee_role && (
                        <>
                          <span>•</span>
                          <span>@{availableTask.assignee_role}</span>
                        </>
                      )}
                    </div>
                    
                    {availableTask.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {availableTask.description}
                      </p>
                    )}
                    
                    {wouldCreateCycle && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                        <Icon name="AlertTriangle" size={12} />
                        <span>Would create circular dependency</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Smart Suggestions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h6 className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
          <Icon name="Lightbulb" size={12} />
          Smart Suggestions
        </h6>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Tasks in earlier phases are typically good dependencies</p>
          <p>• Consider tasks that provide required inputs or setup</p>
          <p>• Avoid creating long dependency chains that could delay the project</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-200">
        <div className="text-xs text-purple-700">
          {selectedDependencies.length} dependencies selected
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={cycleWarnings.length > 0}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Save Dependencies
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DependencySelector;
