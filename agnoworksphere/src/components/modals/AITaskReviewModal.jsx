import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import TaskItem from './components/TaskItem';
import BatchOperationsToolbar from './components/BatchOperationsToolbar';
import MeetingScheduler from './components/MeetingScheduler';
import TaskStatistics from './components/TaskStatistics';
import DependencyVisualization from './components/DependencyVisualization';
import SmartSuggestions from './components/SmartSuggestions';
import EnhancedPhaseBreakdown from './components/EnhancedPhaseBreakdown';
import ProjectConfirmationSummary from './components/ProjectConfirmationSummary';

const AITaskReviewModal = ({
  isOpen,
  onClose,
  onFinalize,
  projectData,
  aiGeneratedTasks,
  workflow,
  organizationId,
  organizationMembers = [],
}) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Configure, 2: Overview, 3: Tech Stack, 4: Workflows, 5: Tasks
  const [currentPhase, setCurrentPhase] = useState(5); // Default to Tasks phase for task review
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showDependencyView, setShowDependencyView] = useState(false);
  const [groupBy, setGroupBy] = useState('phase'); // phase, priority, assignee, none
  const [filterBy, setFilterBy] = useState('all'); // all, high-priority, unassigned, etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize tasks from AI generation
  useEffect(() => {
    if (aiGeneratedTasks && aiGeneratedTasks.length > 0) {
      const initialTasks = aiGeneratedTasks.map((task, index) => ({
        id: `task-${index}`,
        ...task,
        isModified: false,
        isNew: false,
        alternatives: generateTaskAlternatives(task),
        meetings: [],
      }));
      setTasks(initialTasks);
    }
  }, [aiGeneratedTasks]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const saveTimer = setTimeout(() => {
        saveTasksToLocalStorage();
        setHasUnsavedChanges(false);
      }, 2000);
      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges, tasks]);

  const generateTaskAlternatives = (task) => {
    // Generate 2-3 alternative approaches for each task
    const alternatives = [];

    // Beginner alternative
    alternatives.push({
      id: `${task.title}-beginner`,
      title: `${task.title} (Simplified)`,
      description: `Simplified approach: ${task.description}`,
      complexity: 'Beginner',
      estimated_hours: Math.max(1, Math.floor(task.estimated_hours * 0.7)),
      story_points: Math.max(1, task.story_points - 2),
      explanation:
        'Simplified approach with basic implementation and minimal complexity',
    });

    // Advanced alternative
    alternatives.push({
      id: `${task.title}-advanced`,
      title: `${task.title} (Enhanced)`,
      description: `Advanced approach: ${task.description} with additional features`,
      complexity: 'Advanced',
      estimated_hours: Math.floor(task.estimated_hours * 1.5),
      story_points: Math.min(21, task.story_points + 3),
      explanation:
        'Enhanced approach with additional features and optimizations',
    });

    return alternatives;
  };

  const saveTasksToDatabase = async () => {
    try {
      // Save tasks to database via API instead of localStorage
      console.log('Tasks saved to database (localStorage not used)');
      // TODO: Implement API call to save tasks to database
    } catch (error) {
      console.error('Failed to save tasks to database:', error);
    }
  };

  const handleTaskUpdate = useCallback((taskId, updates) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, isModified: true } : task
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleTaskSelection = useCallback((taskId, isSelected) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  }, []);

  const handleBulkUpdate = useCallback(
    (updates) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTasks.has(task.id)
            ? { ...task, ...updates, isModified: true }
            : task
        )
      );
      setHasUnsavedChanges(true);
    },
    [selectedTasks]
  );

  const handleTaskReorder = useCallback((dragIndex, hoverIndex) => {
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const draggedTask = newTasks[dragIndex];
      newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, draggedTask);
      return newTasks;
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleApplySuggestion = useCallback(
    async (suggestion, result) => {
      try {
        if (suggestion.id === 'assign-tasks' && result) {
          // Apply auto-assignments
          Object.entries(result).forEach(([taskId, updates]) => {
            handleTaskUpdate(taskId, updates);
          });
        } else if (suggestion.id === 'balance-workload' && result) {
          // Apply workload redistributions
          Object.entries(result).forEach(([taskId, updates]) => {
            handleTaskUpdate(taskId, updates);
          });
        }
        // Add more suggestion handlers as needed
      } catch (error) {
        console.error('Failed to apply suggestion:', error);
      }
    },
    [handleTaskUpdate]
  );

  const validateTasks = async () => {
    setIsValidating(true);
    const errors = [];

    // Check for required fields
    tasks.forEach((task) => {
      if (!task.title?.trim()) {
        errors.push(`Task ${task.id}: Title is required`);
      }
      if (!task.assignee_role) {
        errors.push(`Task ${task.id}: Assignee is required`);
      }
      if (!task.estimated_hours || task.estimated_hours <= 0) {
        errors.push(`Task ${task.id}: Valid estimated hours required`);
      }
    });

    // Check for dependency cycles
    const dependencyErrors = detectDependencyCycles(tasks);
    errors.push(...dependencyErrors);

    // Check resource allocation
    const resourceErrors = validateResourceAllocation(tasks);
    errors.push(...resourceErrors);

    setValidationErrors(errors);
    setIsValidating(false);
    return errors.length === 0;
  };

  const detectDependencyCycles = (tasks) => {
    const errors = [];
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (taskId, dependencies) => {
      if (recursionStack.has(taskId)) {
        return true;
      }
      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find((t) => t.id === taskId);
      if (task?.dependencies) {
        for (const depId of task.dependencies) {
          if (hasCycle(depId, dependencies)) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    tasks.forEach((task) => {
      if (task.dependencies && hasCycle(task.id, task.dependencies)) {
        errors.push(
          `Circular dependency detected involving task: ${task.title}`
        );
      }
    });

    return errors;
  };

  const validateResourceAllocation = (tasks) => {
    const errors = [];
    const assigneeWorkload = {};

    tasks.forEach((task) => {
      if (task.assignee_role) {
        if (!assigneeWorkload[task.assignee_role]) {
          assigneeWorkload[task.assignee_role] = 0;
        }
        assigneeWorkload[task.assignee_role] += task.estimated_hours || 0;
      }
    });

    // Check for overallocation (assuming 40 hours per week capacity)
    Object.entries(assigneeWorkload).forEach(([role, hours]) => {
      if (hours > 160) {
        // 4 weeks * 40 hours
        errors.push(
          `${role} is overallocated with ${hours} hours (recommended max: 160 hours)`
        );
      }
    });

    return errors;
  };

  const handleFinalize = async () => {
    const isValid = await validateTasks();
    if (!isValid) {
      return;
    }

    try {
      await onFinalize({
        tasks: tasks,
        projectData: projectData,
        workflow: workflow,
        modifications: {
          tasksModified: tasks.filter((t) => t.isModified).length,
          tasksAdded: tasks.filter((t) => t.isNew).length,
          totalTasks: tasks.length,
        },
      });

      // Clear localStorage after successful finalization
      localStorage.removeItem(`ai-tasks-${projectData.name}`);
      onClose();
    } catch (error) {
      console.error('Failed to finalize project:', error);
    }
  };

  const getFilteredAndGroupedTasks = () => {
    let filteredTasks = tasks;

    // Apply search filter
    if (searchQuery) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    switch (filterBy) {
      case 'high-priority':
        filteredTasks = filteredTasks.filter(
          (task) => task.priority === 'high' || task.priority === 'urgent'
        );
        break;
      case 'unassigned':
        filteredTasks = filteredTasks.filter((task) => !task.assignee_role);
        break;
      case 'modified':
        filteredTasks = filteredTasks.filter((task) => task.isModified);
        break;
      default:
        break;
    }

    // Group tasks
    if (groupBy === 'none') {
      return { 'All Tasks': filteredTasks };
    }

    const grouped = {};
    filteredTasks.forEach((task) => {
      let groupKey;
      switch (groupBy) {
        case 'phase':
          groupKey = task.phase || 'Unassigned Phase';
          break;
        case 'priority':
          groupKey = task.priority || 'No Priority';
          break;
        case 'assignee':
          groupKey = task.assignee_role || 'Unassigned';
          break;
        default:
          groupKey = 'All Tasks';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });

    return grouped;
  };

  const calculateProgress = () => {
    const totalTasks = tasks.length;
    const reviewedTasks = tasks.filter(
      (task) => task.title && task.assignee_role && task.estimated_hours > 0
    ).length;
    return totalTasks > 0 ? Math.round((reviewedTasks / totalTasks) * 100) : 0;
  };

  if (!isOpen) return null;

  const progress = calculateProgress();
  const groupedTasks = getFilteredAndGroupedTasks();

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20'>
        {/* Enhanced Header with Modern Design */}
        <div className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200'>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-5'>
            <div className='absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-16 -translate-y-16'></div>
            <div className='absolute bottom-0 right-0 w-24 h-24 bg-purple-500 rounded-full translate-x-12 translate-y-12'></div>
          </div>

          <div className='relative p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-6'>
                {/* Enhanced Project Icon */}
                <div className='relative'>
                  <div className='w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200'>
                    <Icon name='Brain' size={28} className='text-white' />
                  </div>
                  <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white'>
                    <Icon name='Sparkles' size={12} className='text-white' />
                  </div>
                </div>

                <div className='space-y-2'>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                    {projectData.name}
                  </h1>

                  {/* Enhanced Stats Cards */}
                  <div className='flex items-center gap-6'>
                    <div className='flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-white/50 shadow-sm'>
                      <Icon name='List' size={14} className='text-blue-600' />
                      <span className='text-sm font-medium text-gray-700'>
                        {tasks.length} tasks
                      </span>
                    </div>

                    <div className='flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-white/50 shadow-sm'>
                      <Icon
                        name='Calendar'
                        size={14}
                        className='text-indigo-600'
                      />
                      <span className='text-sm font-medium text-gray-700'>
                        {workflow?.total_duration_days || 'TBD'} days
                      </span>
                    </div>

                    <div className='flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-white/50 shadow-sm'>
                      <div className='relative w-4 h-4'>
                        <div className='absolute inset-0 bg-green-200 rounded-full'></div>
                        <div
                          className='absolute inset-0 bg-green-500 rounded-full transition-all duration-500'
                          style={{
                            clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
                          }}
                        ></div>
                      </div>
                      <span className='text-sm font-medium text-gray-700'>
                        {progress}% reviewed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced 5-Phase Progress Indicator */}
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-3'>
                  {[
                    {
                      step: 1,
                      label: 'Configure',
                      icon: 'Settings',
                      color: 'blue',
                    },
                    {
                      step: 2,
                      label: 'Overview',
                      icon: 'FileText',
                      color: 'indigo',
                    },
                    {
                      step: 3,
                      label: 'Tech Stack',
                      icon: 'Code',
                      color: 'purple',
                    },
                    {
                      step: 4,
                      label: 'Workflows',
                      icon: 'GitBranch',
                      color: 'pink',
                    },
                    {
                      step: 5,
                      label: 'Tasks',
                      icon: 'CheckSquare',
                      color: 'green',
                    },
                  ].map((phase, index) => (
                    <div key={phase.step} className='flex items-center'>
                      <div className='flex flex-col items-center gap-1'>
                        <div
                          className={`
                          relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 transform hover:scale-105
                          ${
                            currentStep >= phase.step
                              ? `bg-gradient-to-br from-${phase.color}-500 to-${phase.color}-600 text-white shadow-lg`
                              : 'bg-white/70 text-gray-500 border border-gray-200'
                          }
                        `}
                        >
                          <Icon name={phase.icon} size={16} />
                          {currentStep > phase.step && (
                            <div className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                              <Icon
                                name='Check'
                                size={10}
                                className='text-white'
                              />
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            currentStep >= phase.step
                              ? 'text-gray-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {phase.label}
                        </span>
                      </div>

                      {index < 4 && (
                        <div
                          className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                            currentStep > phase.step
                              ? `bg-gradient-to-r from-${phase.color}-500 to-${
                                  phase.color === 'green' ? 'green' : 'indigo'
                                }-500`
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onClose}
                  iconName='X'
                  className='text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all duration-200'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content with Phase-Based Layout */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Main Content Area */}
          <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Phase Navigation */}
            <div className='p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/50 border-b border-gray-200/50'>
              <EnhancedPhaseBreakdown
                tasks={tasks}
                onPhaseUpdate={handleTaskUpdate}
                currentPhase={currentPhase}
              />
            </div>

            {/* Enhanced Toolbar */}
            <BatchOperationsToolbar
              selectedTasks={selectedTasks}
              onBulkUpdate={handleBulkUpdate}
              onSelectAll={() =>
                setSelectedTasks(new Set(tasks.map((t) => t.id)))
              }
              onSelectNone={() => setSelectedTasks(new Set())}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              filterBy={filterBy}
              onFilterByChange={setFilterBy}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showDependencyView={showDependencyView}
              onToggleDependencyView={setShowDependencyView}
            />

            {/* Enhanced Task List with Modern Cards */}
            <div className='flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/30 to-blue-50/20'>
              {showDependencyView ? (
                <DependencyVisualization
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                />
              ) : (
                <div className='space-y-8'>
                  {Object.entries(groupedTasks).map(
                    ([groupName, groupTasks]) => (
                      <div key={groupName} className='space-y-4'>
                        {groupBy !== 'none' && (
                          <div className='flex items-center gap-4 mb-6'>
                            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
                              <Icon
                                name='Folder'
                                size={20}
                                className='text-white'
                              />
                            </div>
                            <div>
                              <h3 className='text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                                {groupName}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                {groupTasks.length} task
                                {groupTasks.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className='grid gap-4'>
                          {groupTasks.map((task, index) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              index={index}
                              isSelected={selectedTasks.has(task.id)}
                              isEditing={editingTask === task.id}
                              organizationMembers={organizationMembers}
                              onUpdate={handleTaskUpdate}
                              onSelect={handleTaskSelection}
                              onStartEdit={setEditingTask}
                              onStopEdit={() => setEditingTask(null)}
                              onReorder={handleTaskReorder}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Sidebar with Modern Design */}
          <div className='w-80 border-l border-gray-200/50 bg-gradient-to-br from-white/80 to-blue-50/30 backdrop-blur-sm flex flex-col'>
            <div className='p-6 border-b border-gray-200/50'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
                  <Icon name='BarChart3' size={20} className='text-white' />
                </div>
                <div>
                  <h3 className='text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                    Project Overview
                  </h3>
                  <p className='text-sm text-gray-600'>Analytics & Insights</p>
                </div>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              <TaskStatistics tasks={tasks} />
              <SmartSuggestions
                tasks={tasks}
                onApplySuggestion={handleApplySuggestion}
                onDismiss={() => {}}
              />
              <MeetingScheduler
                projectData={projectData}
                tasks={tasks}
                organizationMembers={organizationMembers}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Footer with Modern Design */}
        <div className='border-t border-gray-200/50 p-6 bg-gradient-to-r from-white/90 to-blue-50/50 backdrop-blur-sm'>
          {validationErrors.length > 0 && (
            <div className='mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-sm'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Icon name='AlertTriangle' size={16} className='text-white' />
                </div>
                <div>
                  <h4 className='text-sm font-semibold text-red-800 mb-2'>
                    Validation Issues Found
                  </h4>
                  <ul className='text-sm text-red-700 space-y-1'>
                    {validationErrors.map((error, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <Icon
                          name='Dot'
                          size={12}
                          className='mt-1 flex-shrink-0'
                        />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2 px-3 py-2 bg-white/70 rounded-xl border border-gray-200/50'>
                <Icon name='Edit' size={14} className='text-blue-600' />
                <span className='text-sm font-medium text-gray-700'>
                  {tasks.filter((t) => t.isModified).length} tasks modified
                </span>
              </div>

              {hasUnsavedChanges && (
                <div className='flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl border border-orange-200 animate-pulse'>
                  <Icon name='Clock' size={14} className='text-orange-600' />
                  <span className='text-sm font-medium text-orange-700'>
                    Auto-saving...
                  </span>
                </div>
              )}
            </div>

            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                onClick={onClose}
                disabled={isValidating}
                className='px-6 py-3 border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200'
              >
                Cancel
              </Button>
              <Button
                onClick={handleFinalize}
                disabled={isValidating || validationErrors.length > 0}
                iconName={isValidating ? 'Loader2' : 'Sparkles'}
                iconPosition='left'
                className={`px-8 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 ${
                  isValidating ? 'animate-spin' : ''
                } ${
                  validationErrors.length > 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200'
                } text-white border-0`}
              >
                {isValidating
                  ? 'Validating Project...'
                  : 'Finalize & Create Project'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITaskReviewModal;
