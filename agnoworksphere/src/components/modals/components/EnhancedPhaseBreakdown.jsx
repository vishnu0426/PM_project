import React, { useState } from 'react';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';

const EnhancedPhaseBreakdown = ({ tasks, onPhaseUpdate, currentPhase = 1 }) => {
  const [expandedPhase, setExpandedPhase] = useState(currentPhase);

  const phases = [
    {
      id: 1,
      name: 'Configure',
      icon: 'Settings',
      color: 'blue',
      description: 'Project setup and configuration',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      tasks: tasks.filter(task => task.phase === 'setup' || task.phase === 'configuration'),
      features: [
        'Interactive project settings',
        'Technology stack selection',
        'Team configuration',
        'Budget and timeline setup'
      ]
    },
    {
      id: 2,
      name: 'Overview',
      icon: 'FileText',
      color: 'indigo',
      description: 'Project overview and documentation',
      gradient: 'from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50',
      tasks: tasks.filter(task => task.phase === 'planning' || task.phase === 'documentation'),
      features: [
        'Rich text project description',
        'Goals and objectives',
        'KPIs and success metrics',
        'Stakeholder requirements'
      ]
    },
    {
      id: 3,
      name: 'Tech Stack',
      icon: 'Code',
      color: 'purple',
      description: 'Technology selection and architecture',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      tasks: tasks.filter(task => task.phase === 'architecture' || task.phase === 'tech-setup'),
      features: [
        'Interactive tech stack builder',
        'Architecture diagrams',
        'Dependency management',
        'Performance considerations'
      ]
    },
    {
      id: 4,
      name: 'Workflows',
      icon: 'GitBranch',
      color: 'pink',
      description: 'Process flows and task dependencies',
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      tasks: tasks.filter(task => task.phase === 'workflow' || task.phase === 'process'),
      features: [
        'Visual workflow designer',
        'Drag-and-drop task sequencing',
        'Dependency mapping',
        'Milestone tracking'
      ]
    },
    {
      id: 5,
      name: 'Tasks',
      icon: 'CheckSquare',
      color: 'green',
      description: 'Task management and execution',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      tasks: tasks.filter(task => !['setup', 'configuration', 'planning', 'documentation', 'architecture', 'tech-setup', 'workflow', 'process'].includes(task.phase)),
      features: [
        'Dynamic task generation',
        'Priority management',
        'Progress tracking',
        'Team collaboration'
      ]
    }
  ];

  const getPhaseProgress = (phase) => {
    const phaseTasks = phase.tasks;
    if (phaseTasks.length === 0) return 0;
    const completedTasks = phaseTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / phaseTasks.length) * 100);
  };

  const getPhaseStatus = (phaseId) => {
    if (phaseId < currentPhase) return 'completed';
    if (phaseId === currentPhase) return 'active';
    return 'upcoming';
  };

  const PhaseCard = ({ phase, index }) => {
    const progress = getPhaseProgress(phase);
    const status = getPhaseStatus(phase.id);
    const isExpanded = expandedPhase === phase.id;

    return (
      <div className={`
        relative group transition-all duration-500 transform hover:scale-105
        ${isExpanded ? 'col-span-2 row-span-2' : ''}
      `}>
        {/* Main Phase Card */}
        <div className={`
          relative overflow-hidden rounded-3xl border-2 transition-all duration-300 cursor-pointer
          ${status === 'completed' 
            ? `border-${phase.color}-400 bg-gradient-to-br ${phase.bgGradient} shadow-lg shadow-${phase.color}-200` 
            : status === 'active'
              ? `border-${phase.color}-500 bg-gradient-to-br ${phase.bgGradient} shadow-xl shadow-${phase.color}-300 ring-4 ring-${phase.color}-100`
              : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-gray-300'
          }
        `}
        onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${phase.gradient} rounded-full`}></div>
            <div className={`absolute bottom-8 left-8 w-8 h-8 bg-gradient-to-br ${phase.gradient} rounded-full`}></div>
            <div className={`absolute top-12 left-12 w-4 h-4 bg-gradient-to-br ${phase.gradient} rounded-full`}></div>
          </div>

          <div className="relative p-6">
            {/* Phase Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Phase Icon */}
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                  ${status === 'completed' || status === 'active'
                    ? `bg-gradient-to-br ${phase.gradient} text-white`
                    : 'bg-white text-gray-400 border border-gray-200'
                  }
                `}>
                  <Icon name={phase.icon} size={24} />
                </div>

                <div>
                  <h3 className={`text-xl font-bold ${
                    status === 'completed' || status === 'active' ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    Phase {phase.id}: {phase.name}
                  </h3>
                  <p className={`text-sm ${
                    status === 'completed' || status === 'active' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {phase.description}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`
                px-3 py-1 rounded-full text-xs font-medium border
                ${status === 'completed' 
                  ? `bg-green-100 text-green-700 border-green-200`
                  : status === 'active'
                    ? `bg-${phase.color}-100 text-${phase.color}-700 border-${phase.color}-200`
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }
              `}>
                {status === 'completed' && <Icon name="Check" size={12} className="inline mr-1" />}
                {status === 'active' && <Icon name="Play" size={12} className="inline mr-1" />}
                {status === 'upcoming' && <Icon name="Clock" size={12} className="inline mr-1" />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${phase.gradient} relative`}
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Task Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="List" size={14} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {phase.tasks.length} task{phase.tasks.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200" 
              />
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-in slide-in-from-top duration-300">
                {/* Features List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Key Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {phase.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon name="Check" size={12} className={`text-${phase.color}-500`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Tasks */}
                {phase.tasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Recent Tasks</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {phase.tasks.slice(0, 3).map((task, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full bg-${phase.color}-500`}></div>
                          <span className="text-sm text-gray-700 truncate">{task.title}</span>
                          <span className="text-xs text-gray-500 ml-auto">{task.estimated_hours}h</span>
                        </div>
                      ))}
                      {phase.tasks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{phase.tasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className={`bg-gradient-to-r ${phase.gradient} text-white hover:shadow-lg transition-all duration-200`}
                    iconName="Play"
                  >
                    Start Phase
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    iconName="Settings"
                    className="border-gray-300 hover:border-gray-400"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Phase Overview Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          5-Phase Project Breakdown
        </h2>
        <p className="text-gray-600">
          Interactive project phases with detailed workflows and task management
        </p>
      </div>

      {/* Phase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {phases.map((phase, index) => (
          <PhaseCard key={phase.id} phase={phase} index={index} />
        ))}
      </div>

      {/* Phase Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setExpandedPhase(phase.id)}
              className={`
                w-3 h-3 rounded-full transition-all duration-200
                ${expandedPhase === phase.id 
                  ? `bg-gradient-to-r ${phase.gradient} scale-125` 
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPhaseBreakdown;
