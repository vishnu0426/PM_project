import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';
import Modal from '../ui/Modal';
import Icon from '../AppIcon';

const TaskChecklistSystem = ({ 
  onNext, 
  onBack, 
  initialData = {}, 
  className 
}) => {
  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      title: 'Set up development environment',
      description: 'Install necessary tools and configure development workspace',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-08-15',
      assignee: 'developer',
      category: 'setup',
      dependencies: [],
      subtasks: [
        { id: 'sub-1', title: 'Install Node.js and npm', completed: false },
        { id: 'sub-2', title: 'Set up Git repository', completed: false },
        { id: 'sub-3', title: 'Configure IDE/Editor', completed: false }
      ],
      estimatedHours: 4,
      actualHours: 0,
      tags: ['setup', 'development'],
      notes: ''
    },
    {
      id: 'task-2',
      title: 'Design database schema',
      description: 'Create comprehensive database design with relationships',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-08-20',
      assignee: 'architect',
      category: 'design',
      dependencies: ['task-1'],
      subtasks: [
        { id: 'sub-4', title: 'Identify entities and relationships', completed: false },
        { id: 'sub-5', title: 'Create ER diagram', completed: false },
        { id: 'sub-6', title: 'Define constraints and indexes', completed: false }
      ],
      estimatedHours: 8,
      actualHours: 0,
      tags: ['database', 'design'],
      notes: ''
    },
    {
      id: 'task-3',
      title: 'Implement user authentication',
      description: 'Build secure user login and registration system',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-08-25',
      assignee: 'backend-dev',
      category: 'development',
      dependencies: ['task-2'],
      subtasks: [
        { id: 'sub-7', title: 'Set up JWT authentication', completed: false },
        { id: 'sub-8', title: 'Create login/register endpoints', completed: false },
        { id: 'sub-9', title: 'Implement password hashing', completed: false },
        { id: 'sub-10', title: 'Add email verification', completed: false }
      ],
      estimatedHours: 12,
      actualHours: 0,
      tags: ['authentication', 'security'],
      notes: ''
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    category: 'all',
    search: ''
  });

  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent Priority' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'architect', label: 'Architect' },
    { value: 'backend-dev', label: 'Backend Developer' },
    { value: 'frontend-dev', label: 'Frontend Developer' },
    { value: 'qa', label: 'QA Engineer' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'setup', label: 'Setup' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployment', label: 'Deployment' }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'estimatedHours', label: 'Estimated Hours' }
  ];

  const priorityColors = {
    low: 'text-blue-600 bg-blue-50 border-blue-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    urgent: 'text-red-600 bg-red-50 border-red-200'
  };

  const statusColors = {
    pending: 'text-gray-600 bg-gray-50 border-gray-200',
    'in-progress': 'text-blue-600 bg-blue-50 border-blue-200',
    completed: 'text-green-600 bg-green-50 border-green-200',
    blocked: 'text-red-600 bg-red-50 border-red-200'
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (!showCompleted && task.status === 'completed') return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false;
      if (filters.category !== 'all' && task.category !== filters.category) return false;
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      }

      if (sortBy === 'dueDate') {
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const toggleTaskStatus = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      updateTask(taskId, { status: newStatus });
    }
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask =>
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        
        // Auto-update task status based on subtask completion
        const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;
        const totalSubtasks = updatedSubtasks.length;
        let newStatus = task.status;
        
        if (completedSubtasks === 0) {
          newStatus = 'pending';
        } else if (completedSubtasks === totalSubtasks) {
          newStatus = 'completed';
        } else {
          newStatus = 'in-progress';
        }
        
        return { ...task, subtasks: updatedSubtasks, status: newStatus };
      }
      return task;
    }));
  };

  const addNewTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
      assignee: 'developer',
      category: 'development',
      dependencies: [],
      subtasks: [],
      estimatedHours: 1,
      actualHours: 0,
      tags: [],
      notes: ''
    };
    
    setEditingTask(newTask);
    setIsTaskModalOpen(true);
  };

  const editTask = (task) => {
    setEditingTask({ ...task });
    setIsTaskModalOpen(true);
  };

  const saveTask = () => {
    if (editingTask) {
      if (tasks.find(t => t.id === editingTask.id)) {
        updateTask(editingTask.id, editingTask);
      } else {
        setTasks(prev => [...prev, editingTask]);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    }
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  };

  const bulkUpdateStatus = (status) => {
    selectedTasks.forEach(taskId => {
      updateTask(taskId, { status });
    });
    setSelectedTasks([]);
  };

  const getTaskProgress = (task) => {
    if (task.subtasks.length === 0) return task.status === 'completed' ? 100 : 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const isTaskBlocked = (task) => {
    return task.dependencies.some(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status !== 'completed';
    });
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return task.status !== 'completed' && dueDate < today;
    });
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = getOverdueTasks().length;
    
    return { total, completed, inProgress, overdue };
  };

  const stats = getTaskStats();

  const handleNext = () => {
    onNext?.(tasks);
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Task Checklist</h2>
        <p className="text-muted-foreground">
          Manage and track project tasks with advanced filtering and dependencies
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2">
            <Icon name="CheckSquare" className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2">
            <Icon name="Clock" className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Task Management</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addNewTask}
              iconName="Plus"
              iconPosition="left"
            >
              Add Task
            </Button>
            {selectedTasks.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateStatus('completed')}
                  iconName="Check"
                  iconPosition="left"
                >
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateStatus('in-progress')}
                  iconName="Play"
                  iconPosition="left"
                >
                  Start Progress
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="lg:col-span-2"
          />

          <Select
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            options={statusOptions}
          />

          <Select
            value={filters.priority}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            options={priorityOptions}
          />

          <Select
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
          />

          <Button
            variant="outline"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            iconName={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'}
            iconPosition="left"
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={showCompleted}
              onChange={setShowCompleted}
            />
            <span className="text-sm">Show completed tasks</span>
          </label>

          {selectedTasks.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedTasks.length} task(s) selected
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredAndSortedTasks.map((task) => {
          const progress = getTaskProgress(task);
          const blocked = isTaskBlocked(task);
          const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

          return (
            <div
              key={task.id}
              className={cn(
                "bg-card rounded-lg p-6 border border-border transition-all duration-200",
                "hover:shadow-md",
                blocked && "border-red-200 bg-red-50/50",
                isOverdue && "border-orange-200 bg-orange-50/50"
              )}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onChange={(checked) => {
                    if (checked) {
                      setSelectedTasks(prev => [...prev, task.id]);
                    } else {
                      setSelectedTasks(prev => prev.filter(id => id !== task.id));
                    }
                  }}
                />

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        priorityColors[task.priority]
                      )}>
                        {task.priority}
                      </span>

                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        statusColors[task.status]
                      )}>
                        {task.status}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editTask(task)}
                        iconName="Edit"
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        iconName="Trash2"
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtasks */}
                  {task.subtasks.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-foreground">Subtasks</h5>
                      <div className="space-y-1">
                        {task.subtasks.map((subtask) => (
                          <label key={subtask.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={subtask.completed}
                              onChange={() => toggleSubtask(task.id, subtask.id)}
                            />
                            <span className={cn(
                              subtask.completed && "line-through text-muted-foreground"
                            )}>
                              {subtask.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Task Details */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" className="h-4 w-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Icon name="User" className="h-4 w-4" />
                      <span>{task.assignee}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Icon name="Clock" className="h-4 w-4" />
                      <span>{task.estimatedHours}h estimated</span>
                    </div>

                    {task.dependencies.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Icon name="Link" className="h-4 w-4" />
                        <span>{task.dependencies.length} dependencies</span>
                      </div>
                    )}

                    {blocked && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Icon name="AlertTriangle" className="h-4 w-4" />
                        <span>Blocked</span>
                      </div>
                    )}

                    {isOverdue && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Icon name="Clock" className="h-4 w-4" />
                        <span>Overdue</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-12">
            <Icon name="CheckSquare" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or create a new task to get started.
            </p>
            <Button onClick={addNewTask} iconName="Plus" iconPosition="left">
              Add First Task
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Workflow
        </Button>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Step 5 of 6
          </div>
          <Button
            onClick={handleNext}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continue to Summary
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskChecklistSystem;
