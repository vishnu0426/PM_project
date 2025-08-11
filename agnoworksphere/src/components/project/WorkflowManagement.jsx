import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import Icon from '../AppIcon';

const WorkflowManagement = ({ 
  onNext, 
  onBack, 
  initialData = {}, 
  className 
}) => {
  const [workflow, setWorkflow] = useState({
    phases: [
      {
        id: 'planning',
        name: 'Planning & Analysis',
        duration: 2,
        tasks: [
          { id: 'req-gathering', name: 'Requirements Gathering', duration: 3, dependencies: [], priority: 'high' },
          { id: 'analysis', name: 'System Analysis', duration: 5, dependencies: ['req-gathering'], priority: 'high' },
          { id: 'architecture', name: 'Architecture Design', duration: 4, dependencies: ['analysis'], priority: 'medium' }
        ]
      },
      {
        id: 'design',
        name: 'Design & Prototyping',
        duration: 3,
        tasks: [
          { id: 'ui-design', name: 'UI/UX Design', duration: 7, dependencies: ['architecture'], priority: 'high' },
          { id: 'prototype', name: 'Interactive Prototype', duration: 5, dependencies: ['ui-design'], priority: 'medium' },
          { id: 'design-review', name: 'Design Review', duration: 2, dependencies: ['prototype'], priority: 'low' }
        ]
      },
      {
        id: 'development',
        name: 'Development',
        duration: 8,
        tasks: [
          { id: 'setup', name: 'Development Setup', duration: 2, dependencies: ['design-review'], priority: 'high' },
          { id: 'backend-dev', name: 'Backend Development', duration: 10, dependencies: ['setup'], priority: 'high' },
          { id: 'frontend-dev', name: 'Frontend Development', duration: 8, dependencies: ['setup'], priority: 'high' },
          { id: 'integration', name: 'System Integration', duration: 5, dependencies: ['backend-dev', 'frontend-dev'], priority: 'high' }
        ]
      },
      {
        id: 'testing',
        name: 'Testing & QA',
        duration: 3,
        tasks: [
          { id: 'unit-testing', name: 'Unit Testing', duration: 4, dependencies: ['integration'], priority: 'high' },
          { id: 'integration-testing', name: 'Integration Testing', duration: 3, dependencies: ['unit-testing'], priority: 'high' },
          { id: 'user-testing', name: 'User Acceptance Testing', duration: 5, dependencies: ['integration-testing'], priority: 'medium' }
        ]
      },
      {
        id: 'deployment',
        name: 'Deployment & Launch',
        duration: 2,
        tasks: [
          { id: 'deployment-prep', name: 'Deployment Preparation', duration: 3, dependencies: ['user-testing'], priority: 'high' },
          { id: 'production-deploy', name: 'Production Deployment', duration: 1, dependencies: ['deployment-prep'], priority: 'urgent' },
          { id: 'monitoring', name: 'Post-Launch Monitoring', duration: 7, dependencies: ['production-deploy'], priority: 'medium' }
        ]
      }
    ],
    ...initialData
  });

  const [viewMode, setViewMode] = useState('gantt'); // 'gantt', 'flowchart', 'timeline'
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedPhase, setDraggedPhase] = useState(null);

  const viewModeOptions = [
    { value: 'gantt', label: 'Gantt Chart' },
    { value: 'flowchart', label: 'Flow Diagram' },
    { value: 'timeline', label: 'Timeline View' }
  ];

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const calculateTaskPosition = (task, phaseIndex) => {
    let startDay = 0;
    
    // Calculate start position based on dependencies
    if (task.dependencies.length > 0) {
      const maxEndDay = Math.max(...task.dependencies.map(depId => {
        // Find the dependent task across all phases
        for (const phase of workflow.phases) {
          const depTask = phase.tasks.find(t => t.id === depId);
          if (depTask) {
            return calculateTaskPosition(depTask, workflow.phases.indexOf(phase)).endDay;
          }
        }
        return 0;
      }));
      startDay = maxEndDay;
    } else {
      // Calculate based on phase start
      for (let i = 0; i < phaseIndex; i++) {
        startDay += workflow.phases[i].duration * 7; // Convert weeks to days
      }
    }

    return {
      startDay,
      endDay: startDay + task.duration,
      duration: task.duration
    };
  };

  const getTotalProjectDuration = () => {
    let maxEndDay = 0;
    workflow.phases.forEach((phase, phaseIndex) => {
      phase.tasks.forEach(task => {
        const position = calculateTaskPosition(task, phaseIndex);
        maxEndDay = Math.max(maxEndDay, position.endDay);
      });
    });
    return maxEndDay;
  };

  const handleTaskDragStart = (e, task, phaseId) => {
    setDraggedTask({ task, phaseId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDrop = (e, targetPhaseId, targetIndex) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    const { task, phaseId: sourcePhaseId } = draggedTask;
    
    if (sourcePhaseId === targetPhaseId) {
      // Reorder within same phase
      setWorkflow(prev => ({
        ...prev,
        phases: prev.phases.map(phase => {
          if (phase.id === sourcePhaseId) {
            const tasks = [...phase.tasks];
            const sourceIndex = tasks.findIndex(t => t.id === task.id);
            tasks.splice(sourceIndex, 1);
            tasks.splice(targetIndex, 0, task);
            return { ...phase, tasks };
          }
          return phase;
        })
      }));
    } else {
      // Move between phases
      setWorkflow(prev => ({
        ...prev,
        phases: prev.phases.map(phase => {
          if (phase.id === sourcePhaseId) {
            return {
              ...phase,
              tasks: phase.tasks.filter(t => t.id !== task.id)
            };
          }
          if (phase.id === targetPhaseId) {
            const tasks = [...phase.tasks];
            tasks.splice(targetIndex, 0, task);
            return { ...phase, tasks };
          }
          return phase;
        })
      }));
    }
    
    setDraggedTask(null);
  };

  const addNewTask = (phaseId) => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      duration: 3,
      dependencies: [],
      priority: 'medium'
    };

    setWorkflow(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === phaseId 
          ? { ...phase, tasks: [...phase.tasks, newTask] }
          : phase
      )
    }));
  };

  const updateTask = (phaseId, taskId, updates) => {
    setWorkflow(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === phaseId 
          ? {
              ...phase,
              tasks: phase.tasks.map(task => 
                task.id === taskId ? { ...task, ...updates } : task
              )
            }
          : phase
      )
    }));
  };

  const removeTask = (phaseId, taskId) => {
    setWorkflow(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === phaseId 
          ? { ...phase, tasks: phase.tasks.filter(task => task.id !== taskId) }
          : phase
      )
    }));
  };

  const openTaskModal = (task, phaseId) => {
    setSelectedTask({ ...task, phaseId });
    setIsTaskModalOpen(true);
  };

  const renderGanttChart = () => {
    const totalDuration = getTotalProjectDuration();
    const dayWidth = 800 / totalDuration; // 800px total width

    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Gantt Chart View</h3>
          <div className="text-sm text-muted-foreground">
            Total Duration: {Math.ceil(totalDuration / 7)} weeks ({totalDuration} days)
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Timeline header */}
            <div className="flex mb-4">
              <div className="w-64 flex-shrink-0"></div>
              <div className="flex-1 relative">
                <div className="flex border-b border-border pb-2">
                  {Array.from({ length: Math.ceil(totalDuration / 7) }, (_, weekIndex) => (
                    <div 
                      key={weekIndex}
                      className="text-xs text-muted-foreground text-center"
                      style={{ width: `${dayWidth * 7}px` }}
                    >
                      Week {weekIndex + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {workflow.phases.map((phase, phaseIndex) => (
                <div key={phase.id}>
                  <div className="flex items-center mb-2">
                    <div className="w-64 flex-shrink-0">
                      <h4 className="font-medium text-foreground">{phase.name}</h4>
                    </div>
                  </div>
                  
                  {phase.tasks.map((task) => {
                    const position = calculateTaskPosition(task, phaseIndex);
                    
                    return (
                      <div key={task.id} className="flex items-center mb-1">
                        <div className="w-64 flex-shrink-0 pr-4">
                          <div className="text-sm text-muted-foreground truncate">
                            {task.name}
                          </div>
                        </div>
                        <div className="flex-1 relative h-8">
                          <div
                            className={cn(
                              "absolute h-6 rounded cursor-pointer transition-all duration-200",
                              "hover:shadow-md flex items-center px-2",
                              priorityColors[task.priority]
                            )}
                            style={{
                              left: `${position.startDay * dayWidth}px`,
                              width: `${position.duration * dayWidth}px`
                            }}
                            onClick={() => openTaskModal(task, phase.id)}
                          >
                            <span className="text-xs font-medium truncate">
                              {task.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFlowChart = () => {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Flow Diagram</h3>
        
        <div className="space-y-8">
          {workflow.phases.map((phase, phaseIndex) => (
            <div key={phase.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary"></div>
                <h4 className="text-lg font-medium text-foreground">{phase.name}</h4>
              </div>
              
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phase.tasks.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:scale-105",
                      priorityColors[task.priority]
                    )}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, task, phase.id)}
                    onDragOver={handleTaskDragOver}
                    onDrop={(e) => handleTaskDrop(e, phase.id, taskIndex)}
                    onClick={() => openTaskModal(task, phase.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm">{task.name}</h5>
                      <Icon name="GripVertical" className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      Duration: {task.duration} days
                    </div>
                    
                    {task.dependencies.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Depends on: {task.dependencies.length} task(s)
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={() => addNewTask(phase.id)}
                  className="p-4 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors duration-200 flex items-center justify-center text-muted-foreground hover:text-primary"
                >
                  <Icon name="Plus" className="h-6 w-6" />
                </button>
              </div>
              
              {phaseIndex < workflow.phases.length - 1 && (
                <div className="flex justify-center">
                  <Icon name="ArrowDown" className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Timeline View</h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          <div className="space-y-8">
            {workflow.phases.map((phase, phaseIndex) => (
              <div key={phase.id} className="relative">
                {/* Phase marker */}
                <div className="absolute left-6 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                
                <div className="ml-16">
                  <h4 className="text-lg font-medium text-foreground mb-2">{phase.name}</h4>
                  <div className="text-sm text-muted-foreground mb-4">
                    Duration: {phase.duration} weeks
                  </div>
                  
                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors duration-200"
                        onClick={() => openTaskModal(task, phase.id)}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.priority === 'urgent' && "bg-red-500",
                          task.priority === 'high' && "bg-orange-500",
                          task.priority === 'medium' && "bg-yellow-500",
                          task.priority === 'low' && "bg-blue-500"
                        )}></div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-sm">{task.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {task.duration} days • {task.priority} priority
                          </div>
                        </div>
                        
                        {task.dependencies.length > 0 && (
                          <Icon name="Link" className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleNext = () => {
    onNext?.(workflow);
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Project Workflow</h2>
        <p className="text-muted-foreground">
          Visualize and organize your project tasks and dependencies
        </p>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <Select
          value={viewMode}
          onChange={setViewMode}
          options={viewModeOptions}
          className="w-48"
        />
        
        <div className="text-sm text-muted-foreground">
          {workflow.phases.reduce((total, phase) => total + phase.tasks.length, 0)} tasks across {workflow.phases.length} phases
        </div>
      </div>

      {/* Workflow Visualization */}
      {viewMode === 'gantt' && renderGanttChart()}
      {viewMode === 'flowchart' && renderFlowChart()}
      {viewMode === 'timeline' && renderTimelineView()}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Tech Stack
        </Button>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Step 4 of 6
          </div>
          <Button
            onClick={handleNext}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continue to Tasks
          </Button>
        </div>
      </div>

      {/* Task Details Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Task Details"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Task Name"
                value={selectedTask.name}
                onChange={(e) => setSelectedTask(prev => ({ ...prev, name: e.target.value }))}
              />

              <Input
                label="Duration (days)"
                type="number"
                value={selectedTask.duration}
                onChange={(e) => setSelectedTask(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>

            <Select
              label="Priority"
              value={selectedTask.priority}
              onChange={(value) => setSelectedTask(prev => ({ ...prev, priority: value }))}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'urgent', label: 'Urgent Priority' }
              ]}
            />

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Dependencies
              </label>
              <div className="space-y-2">
                {workflow.phases.map(phase =>
                  phase.tasks
                    .filter(task => task.id !== selectedTask.id)
                    .map(task => (
                      <label key={task.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTask.dependencies.includes(task.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedTask(prev => ({
                              ...prev,
                              dependencies: isChecked
                                ? [...prev.dependencies, task.id]
                                : prev.dependencies.filter(id => id !== task.id)
                            }));
                          }}
                          className="rounded border-input"
                        />
                        <span className="text-sm">{task.name}</span>
                      </label>
                    ))
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() => {
                  removeTask(selectedTask.phaseId, selectedTask.id);
                  setIsTaskModalOpen(false);
                }}
                iconName="Trash2"
                iconPosition="left"
              >
                Delete Task
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateTask(selectedTask.phaseId, selectedTask.id, {
                      name: selectedTask.name,
                      duration: selectedTask.duration,
                      priority: selectedTask.priority,
                      dependencies: selectedTask.dependencies
                    });
                    setIsTaskModalOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkflowManagement;
