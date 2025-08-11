import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Icon from '../AppIcon';

const CreateAIProjectModal = ({ isOpen, onClose, onCreateAIProject, organizationId, organizationName }) => {
  const [formData, setFormData] = useState({
    name: '',
    projectType: 'general',
    teamSize: 5,
    teamExperience: 'intermediate'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [projectPreview, setProjectPreview] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const projectTypes = [
    { value: 'general', label: 'General Project', description: 'Standard project with flexible workflow', icon: 'Folder', color: 'bg-gray-500' },
    { value: 'web_application', label: 'Web Application', description: 'Full-stack web development project', icon: 'Globe', color: 'bg-blue-500' },
    { value: 'mobile_app', label: 'Mobile App', description: 'iOS/Android mobile application', icon: 'Smartphone', color: 'bg-green-500' },
    { value: 'ecommerce_platform', label: 'E-commerce Platform', description: 'Online marketplace with payment processing', icon: 'ShoppingCart', color: 'bg-purple-500' },
    { value: 'saas_application', label: 'SaaS Application', description: 'Multi-tenant cloud-based software', icon: 'Cloud', color: 'bg-indigo-500' },
    { value: 'devops_infrastructure', label: 'DevOps/Infrastructure', description: 'CI/CD pipelines and infrastructure automation', icon: 'Server', color: 'bg-orange-500' },
    { value: 'research_development', label: 'Research & Development', description: 'Scientific research and innovation project', icon: 'Microscope', color: 'bg-teal-500' },
    { value: 'event_management', label: 'Event Management', description: 'Comprehensive event planning and execution', icon: 'Calendar', color: 'bg-pink-500' },
    { value: 'data_analysis', label: 'Data Analysis', description: 'Data science and analytics project', icon: 'BarChart3', color: 'bg-cyan-500' },
    { value: 'marketing_campaign', label: 'Marketing Campaign', description: 'Strategic marketing and promotion campaign', icon: 'Megaphone', color: 'bg-red-500' }
  ];

  const teamSizeOptions = [
    { value: 2, label: '2 people (Small team)' },
    { value: 3, label: '3 people (Small team)' },
    { value: 5, label: '5 people (Optimal team)' },
    { value: 8, label: '8 people (Large team)' },
    { value: 12, label: '12+ people (Enterprise team)' }
  ];

  const experienceOptions = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
    { value: 'expert', label: 'Expert (10+ years)' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const generatePreview = async () => {
    if (!formData.name.trim()) {
      setError('Project name is required for preview');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // Simulate AI preview generation (in real implementation, call a preview API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedType = projectTypes.find(type => type.value === formData.projectType);

      setProjectPreview({
        name: formData.name,
        type: selectedType,
        estimatedDuration: getEstimatedDuration(formData.projectType, formData.teamSize, formData.teamExperience),
        estimatedTasks: getEstimatedTaskCount(formData.projectType),
        phases: getProjectPhases(formData.projectType),
        teamRecommendations: getTeamRecommendations(formData.teamSize, formData.teamExperience),
        technologies: getTechnologies(formData.projectType)
      });

      setCurrentStep(2);
    } catch (err) {
      setError('Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const getEstimatedDuration = (type, teamSize, experience) => {
    const baseDurations = {
      'web_application': 50,
      'mobile_app': 57,
      'ecommerce_platform': 87,
      'saas_application': 97,
      'devops_infrastructure': 52,
      'research_development': 89,
      'event_management': 65,
      'data_analysis': 45,
      'marketing_campaign': 35,
      'general': 43
    };

    let duration = baseDurations[type] || 43;

    // Adjust for team experience
    const experienceMultipliers = { junior: 1.3, intermediate: 1.0, senior: 0.8, expert: 0.7 };
    duration *= experienceMultipliers[experience] || 1.0;

    // Adjust for team size
    if (teamSize <= 2) duration *= 1.2;
    else if (teamSize >= 8) duration *= 0.9;

    return Math.round(duration);
  };

  const getEstimatedTaskCount = (type) => {
    const taskCounts = {
      'web_application': 25,
      'mobile_app': 28,
      'ecommerce_platform': 45,
      'saas_application': 52,
      'devops_infrastructure': 22,
      'research_development': 35,
      'event_management': 30,
      'data_analysis': 20,
      'marketing_campaign': 18,
      'general': 15
    };
    return taskCounts[type] || 15;
  };

  const getProjectPhases = (type) => {
    const phases = {
      'web_application': ['Planning & Analysis', 'Design & Architecture', 'Development', 'Testing & QA', 'Deployment & Launch'],
      'ecommerce_platform': ['Market Research & Planning', 'Core Platform Development', 'Payment & Security Integration', 'Advanced Features & Optimization', 'Testing & Launch'],
      'saas_application': ['Architecture & Infrastructure Design', 'Core Application Development', 'Subscription & Billing System', 'Enterprise Features & Security', 'Deployment & Monitoring']
    };
    return phases[type] || ['Initiation & Planning', 'Execution Phase 1', 'Execution Phase 2', 'Finalization & Review', 'Closure & Handover'];
  };

  const getTeamRecommendations = (size, experience) => {
    const recommendations = [];
    if (size <= 2) recommendations.push('Consider adding more team members for complex phases');
    if (size >= 8) recommendations.push('Break into smaller sub-teams to reduce coordination overhead');
    if (experience === 'junior') recommendations.push('Assign senior mentor for guidance');
    if (experience === 'expert') recommendations.push('Leverage team expertise for innovation opportunities');
    return recommendations;
  };

  const getTechnologies = (type) => {
    const tech = {
      'web_application': ['React/Vue.js', 'Node.js/Python', 'PostgreSQL', 'Docker', 'AWS/Azure'],
      'ecommerce_platform': ['React/Next.js', 'Node.js/Express', 'PostgreSQL', 'Stripe/PayPal', 'Redis', 'Docker'],
      'saas_application': ['React/Angular', 'Node.js/Python', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS/GCP']
    };
    return tech[type] || ['Modern Framework', 'Backend Technology', 'Database', 'Cloud Platform'];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      generatePreview();
      return;
    }

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const projectData = {
        name: formData.name.trim(),
        project_type: formData.projectType,
        team_size: formData.teamSize,
        team_experience: formData.teamExperience,
        organization_id: organizationId
      };

      await onCreateAIProject(projectData);

      // Reset form and close modal
      setFormData({
        name: '',
        projectType: 'general',
        teamSize: 5,
        teamExperience: 'intermediate'
      });
      setCurrentStep(1);
      setProjectPreview(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create AI project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isGeneratingPreview) {
      setFormData({
        name: '',
        projectType: 'general',
        teamSize: 5,
        teamExperience: 'intermediate'
      });
      setError('');
      setCurrentStep(1);
      setProjectPreview(null);
      onClose();
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setProjectPreview(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200/50">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500 rounded-full translate-x-12 translate-y-12"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                  <Icon name="Sparkles" size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Create AI Project
                  </h2>
                  <p className="text-gray-600">Let AI generate your complete project structure with intelligent task breakdown</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isLoading || isGeneratingPreview}
                iconName="X"
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl p-2"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Step Indicator */}
        <div className="px-6 py-6 bg-gradient-to-r from-white/90 to-blue-50/50 border-b border-gray-200/50">
          <div className="flex items-center justify-center space-x-6">
            {[
              { step: 1, label: 'Configure', icon: 'Settings', color: 'blue' },
              { step: 2, label: 'Preview & Customize', icon: 'Eye', color: 'indigo' },
              { step: 3, label: 'Create Project', icon: 'Rocket', color: 'purple' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className={`
                    relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105
                    ${currentStep >= item.step
                      ? `bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 text-white shadow-lg shadow-${item.color}-200`
                      : 'bg-white/70 text-gray-500 border-2 border-gray-200'
                    }
                  `}>
                    <Icon name={item.icon} size={20} />
                    {currentStep > item.step && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Icon name="Check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= item.step ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </div>

                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                    currentStep > item.step
                      ? `bg-gradient-to-r from-${item.color}-500 to-${item.color === 'purple' ? 'purple' : 'indigo'}-500`
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Enhanced Organization Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Icon name="Building2" size={16} className="text-white" />
                </div>
                <div>
                  <span className="text-sm text-gray-600">Creating project in:</span>
                  <div className="font-semibold text-gray-900">{organizationName}</div>
                </div>
              </div>
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertCircle" size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 mb-1">Error</h4>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              </div>
            )}

          {/* Enhanced Project Name */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Icon name="FileText" size={16} className="text-blue-600" />
              Project Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your project name..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              required
            />
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Icon name="Info" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                AI will generate a complete project structure, tasks, and timeline based on this name
              </p>
            </div>
          </div>

          {/* Enhanced Project Type Selection */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Icon name="Layers" size={16} className="text-purple-600" />
              Project Type
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => handleInputChange('projectType', type.value)}
                  className={`
                    relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 transform hover:scale-105
                    ${formData.projectType === type.value
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-200'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.color} text-white shadow-lg`}>
                      <Icon name={type.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{type.label}</h3>
                      <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                    </div>
                    {formData.projectType === type.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Icon name="Check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced AI Features Info */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-200/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="Sparkles" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
                  AI-Powered Project Generation
                </h3>
                <p className="text-sm text-gray-600">Intelligent automation for complete project setup</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: 'FileText', title: 'Project Structure', desc: 'Comprehensive description and objectives' },
                { icon: 'GitBranch', title: 'Smart Workflows', desc: 'Detailed phases and milestones' },
                { icon: 'CheckSquare', title: 'Task Breakdown', desc: 'Complete tasks with priorities and estimates' },
                { icon: 'Users', title: 'Team Planning', desc: 'Role assignments and collaboration setup' }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-white/50">
                  <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={feature.icon} size={12} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900">{feature.title}</h4>
                    <p className="text-xs text-purple-700">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

          {/* Enhanced Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="Shield" size={14} className="text-green-600" />
              <span>Secure AI generation with your data privacy protected</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || isGeneratingPreview}
                className="px-6 py-3 border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isGeneratingPreview || !formData.name.trim()}
                iconName={isLoading || isGeneratingPreview ? "Loader2" : "Sparkles"}
                iconPosition="left"
                className={`px-8 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 ${
                  isLoading || isGeneratingPreview ? "animate-spin" : ""
                } ${!formData.name.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-purple-200"
                } text-white border-0`}
              >
                {isLoading || isGeneratingPreview ? 'Generating Project...' : 'Generate AI Project'}
              </Button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAIProjectModal;
