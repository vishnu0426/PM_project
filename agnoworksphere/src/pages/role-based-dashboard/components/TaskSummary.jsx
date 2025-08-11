import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskSummary = ({ tasks, userRole }) => {
  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-muted text-text-secondary',
      'In Progress': 'bg-accent text-accent-foreground',
      'Review': 'bg-warning text-warning-foreground',
      'Done': 'bg-success text-success-foreground',
      'Blocked': 'bg-error text-error-foreground'
    };
    return colors[status] || 'bg-muted text-text-secondary';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'High': 'AlertTriangle',
      'Medium': 'Minus',
      'Low': 'ArrowDown'
    };
    return icons[priority] || 'Minus';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-error',
      'Medium': 'text-warning',
      'Low': 'text-success'
    };
    return colors[priority] || 'text-text-secondary';
  };

  const canEditTasks = userRole === 'Owner' || userRole === 'Admin' || userRole === 'Member';

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'Done').length,
    inProgress: tasks.filter(task => task.status === 'In Progress').length,
    overdue: tasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'Done').length
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">
          Task Summary
        </h3>
        {canEditTasks && (
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            Add Task
          </Button>
        )}
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-semibold text-text-primary">
            {taskStats.total}
          </div>
          <div className="text-xs text-text-secondary">Total Tasks</div>
        </div>
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-2xl font-semibold text-success">
            {taskStats.completed}
          </div>
          <div className="text-xs text-text-secondary">Completed</div>
        </div>
        <div className="text-center p-3 bg-accent/10 rounded-lg">
          <div className="text-2xl font-semibold text-accent">
            {taskStats.inProgress}
          </div>
          <div className="text-xs text-text-secondary">In Progress</div>
        </div>
        <div className="text-center p-3 bg-error/10 rounded-lg">
          <div className="text-2xl font-semibold text-error">
            {taskStats.overdue}
          </div>
          <div className="text-xs text-text-secondary">Overdue</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary mb-3">
          Recent Tasks
        </h4>
        
        {tasks.slice(0, 5).map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-150">
            <div className="flex-shrink-0">
              <Icon 
                name={getPriorityIcon(task.priority)} 
                size={16} 
                className={getPriorityColor(task.priority)} 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="text-sm font-medium text-text-primary truncate">
                  {task.title}
                </h5>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={12} />
                  <span>Due {task.dueDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="User" size={12} />
                  <span>{task.assignee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Folder" size={12} />
                  <span>{task.project}</span>
                </div>
              </div>
            </div>

            {canEditTasks && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" iconName="Edit" />
                <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckSquare" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary mb-2">No tasks found</p>
          {canEditTasks && (
            <Button variant="outline" iconName="Plus" iconPosition="left">
              Create your first task
            </Button>
          )}
        </div>
      )}

      {tasks.length > 5 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" className="w-full" iconName="ArrowRight" iconPosition="right">
            View All Tasks ({tasks.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskSummary;