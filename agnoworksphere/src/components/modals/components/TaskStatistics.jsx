import React from 'react';
import Icon from '../../AppIcon';

const TaskStatistics = ({ tasks }) => {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const notStartedTasks = tasks.filter(task => !task.status || task.status === 'not_started').length;
  
  const totalHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
  const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
  
  // Priority breakdown
  const priorityBreakdown = {
    urgent: tasks.filter(task => task.priority === 'urgent').length,
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length
  };

  // Phase breakdown
  const phaseBreakdown = tasks.reduce((acc, task) => {
    const phase = task.phase || 'Unassigned';
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {});

  // Assignee breakdown
  const assigneeBreakdown = tasks.reduce((acc, task) => {
    const assignee = task.assignee_role || 'Unassigned';
    acc[assignee] = (acc[assignee] || 0) + 1;
    return acc;
  }, {});

  // Modified tasks count
  const modifiedTasks = tasks.filter(task => task.isModified).length;
  const newTasks = tasks.filter(task => task.isNew).length;

  // Calculate estimated timeline
  const estimatedDays = Math.ceil(totalHours / 8); // Assuming 8 hours per day
  const estimatedWeeks = Math.ceil(estimatedDays / 5); // Assuming 5 working days per week

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="group relative bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 transform hover:scale-105">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5 overflow-hidden rounded-tr-2xl">
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full"></div>
      </div>

      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {value}
            </p>
            {trend && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                trend > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon name={icon} size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, current, total, color, icon }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon && <Icon name={icon} size={14} className="text-gray-500" />}
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{current}</span>
            <span className="text-xs text-gray-500">of {total}</span>
          </div>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${color} relative`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon="List"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`${modifiedTasks} modified`}
          trend={modifiedTasks > 0 ? 15 : 0}
        />
        <StatCard
          title="Total Hours"
          value={totalHours}
          icon="Clock"
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          subtitle={`~${estimatedDays} days`}
          trend={-5}
        />
        <StatCard
          title="Story Points"
          value={totalStoryPoints}
          icon="Target"
          color="bg-gradient-to-br from-purple-500 to-indigo-600"
          subtitle={`Avg: ${Math.round(totalStoryPoints / totalTasks || 0)}`}
          trend={8}
        />
        <StatCard
          title="Timeline"
          value={`${estimatedWeeks}w`}
          icon="Calendar"
          color="bg-gradient-to-br from-orange-500 to-red-500"
          subtitle={`${estimatedDays} days`}
          trend={-12}
        />
      </div>

      {/* Task Status Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Task Progress</h4>
        <div className="space-y-3">
          <ProgressBar
            label="Completed"
            current={completedTasks}
            total={totalTasks}
            color="bg-green-500"
          />
          <ProgressBar
            label="In Progress"
            current={inProgressTasks}
            total={totalTasks}
            color="bg-blue-500"
          />
          <ProgressBar
            label="Not Started"
            current={notStartedTasks}
            total={totalTasks}
            color="bg-gray-400"
          />
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Priority Distribution</h4>
        <div className="space-y-2">
          {Object.entries(priorityBreakdown).map(([priority, count]) => {
            if (count === 0) return null;
            const colors = {
              urgent: 'text-red-600 bg-red-50',
              high: 'text-orange-600 bg-orange-50',
              medium: 'text-yellow-600 bg-yellow-50',
              low: 'text-green-600 bg-green-50'
            };
            return (
              <div key={priority} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
                <span className="text-sm text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Phase Distribution</h4>
        <div className="space-y-2">
          {Object.entries(phaseBreakdown).map(([phase, count]) => (
            <div key={phase} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{phase}</span>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assignee Workload */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Workload Distribution</h4>
        <div className="space-y-2">
          {Object.entries(assigneeBreakdown).map(([assignee, count]) => {
            const assigneeTasks = tasks.filter(t => (t.assignee_role || 'Unassigned') === assignee);
            const assigneeHours = assigneeTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
            
            return (
              <div key={assignee} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{assignee}</span>
                  <span className="text-xs text-gray-500">{count} tasks</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{assigneeHours}h total</span>
                  <span className={`px-1 py-0.5 rounded ${
                    assigneeHours > 80 ? 'bg-red-100 text-red-700' :
                    assigneeHours > 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {assigneeHours > 80 ? 'Overloaded' :
                     assigneeHours > 40 ? 'Busy' : 'Available'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modifications Summary */}
      {(modifiedTasks > 0 || newTasks > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
            <Icon name="Edit" size={14} />
            Changes Made
          </h4>
          <div className="space-y-1 text-sm text-blue-700">
            {modifiedTasks > 0 && (
              <div>• {modifiedTasks} task{modifiedTasks !== 1 ? 's' : ''} modified</div>
            )}
            {newTasks > 0 && (
              <div>• {newTasks} new task{newTasks !== 1 ? 's' : ''} added</div>
            )}
          </div>
        </div>
      )}

      {/* Health Indicators */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Project Health</h4>
        <div className="space-y-2">
          {/* Unassigned Tasks Warning */}
          {assigneeBreakdown['Unassigned'] > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <Icon name="AlertTriangle" size={14} />
              <span className="text-xs">{assigneeBreakdown['Unassigned']} unassigned tasks</span>
            </div>
          )}
          
          {/* High Priority Tasks */}
          {(priorityBreakdown.urgent + priorityBreakdown.high) > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <Icon name="Flag" size={14} />
              <span className="text-xs">
                {priorityBreakdown.urgent + priorityBreakdown.high} high priority tasks
              </span>
            </div>
          )}
          
          {/* Overloaded Assignees */}
          {Object.entries(assigneeBreakdown).some(([assignee, count]) => {
            const assigneeTasks = tasks.filter(t => (t.assignee_role || 'Unassigned') === assignee);
            const assigneeHours = assigneeTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
            return assigneeHours > 80;
          }) && (
            <div className="flex items-center gap-2 text-red-600">
              <Icon name="Users" size={14} />
              <span className="text-xs">Some team members are overloaded</span>
            </div>
          )}
          
          {/* All Good */}
          {assigneeBreakdown['Unassigned'] === 0 && 
           (priorityBreakdown.urgent + priorityBreakdown.high) === 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <Icon name="CheckCircle" size={14} />
              <span className="text-xs">Project looks well-balanced</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskStatistics;
