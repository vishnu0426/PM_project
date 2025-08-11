import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useDeferredValue,
} from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import CreateTaskModal from '../../../components/modals/CreateTaskModal';
// Lightweight memoized stat card to avoid re-renders when props are stable
const TaskStat = React.memo(function TaskStat({
  iconName,
  iconClass,
  label,
  value,
}) {
  return (
    <div className='bg-card rounded-lg border border-border p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-text-secondary'>{label}</p>
          <p className='text-2xl font-bold text-foreground'>{value}</p>
        </div>
        <Icon name={iconName} size={24} className={iconClass} />
      </div>
    </div>
  );
});

import apiService from '../../../utils/apiService';

const TasksTab = ({ project, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('dueDate');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Real tasks data - will be loaded from project
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tasks when component mounts or project changes (with debouncing)
  useEffect(() => {
    if (project) {
      // Add small delay to prevent rapid re-renders
      const timeoutId = setTimeout(() => {
        loadTasks();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [project?.id]); // Only depend on project ID to prevent unnecessary re-renders

  const loadTasks = async () => {
    try {
      setLoading(true);

      // Parse tasks from project data
      if (project.tasks) {
        const projectTasks =
          typeof project.tasks === 'string'
            ? JSON.parse(project.tasks)
            : project.tasks;

        // Transform project tasks to match the expected format
        const transformedTasks = projectTasks.map((task, index) => ({
          id: `task-${index + 1}`,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee: 'Unassigned', // Default assignee
          dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // Default due dates
          progress:
            task.status === 'completed'
              ? 100
              : task.status === 'in-progress'
              ? 50
              : 0,
          subtasks: task.subtasks || [],
          tags: [task.priority, project.name.split(' ')[0]],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        setTasks(transformedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      // Add small delay to prevent rapid state updates
      setTimeout(() => setLoading(false), 50);
    }
  };

  const handleTaskCreated = (newTaskData) => {
    // Create a new task object
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskData.title,
      description: newTaskData.description,
      status: 'pending',
      priority: newTaskData.priority || 'medium',
      assignee: newTaskData.assignee || 'Unassigned',
      dueDate:
        newTaskData.dueDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      progress: 0,
      subtasks: newTaskData.subtasks || [],
      tags: [newTaskData.priority || 'medium', project.name.split(' ')[0]],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    setIsCreateTaskModalOpen(false);

    // TODO: Update the project's tasks in the backend
    updateProjectTasks([...tasks, newTask]);
  };

  const calculateProjectProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;

    const completedTasks = tasks.filter(
      (task) => task.status === 'completed'
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const updateProjectTasks = async (updatedTasks) => {
    try {
      // Transform tasks back to project format
      const projectTasks = updatedTasks.map((task) => ({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        subtasks: task.subtasks || [],
      }));

      // Calculate new progress based on completed tasks
      const newProgress = calculateProjectProgress(updatedTasks);

      // Update project in backend
      const updatedProject = {
        ...project,
        tasks: JSON.stringify(projectTasks),
        progress: newProgress,
      };

      // Call API to update project
      const response = await apiService.projects.update(
        project.id,
        updatedProject
      );
      if (response) {
        console.log('Project tasks updated successfully');

        // Update localStorage
        localStorage.setItem('currentProject', JSON.stringify(updatedProject));

        // Emit project update event for other components
        window.dispatchEvent(
          new CustomEvent('projectUpdated', {
            detail: { project: updatedProject },
          })
        );
      }
    } catch (error) {
      console.error('Failed to update project tasks:', error);
      // Show error to user
      alert('Failed to save task changes. Please try again.');
    }
  };

  const handleAddTask = () => {
    setIsCreateTaskModalOpen(true);
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            progress:
              newStatus === 'completed'
                ? 100
                : newStatus === 'in-progress'
                ? 50
                : 0,
          }
        : task
    );
    setTasks(updatedTasks);
    await updateProjectTasks(updatedTasks);
  };

  const handleSubtaskToggle = async (taskId, subtaskIndex) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId && task.subtasks) {
        const updatedSubtasks = task.subtasks.map((subtask, index) =>
          index === subtaskIndex
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );

        // Update task progress based on completed subtasks
        const completedCount = updatedSubtasks.filter(
          (st) => st.completed
        ).length;
        const progress =
          updatedSubtasks.length > 0
            ? Math.round((completedCount / updatedSubtasks.length) * 100)
            : 0;

        // Update status based on progress
        let status = task.status;
        if (progress === 100) status = 'completed';
        else if (progress > 0) status = 'in-progress';
        else status = 'pending';

        return { ...task, subtasks: updatedSubtasks, progress, status };
      }
      return task;
    });

    setTasks(updatedTasks);
    await updateProjectTasks(updatedTasks);
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'title', label: 'Title' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'in-progress':
        return 'text-warning bg-warning/10';
      case 'todo':
        return 'text-text-secondary bg-muted';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredTasks = useMemo(() => {
    const term = (deferredSearchTerm || '').toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term);
      const matchesFilter =
        selectedFilter === 'all' || task.status === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, deferredSearchTerm, selectedFilter]);

  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...filteredTasks].sort((a, b) => {
      switch (selectedSort) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'assignee':
          return a.assignee.localeCompare(b.assignee);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [filteredTasks, selectedSort]);

  const handleTaskSelection = useCallback((taskId, checked) => {
    setSelectedTasks((prev) =>
      checked ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  }, []);

  const handleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        setSelectedTasks(sortedTasks.map((task) => task.id));
      } else {
        setSelectedTasks([]);
      }
    },
    [sortedTasks]
  );

  useEffect(() => {
    setShowBulkActions(selectedTasks.length > 0);
  }, [selectedTasks]);

  const handleBulkAction = useCallback(
    (action) => {
      console.log(`Performing ${action} on tasks:`, selectedTasks);
      setSelectedTasks([]);
      setShowBulkActions(false);
    },
    [selectedTasks]
  );

  const isOverdue = (dueDate) => {
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  // Memoized task counts
  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === 'completed').length,
    [tasks]
  );
  const inProgressCount = useMemo(
    () => tasks.filter((t) => t.status === 'in-progress').length,
    [tasks]
  );
  const overdueCount = useMemo(
    () =>
      tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'completed')
        .length,
    [tasks]
  );

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div className='flex flex-col sm:flex-row gap-4 flex-1'>
          <div className='flex-1 max-w-md'>
            <Input
              type='search'
              placeholder='Search tasks...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full'
            />
          </div>
          <div className='flex gap-2'>
            <Select
              options={filterOptions}
              value={selectedFilter}
              onChange={setSelectedFilter}
              placeholder='Filter by status'
              className='w-40'
            />
            <Select
              options={sortOptions}
              value={selectedSort}
              onChange={setSelectedSort}
              placeholder='Sort by'
              className='w-32'
            />
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' iconName='Filter' iconPosition='left'>
            More Filters
          </Button>
          <Button
            variant='default'
            iconName='Plus'
            iconPosition='left'
            onClick={handleAddTask}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className='bg-primary/10 border border-primary/20 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-foreground'>
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleBulkAction('assign')}
              >
                Assign
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleBulkAction('status')}
              >
                Change Status
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleBulkAction('priority')}
              >
                Set Priority
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className='bg-card rounded-lg border border-border overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-muted/50 border-b border-border'>
              <tr>
                <th className='text-left p-4 w-12'>
                  <Checkbox
                    checked={
                      selectedTasks.length === sortedTasks.length &&
                      sortedTasks.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    indeterminate={
                      selectedTasks.length > 0 &&
                      selectedTasks.length < sortedTasks.length
                    }
                  />
                </th>
                <th className='text-left p-4 font-medium text-foreground'>
                  Task
                </th>
                <th className='text-left p-4 font-medium text-foreground'>
                  Status
                </th>
                <th className='text-left p-4 font-medium text-foreground'>
                  Priority
                </th>
                <th className='text-left p-4 font-medium text-foreground'>
                  Assignee
                </th>
                <th className='text-left p-4 font-medium text-foreground'>
                  Due Date
                </th>
                <th className='text-left p-4 font-medium text-foreground'>
                  Progress
                </th>
                <th className='text-left p-4 font-medium text-foreground'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr
                  key={task.id}
                  className='border-b border-border hover:bg-muted/30 transition-colors'
                >
                  <td className='p-4'>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) =>
                        handleTaskSelection(task.id, e.target.checked)
                      }
                    />
                  </td>
                  <td className='p-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium text-foreground hover:text-primary cursor-pointer'>
                        {task.title}
                      </h4>
                      <p className='text-sm text-text-secondary line-clamp-2'>
                        {task.description}
                      </p>

                      {/* Subtasks */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className='space-y-1'>
                          <p className='text-xs text-text-secondary font-medium'>
                            Subtasks:
                          </p>
                          {task.subtasks.slice(0, 3).map((subtask, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 text-xs'
                            >
                              <Checkbox
                                checked={subtask.completed}
                                onChange={() =>
                                  handleSubtaskToggle(task.id, index)
                                }
                                size='sm'
                              />
                              <span
                                className={
                                  subtask.completed
                                    ? 'line-through text-text-secondary'
                                    : 'text-foreground'
                                }
                              >
                                {subtask.text}
                              </span>
                            </div>
                          ))}
                          {task.subtasks.length > 3 && (
                            <p className='text-xs text-text-secondary'>
                              +{task.subtasks.length - 3} more
                            </p>
                          )}
                        </div>
                      )}

                      <div className='flex items-center gap-2'>
                        {task.tags &&
                          task.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className='px-2 py-1 bg-muted rounded-full text-xs text-text-secondary'
                            >
                              {tag}
                            </span>
                          ))}
                        {task.tags && task.tags.length > 2 && (
                          <span className='text-xs text-text-secondary'>
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='p-4'>
                    <Select
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                      ]}
                      value={task.status}
                      onChange={(newStatus) =>
                        handleTaskStatusChange(task.id, newStatus)
                      }
                      className='w-32'
                    />
                  </td>
                  <td className='p-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <Icon name='User' size={16} className='text-primary' />
                      </div>
                      <span className='text-sm text-foreground'>
                        {task.assignee}
                      </span>
                    </div>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`text-sm ${
                          isOverdue(task.dueDate)
                            ? 'text-error font-medium'
                            : 'text-foreground'
                        }`}
                      >
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {isOverdue(task.dueDate) && (
                        <Icon
                          name='AlertTriangle'
                          size={14}
                          className='text-error'
                        />
                      )}
                    </div>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center gap-2'>
                      <div className='w-16 bg-muted rounded-full h-2'>
                        <div
                          className='bg-primary h-2 rounded-full transition-all duration-300'
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className='text-sm text-text-secondary'>
                        {task.progress}%
                      </span>
                    </div>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center gap-1'>
                      <Button variant='ghost' size='sm' iconName='Eye' />
                      <Button variant='ghost' size='sm' iconName='Edit' />
                      <Button
                        variant='ghost'
                        size='sm'
                        iconName='MoreHorizontal'
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <TaskStat
          iconName='CheckSquare'
          iconClass='text-primary'
          label='Total Tasks'
          value={tasks.length}
        />
        <TaskStat
          iconName='CheckCircle'
          iconClass='text-success'
          label='Completed'
          value={completedCount}
        />
        <TaskStat
          iconName='Clock'
          iconClass='text-warning'
          label='In Progress'
          value={inProgressCount}
        />
        <TaskStat
          iconName='AlertTriangle'
          iconClass='text-error'
          label='Overdue'
          value={overdueCount}
        />
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={project?.id}
        project={project}
      />
    </div>
  );
};

export default TasksTab;
