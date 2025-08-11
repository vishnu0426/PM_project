import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';

const SmartSuggestions = ({ tasks, onApplySuggestion, onDismiss }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  useEffect(() => {
    generateSuggestions();
  }, [tasks]);

  const generateSuggestions = () => {
    const newSuggestions = [];

    // Check for unassigned tasks
    const unassignedTasks = tasks.filter(task => !task.assignee_role);
    if (unassignedTasks.length > 0) {
      newSuggestions.push({
        id: 'assign-tasks',
        type: 'warning',
        title: 'Unassigned Tasks Detected',
        description: `${unassignedTasks.length} tasks need to be assigned to team members`,
        action: 'Auto-assign based on workload',
        icon: 'UserX',
        color: 'orange',
        priority: 'high',
        autoFix: () => autoAssignTasks(unassignedTasks)
      });
    }

    // Check for overloaded team members
    const workloadAnalysis = analyzeWorkload();
    if (workloadAnalysis.overloaded.length > 0) {
      newSuggestions.push({
        id: 'balance-workload',
        type: 'error',
        title: 'Team Members Overloaded',
        description: `${workloadAnalysis.overloaded.join(', ')} have too many hours assigned`,
        action: 'Redistribute tasks',
        icon: 'AlertTriangle',
        color: 'red',
        priority: 'urgent',
        autoFix: () => redistributeTasks(workloadAnalysis)
      });
    }

    // Check for missing dependencies
    const dependencyIssues = findDependencyIssues();
    if (dependencyIssues.length > 0) {
      newSuggestions.push({
        id: 'fix-dependencies',
        type: 'warning',
        title: 'Missing Dependencies Detected',
        description: `${dependencyIssues.length} tasks may need additional dependencies`,
        action: 'Review and add dependencies',
        icon: 'Link',
        color: 'blue',
        priority: 'medium',
        details: dependencyIssues
      });
    }

    // Check for large tasks that should be split
    const largeTasks = tasks.filter(task => (task.estimated_hours || 0) > 16);
    if (largeTasks.length > 0) {
      newSuggestions.push({
        id: 'split-large-tasks',
        type: 'info',
        title: 'Large Tasks Detected',
        description: `${largeTasks.length} tasks are estimated over 16 hours`,
        action: 'Suggest task splitting',
        icon: 'Scissors',
        color: 'purple',
        priority: 'low',
        autoFix: () => suggestTaskSplitting(largeTasks)
      });
    }

    // Check for timeline optimization
    const timelineOptimization = analyzeTimeline();
    if (timelineOptimization.canOptimize) {
      newSuggestions.push({
        id: 'optimize-timeline',
        type: 'info',
        title: 'Timeline Can Be Optimized',
        description: `Project could be completed ${timelineOptimization.daysSaved} days earlier`,
        action: 'Optimize task scheduling',
        icon: 'Clock',
        color: 'green',
        priority: 'medium',
        autoFix: () => optimizeTimeline(timelineOptimization)
      });
    }

    // Check for skill mismatches
    const skillMismatches = findSkillMismatches();
    if (skillMismatches.length > 0) {
      newSuggestions.push({
        id: 'fix-skill-mismatches',
        type: 'warning',
        title: 'Skill Mismatches Found',
        description: `${skillMismatches.length} tasks may be assigned to wrong roles`,
        action: 'Reassign based on skills',
        icon: 'Target',
        color: 'yellow',
        priority: 'medium',
        details: skillMismatches
      });
    }

    setSuggestions(newSuggestions.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  };

  const analyzeWorkload = () => {
    const workload = {};
    const overloaded = [];
    const underutilized = [];

    tasks.forEach(task => {
      if (task.assignee_role) {
        if (!workload[task.assignee_role]) {
          workload[task.assignee_role] = 0;
        }
        workload[task.assignee_role] += task.estimated_hours || 0;
      }
    });

    Object.entries(workload).forEach(([assignee, hours]) => {
      if (hours > 80) overloaded.push(assignee);
      if (hours < 20) underutilized.push(assignee);
    });

    return { workload, overloaded, underutilized };
  };

  const findDependencyIssues = () => {
    const issues = [];
    
    tasks.forEach(task => {
      // Check if frontend tasks depend on backend tasks
      if (task.title.toLowerCase().includes('frontend') || task.title.toLowerCase().includes('ui')) {
        const hasBackendDep = task.dependencies?.some(depId => {
          const depTask = tasks.find(t => t.id === depId);
          return depTask && (depTask.title.toLowerCase().includes('backend') || depTask.title.toLowerCase().includes('api'));
        });
        
        if (!hasBackendDep) {
          const backendTasks = tasks.filter(t => 
            t.title.toLowerCase().includes('backend') || t.title.toLowerCase().includes('api')
          );
          if (backendTasks.length > 0) {
            issues.push({
              taskId: task.id,
              taskTitle: task.title,
              suggestion: 'Consider adding backend/API dependencies',
              suggestedDependencies: backendTasks.slice(0, 2).map(t => t.id)
            });
          }
        }
      }
    });

    return issues;
  };

  const analyzeTimeline = () => {
    // Simple timeline analysis
    const totalHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    const parallelizableHours = tasks.filter(task => 
      !task.dependencies || task.dependencies.length === 0
    ).reduce((sum, task) => sum + (task.estimated_hours || 0), 0);

    const currentDays = Math.ceil(totalHours / 8);
    const optimizedDays = Math.ceil((totalHours - parallelizableHours * 0.3) / 8);
    const daysSaved = currentDays - optimizedDays;

    return {
      canOptimize: daysSaved > 2,
      daysSaved,
      currentDays,
      optimizedDays
    };
  };

  const findSkillMismatches = () => {
    const mismatches = [];
    
    tasks.forEach(task => {
      if (task.assignee_role) {
        // Simple skill matching logic
        const taskType = getTaskType(task.title);
        const roleType = getRoleType(task.assignee_role);
        
        if (taskType && roleType && taskType !== roleType) {
          mismatches.push({
            taskId: task.id,
            taskTitle: task.title,
            currentAssignee: task.assignee_role,
            taskType,
            roleType,
            suggestedRole: getSuggestedRole(taskType)
          });
        }
      }
    });

    return mismatches;
  };

  const getTaskType = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) return 'design';
    if (lowerTitle.includes('backend') || lowerTitle.includes('api') || lowerTitle.includes('server')) return 'backend';
    if (lowerTitle.includes('frontend') || lowerTitle.includes('react') || lowerTitle.includes('component')) return 'frontend';
    if (lowerTitle.includes('test') || lowerTitle.includes('qa')) return 'testing';
    if (lowerTitle.includes('deploy') || lowerTitle.includes('devops')) return 'devops';
    return null;
  };

  const getRoleType = (role) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('designer')) return 'design';
    if (lowerRole.includes('backend') || lowerRole.includes('server')) return 'backend';
    if (lowerRole.includes('frontend') || lowerRole.includes('react')) return 'frontend';
    if (lowerRole.includes('qa') || lowerRole.includes('test')) return 'testing';
    if (lowerRole.includes('devops') || lowerRole.includes('deploy')) return 'devops';
    return 'general';
  };

  const getSuggestedRole = (taskType) => {
    const roleMap = {
      design: 'Designer',
      backend: 'Backend Developer',
      frontend: 'Frontend Developer',
      testing: 'QA Engineer',
      devops: 'DevOps Engineer'
    };
    return roleMap[taskType] || 'Developer';
  };

  const autoAssignTasks = (unassignedTasks) => {
    // Simple auto-assignment logic
    const workload = analyzeWorkload().workload;
    const availableAssignees = Object.keys(workload).sort((a, b) => workload[a] - workload[b]);
    
    const assignments = {};
    unassignedTasks.forEach((task, index) => {
      const assignee = availableAssignees[index % availableAssignees.length];
      assignments[task.id] = { assignee_role: assignee };
    });

    return assignments;
  };

  const redistributeTasks = (workloadAnalysis) => {
    // Redistribute tasks from overloaded to underutilized team members
    const redistributions = {};
    // Implementation would go here
    return redistributions;
  };

  const suggestTaskSplitting = (largeTasks) => {
    // Suggest how to split large tasks
    const suggestions = {};
    largeTasks.forEach(task => {
      suggestions[task.id] = {
        splitInto: Math.ceil((task.estimated_hours || 0) / 8),
        suggestedSplits: [
          `${task.title} - Phase 1`,
          `${task.title} - Phase 2`,
          `${task.title} - Phase 3`
        ].slice(0, Math.ceil((task.estimated_hours || 0) / 8))
      };
    });
    return suggestions;
  };

  const optimizeTimeline = (timelineOptimization) => {
    // Optimize task scheduling
    return {
      reorderedTasks: tasks.map(task => ({ ...task, optimized: true }))
    };
  };

  const handleApplySuggestion = async (suggestion) => {
    setActiveSuggestion(suggestion.id);
    
    try {
      let result;
      if (suggestion.autoFix) {
        result = suggestion.autoFix();
      }
      
      await onApplySuggestion(suggestion, result);
      
      // Remove applied suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    } finally {
      setActiveSuggestion(null);
    }
  };

  const getSuggestionColor = (type, color) => {
    const colors = {
      error: 'border-red-200 bg-red-50',
      warning: 'border-orange-200 bg-orange-50',
      info: 'border-blue-200 bg-blue-50'
    };
    return colors[type] || 'border-gray-200 bg-gray-50';
  };

  const getIconColor = (color) => {
    const colors = {
      red: 'text-red-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600'
    };
    return colors[color] || 'text-gray-600';
  };

  if (suggestions.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <Icon name="CheckCircle" size={16} />
          <span className="text-sm font-medium">All Good!</span>
        </div>
        <p className="text-sm text-green-600 mt-1">
          No issues detected. Your project setup looks optimal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Icon name="Lightbulb" size={16} />
          Smart Suggestions ({suggestions.length})
        </h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          iconName="X"
          className="text-gray-500"
        />
      </div>

      {suggestions.map(suggestion => (
        <div
          key={suggestion.id}
          className={`p-3 border rounded-lg ${getSuggestionColor(suggestion.type)}`}
        >
          <div className="flex items-start gap-3">
            <Icon 
              name={suggestion.icon} 
              size={16} 
              className={`mt-0.5 ${getIconColor(suggestion.color)}`} 
            />
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-gray-900">{suggestion.title}</h5>
              <p className="text-sm text-gray-700 mt-1">{suggestion.description}</p>
              
              {suggestion.details && (
                <div className="mt-2 text-xs text-gray-600">
                  <details>
                    <summary className="cursor-pointer hover:text-gray-800">View details</summary>
                    <div className="mt-1 space-y-1">
                      {suggestion.details.map((detail, index) => (
                        <div key={index} className="pl-2 border-l-2 border-gray-300">
                          {detail.taskTitle}: {detail.suggestion}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {suggestion.autoFix && (
                <Button
                  size="sm"
                  onClick={() => handleApplySuggestion(suggestion)}
                  disabled={activeSuggestion === suggestion.id}
                  iconName={activeSuggestion === suggestion.id ? "Loader2" : "Wand2"}
                  className={`text-xs ${activeSuggestion === suggestion.id ? 'animate-spin' : ''}`}
                >
                  {activeSuggestion === suggestion.id ? 'Applying...' : 'Auto-fix'}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                iconName="X"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartSuggestions;
