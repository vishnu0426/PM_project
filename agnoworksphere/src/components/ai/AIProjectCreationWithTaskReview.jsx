import React, { useState, useCallback } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import AITaskReviewModal from '../modals/AITaskReviewModal';

const AIProjectCreationWithTaskReview = ({ 
  organizationId, 
  organizationMembers, 
  onProjectCreated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTaskReview, setShowTaskReview] = useState(false);
  const [generatedProject, setGeneratedProject] = useState(null);
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState([]);
  const [projectForm, setProjectForm] = useState({
    name: '',
    type: 'web-application',
    teamSize: 5,
    experienceLevel: 'intermediate',
    timeline: 'flexible',
    features: []
  });

  const projectTypes = [
    {
      id: 'web-application',
      name: 'Web Application',
      icon: 'Globe',
      description: 'Full-stack web development project',
      templates: ['e-commerce', 'saas', 'portfolio', 'blog']
    },
    {
      id: 'mobile-app',
      name: 'Mobile Application',
      icon: 'Smartphone',
      description: 'iOS/Android mobile application',
      templates: ['social', 'productivity', 'gaming', 'utility']
    },
    {
      id: 'api-service',
      name: 'API Service',
      icon: 'Server',
      description: 'Backend API and microservices',
      templates: ['rest-api', 'graphql', 'microservices', 'serverless']
    },
    {
      id: 'data-project',
      name: 'Data Project',
      icon: 'Database',
      description: 'Data analysis and machine learning',
      templates: ['analytics', 'ml-model', 'etl-pipeline', 'dashboard']
    }
  ];

  const handleGenerateProject = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI project generation
      const projectData = await generateAIProject(projectForm);
      const tasks = await generateAITasks(projectData);
      
      setGeneratedProject(projectData);
      setAiGeneratedTasks(tasks);
      setShowTaskReview(true);
    } catch (error) {
      console.error('Failed to generate project:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIProject = async (formData) => {
    // Simulate API call to AI service
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: `project-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      description: `AI-generated ${formData.type} project with comprehensive task breakdown`,
      organizationId: organizationId,
      createdAt: new Date().toISOString(),
      estimatedDuration: calculateEstimatedDuration(formData),
      teamConfiguration: {
        size: formData.teamSize,
        experienceLevel: formData.experienceLevel,
        roles: generateTeamRoles(formData)
      },
      workflow: generateWorkflow(formData),
      budget: calculateEstimatedBudget(formData)
    };
  };

  const generateAITasks = async (projectData) => {
    // Simulate AI task generation based on project type and requirements
    const baseTasks = getBaseTasksForProjectType(projectData.type);
    
    return baseTasks.map((task, index) => ({
      id: `task-${index + 1}`,
      title: task.title,
      description: task.description,
      phase: task.phase,
      priority: task.priority,
      estimated_hours: task.estimated_hours,
      story_points: task.story_points,
      assignee_role: null, // Will be assigned in review modal
      dependencies: task.dependencies || [],
      tags: task.tags || [],
      checklist: task.checklist || [],
      acceptance_criteria: task.acceptance_criteria || [],
      isModified: false,
      isNew: false
    }));
  };

  const getBaseTasksForProjectType = (type) => {
    const taskTemplates = {
      'web-application': [
        {
          title: 'Project Setup and Configuration',
          description: 'Initialize project structure, configure build tools, and set up development environment',
          phase: 'setup',
          priority: 'high',
          estimated_hours: 8,
          story_points: 5,
          tags: ['setup', 'configuration'],
          checklist: [
            { title: 'Create project repository', completed: false },
            { title: 'Set up build configuration', completed: false },
            { title: 'Configure development environment', completed: false }
          ]
        },
        {
          title: 'Database Design and Setup',
          description: 'Design database schema, set up database server, and create initial migrations',
          phase: 'backend',
          priority: 'high',
          estimated_hours: 12,
          story_points: 8,
          tags: ['database', 'backend'],
          dependencies: ['task-1']
        },
        {
          title: 'User Authentication System',
          description: 'Implement user registration, login, logout, and password reset functionality',
          phase: 'backend',
          priority: 'high',
          estimated_hours: 16,
          story_points: 13,
          tags: ['authentication', 'security', 'backend'],
          dependencies: ['task-2']
        },
        {
          title: 'API Endpoints Development',
          description: 'Create RESTful API endpoints for core application functionality',
          phase: 'backend',
          priority: 'medium',
          estimated_hours: 20,
          story_points: 13,
          tags: ['api', 'backend'],
          dependencies: ['task-2', 'task-3']
        },
        {
          title: 'Frontend Component Library',
          description: 'Build reusable UI components and establish design system',
          phase: 'frontend',
          priority: 'medium',
          estimated_hours: 14,
          story_points: 8,
          tags: ['frontend', 'ui', 'components']
        },
        {
          title: 'User Interface Implementation',
          description: 'Implement main user interface screens and navigation',
          phase: 'frontend',
          priority: 'medium',
          estimated_hours: 24,
          story_points: 21,
          tags: ['frontend', 'ui'],
          dependencies: ['task-5']
        },
        {
          title: 'API Integration',
          description: 'Connect frontend with backend APIs and handle data flow',
          phase: 'integration',
          priority: 'medium',
          estimated_hours: 10,
          story_points: 8,
          tags: ['integration', 'api'],
          dependencies: ['task-4', 'task-6']
        },
        {
          title: 'Testing Implementation',
          description: 'Write unit tests, integration tests, and end-to-end tests',
          phase: 'testing',
          priority: 'medium',
          estimated_hours: 16,
          story_points: 13,
          tags: ['testing', 'quality'],
          dependencies: ['task-7']
        },
        {
          title: 'Performance Optimization',
          description: 'Optimize application performance, implement caching, and improve load times',
          phase: 'optimization',
          priority: 'low',
          estimated_hours: 12,
          story_points: 8,
          tags: ['performance', 'optimization'],
          dependencies: ['task-8']
        },
        {
          title: 'Deployment and DevOps',
          description: 'Set up CI/CD pipeline, configure production environment, and deploy application',
          phase: 'deployment',
          priority: 'high',
          estimated_hours: 10,
          story_points: 8,
          tags: ['deployment', 'devops'],
          dependencies: ['task-9']
        }
      ],
      'mobile-app': [
        // Mobile app specific tasks would go here
      ],
      'api-service': [
        // API service specific tasks would go here
      ],
      'data-project': [
        // Data project specific tasks would go here
      ]
    };

    return taskTemplates[type] || taskTemplates['web-application'];
  };

  const calculateEstimatedDuration = (formData) => {
    const baseHours = {
      'web-application': 120,
      'mobile-app': 100,
      'api-service': 80,
      'data-project': 90
    };

    const experienceMultiplier = {
      'beginner': 1.5,
      'intermediate': 1.0,
      'advanced': 0.8
    };

    const teamSizeMultiplier = Math.max(0.5, 1 - (formData.teamSize - 3) * 0.1);

    const totalHours = baseHours[formData.type] * 
                      experienceMultiplier[formData.experienceLevel] * 
                      teamSizeMultiplier;

    return {
      total_hours: Math.round(totalHours),
      total_duration_days: Math.ceil(totalHours / 8),
      total_duration_weeks: Math.ceil(totalHours / 40)
    };
  };

  const generateTeamRoles = (formData) => {
    const roleTemplates = {
      'web-application': ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'DevOps Engineer', 'QA Engineer'],
      'mobile-app': ['Mobile Developer', 'UI/UX Designer', 'Backend Developer', 'QA Engineer'],
      'api-service': ['Backend Developer', 'DevOps Engineer', 'Database Administrator', 'QA Engineer'],
      'data-project': ['Data Scientist', 'Data Engineer', 'Backend Developer', 'DevOps Engineer']
    };

    return roleTemplates[formData.type] || roleTemplates['web-application'];
  };

  const generateWorkflow = (formData) => {
    return {
      methodology: 'agile',
      sprint_duration: 2, // weeks
      phases: ['setup', 'backend', 'frontend', 'integration', 'testing', 'optimization', 'deployment'],
      milestones: [
        { name: 'Project Setup Complete', phase: 'setup', week: 1 },
        { name: 'Backend MVP Ready', phase: 'backend', week: 4 },
        { name: 'Frontend MVP Ready', phase: 'frontend', week: 6 },
        { name: 'Integration Complete', phase: 'integration', week: 8 },
        { name: 'Testing Complete', phase: 'testing', week: 10 },
        { name: 'Production Ready', phase: 'deployment', week: 12 }
      ]
    };
  };

  const calculateEstimatedBudget = (formData) => {
    const hourlyRates = {
      'Frontend Developer': 75,
      'Backend Developer': 80,
      'UI/UX Designer': 70,
      'DevOps Engineer': 85,
      'QA Engineer': 65,
      'Mobile Developer': 80,
      'Data Scientist': 90,
      'Data Engineer': 85,
      'Database Administrator': 75
    };

    const duration = calculateEstimatedDuration(formData);
    const roles = generateTeamRoles(formData);
    
    const totalCost = roles.reduce((sum, role) => {
      return sum + (hourlyRates[role] || 75) * (duration.total_hours / roles.length);
    }, 0);

    return {
      estimated_cost: Math.round(totalCost),
      cost_breakdown: roles.map(role => ({
        role,
        hourly_rate: hourlyRates[role] || 75,
        estimated_hours: Math.round(duration.total_hours / roles.length),
        total_cost: Math.round((hourlyRates[role] || 75) * (duration.total_hours / roles.length))
      }))
    };
  };

  const handleTaskReviewComplete = async (finalizedData) => {
    try {
      // Create the project with finalized tasks
      const projectWithTasks = {
        ...finalizedData.projectData,
        tasks: finalizedData.tasks,
        workflow: finalizedData.workflow,
        modifications: finalizedData.modifications
      };

      // Save to database
      await saveProjectToDatabase(projectWithTasks);
      
      // Create Kanban board with tasks
      await createKanbanBoard(projectWithTasks);
      
      // Notify parent component
      onProjectCreated(projectWithTasks);
      
      // Reset state
      setShowTaskReview(false);
      setGeneratedProject(null);
      setAiGeneratedTasks([]);
      setProjectForm({
        name: '',
        type: 'web-application',
        teamSize: 5,
        experienceLevel: 'intermediate',
        timeline: 'flexible',
        features: []
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const saveProjectToDatabase = async (projectData) => {
    // Implementation for saving to database
    console.log('Saving project to database:', projectData);
  };

  const createKanbanBoard = async (projectData) => {
    // Implementation for creating Kanban board
    console.log('Creating Kanban board:', projectData);
  };

  return (
    <div className="space-y-6">
      {/* Project Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Project Creation</h2>
        
        {/* Project Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
          <input
            type="text"
            value={projectForm.name}
            onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your project name..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Project Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectTypes.map(type => (
              <div
                key={type.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  projectForm.type === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setProjectForm(prev => ({ ...prev, type: type.id }))}
              >
                <div className="flex items-center gap-3">
                  <Icon name={type.icon} size={20} className="text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateProject}
          disabled={!projectForm.name || isGenerating}
          iconName={isGenerating ? "Loader2" : "Sparkles"}
          className={`w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white ${
            isGenerating ? 'animate-spin' : ''
          }`}
        >
          {isGenerating ? 'Generating AI Project...' : 'Generate AI Project'}
        </Button>
      </div>

      {/* AI Task Review Modal */}
      <AITaskReviewModal
        isOpen={showTaskReview}
        onClose={() => setShowTaskReview(false)}
        onFinalize={handleTaskReviewComplete}
        projectData={generatedProject}
        aiGeneratedTasks={aiGeneratedTasks}
        workflow={generatedProject?.workflow}
        organizationId={organizationId}
        organizationMembers={organizationMembers}
      />
    </div>
  );
};

export default AIProjectCreationWithTaskReview;
