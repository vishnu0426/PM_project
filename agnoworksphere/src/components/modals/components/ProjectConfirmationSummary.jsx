import React, { useState } from 'react';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';

const ProjectConfirmationSummary = ({ 
  projectData, 
  tasks, 
  workflow, 
  onConfirm, 
  onBack, 
  isLoading = false 
}) => {
  const [showDetails, setShowDetails] = useState({
    tasks: false,
    timeline: false,
    budget: false,
    team: false
  });

  const [confirmationChecks, setConfirmationChecks] = useState({
    reviewedTasks: false,
    approvedBudget: false,
    confirmedTimeline: false,
    teamAlignment: false
  });

  const totalHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
  const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
  const estimatedCost = projectData.budget?.estimated_cost || 0;
  const teamMembers = projectData.teamConfiguration?.roles?.length || 0;

  const handleConfirmationCheck = (key) => {
    setConfirmationChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allChecksCompleted = Object.values(confirmationChecks).every(check => check);

  const SummaryCard = ({ title, icon, color, children, detailKey }) => (
    <div className={`
      relative overflow-hidden bg-gradient-to-br from-white to-${color}-50/30 
      border border-${color}-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-${color}-100 
      transition-all duration-300 transform hover:scale-105
    `}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <div className={`absolute top-2 right-2 w-6 h-6 bg-${color}-500 rounded-full`}></div>
        <div className={`absolute top-6 right-6 w-3 h-3 bg-${color}-400 rounded-full`}></div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
              <Icon name={icon} size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          
          {detailKey && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(prev => ({ ...prev, [detailKey]: !prev[detailKey] }))}
              iconName={showDetails[detailKey] ? "ChevronUp" : "ChevronDown"}
              className={`text-${color}-600 hover:bg-${color}-50`}
            />
          )}
        </div>
        
        {children}
      </div>
    </div>
  );

  const ChecklistItem = ({ label, checked, onChange, description }) => (
    <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-gray-200 hover:bg-white/80 transition-colors duration-200">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`
          w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
          ${checked 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 shadow-lg shadow-green-200' 
            : 'border-gray-300 hover:border-green-400 bg-white'
          }
        `}>
          {checked && <Icon name="Check" size={14} className="text-white" />}
        </div>
      </label>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-200">
          <Icon name="CheckCircle" size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Project Summary & Confirmation
          </h1>
          <p className="text-gray-600 mt-2">
            Review your project configuration before finalizing
          </p>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="Briefcase" size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{projectData.name}</h2>
            <p className="text-gray-600">{projectData.description}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/70 rounded-2xl border border-white/50">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Tasks</div>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-2xl border border-white/50">
            <div className="text-2xl font-bold text-green-600">{totalHours}h</div>
            <div className="text-sm text-gray-600">Estimated</div>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-2xl border border-white/50">
            <div className="text-2xl font-bold text-purple-600">{totalStoryPoints}</div>
            <div className="text-sm text-gray-600">Story Points</div>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-2xl border border-white/50">
            <div className="text-2xl font-bold text-orange-600">{teamMembers}</div>
            <div className="text-sm text-gray-600">Team Members</div>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Summary */}
        <SummaryCard title="Tasks & Workflow" icon="List" color="blue" detailKey="tasks">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tasks</span>
              <span className="font-semibold text-gray-900">{tasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">High Priority</span>
              <span className="font-semibold text-orange-600">
                {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dependencies</span>
              <span className="font-semibold text-purple-600">
                {tasks.filter(t => t.dependencies?.length > 0).length}
              </span>
            </div>
            
            {showDetails.tasks && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 max-h-40 overflow-y-auto">
                {tasks.slice(0, 5).map((task, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-gray-700 truncate">{task.title}</span>
                    <span className="text-gray-500 ml-auto">{task.estimated_hours}h</span>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">+{tasks.length - 5} more tasks</div>
                )}
              </div>
            )}
          </div>
        </SummaryCard>

        {/* Timeline Summary */}
        <SummaryCard title="Timeline & Milestones" icon="Calendar" color="green" detailKey="timeline">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration</span>
              <span className="font-semibold text-gray-900">
                {workflow?.total_duration_weeks || 12} weeks
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phases</span>
              <span className="font-semibold text-green-600">
                {workflow?.phases?.length || 5}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Milestones</span>
              <span className="font-semibold text-purple-600">
                {workflow?.milestones?.length || 6}
              </span>
            </div>

            {showDetails.timeline && workflow?.milestones && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                {workflow.milestones.slice(0, 3).map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Icon name="Flag" size={12} className="text-green-500" />
                    <span className="text-gray-700">{milestone.name}</span>
                    <span className="text-gray-500 ml-auto">Week {milestone.week}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SummaryCard>

        {/* Budget Summary */}
        <SummaryCard title="Budget & Resources" icon="DollarSign" color="purple" detailKey="budget">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Cost</span>
              <span className="font-semibold text-gray-900">
                ${estimatedCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hourly Rate</span>
              <span className="font-semibold text-purple-600">
                ${Math.round(estimatedCost / totalHours) || 75}/hr
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Team Size</span>
              <span className="font-semibold text-green-600">{teamMembers} members</span>
            </div>
          </div>
        </SummaryCard>

        {/* Team Summary */}
        <SummaryCard title="Team Configuration" icon="Users" color="orange" detailKey="team">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Experience Level</span>
              <span className="font-semibold text-gray-900 capitalize">
                {projectData.teamConfiguration?.experienceLevel || 'Intermediate'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Methodology</span>
              <span className="font-semibold text-orange-600 capitalize">
                {workflow?.methodology || 'Agile'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sprint Duration</span>
              <span className="font-semibold text-purple-600">
                {workflow?.sprint_duration || 2} weeks
              </span>
            </div>

            {showDetails.team && projectData.teamConfiguration?.roles && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                {projectData.teamConfiguration.roles.map((role, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Icon name="User" size={12} className="text-orange-500" />
                    <span className="text-gray-700">{role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SummaryCard>
      </div>

      {/* Confirmation Checklist */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Icon name="CheckSquare" size={24} className="text-blue-600" />
          Final Confirmation Checklist
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChecklistItem
            label="Tasks Reviewed & Approved"
            description="All generated tasks have been reviewed and customized as needed"
            checked={confirmationChecks.reviewedTasks}
            onChange={() => handleConfirmationCheck('reviewedTasks')}
          />
          <ChecklistItem
            label="Budget Approved"
            description="Project budget and resource allocation has been approved"
            checked={confirmationChecks.approvedBudget}
            onChange={() => handleConfirmationCheck('approvedBudget')}
          />
          <ChecklistItem
            label="Timeline Confirmed"
            description="Project timeline and milestones are realistic and achievable"
            checked={confirmationChecks.confirmedTimeline}
            onChange={() => handleConfirmationCheck('confirmedTimeline')}
          />
          <ChecklistItem
            label="Team Alignment"
            description="Team members are aligned on project scope and responsibilities"
            checked={confirmationChecks.teamAlignment}
            onChange={() => handleConfirmationCheck('teamAlignment')}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          iconName="ArrowLeft"
          disabled={isLoading}
          className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          Back to Review
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={!allChecksCompleted || isLoading}
          iconName={isLoading ? "Loader2" : "Check"}
          className={`px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-200 ${
            isLoading ? 'animate-spin' : ''
          } ${!allChecksCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transform transition-all duration-200'}`}
        >
          {isLoading ? 'Creating Project...' : 'Finalize Project'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectConfirmationSummary;
