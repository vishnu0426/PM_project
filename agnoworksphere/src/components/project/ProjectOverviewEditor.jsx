import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const ProjectOverviewEditor = ({
  onNext,
  onBack,
  initialData = {},
  projectData = {},
  organizationId,
  className
}) => {
  const [overview, setOverview] = useState({
    title: '',
    description: '',
    duration: '',
    type: '',
    complexity: '',
    tags: [],
    dueDate: '',
    ...initialData
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-generate AI overview when coming from Configuration phase
  useEffect(() => {
    const configurationData = projectData?.configuration;
    if (configurationData && !hasGeneratedAI && !overview.title) {
      generateAIOverview(configurationData);
    }

    // Extract AI suggestions if available
    if (configurationData?.aiData?.suggestions) {
      setAiSuggestions(configurationData.aiData.suggestions);
      setShowSuggestions(true);
    }
  }, [projectData, hasGeneratedAI]);

  const generateAIOverview = async (configData) => {
    if (!configData?.projectName) return;
    
    setIsGeneratingAI(true);
    try {
      // Simulate AI API call - in real implementation, call your AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiGeneratedOverview = await generateSimpleProjectOverview(configData);
      
      setOverview(prev => ({
        ...prev,
        ...aiGeneratedOverview
      }));
      
      setHasGeneratedAI(true);
    } catch (error) {
      console.error('Failed to generate AI overview:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateSimpleProjectOverview = async (configData) => {
    const { projectName, projectDescription } = configData;
    
    // Detect industry and project type based on project name
    const industry = detectIndustry(projectName);
    const projectType = detectProjectType(projectName);
    const complexity = detectComplexity(projectName, projectType);
    const duration = calculateDuration(projectType, complexity);
    const tags = generateTags(projectName, industry, projectType);
    const dueDate = calculateDueDate(duration);
    
    return {
      title: projectName,
      description: generateSimpleDescription(projectName, projectDescription, industry, projectType),
      duration,
      type: projectType,
      complexity,
      tags,
      dueDate
    };
  };

  const detectIndustry = (projectName) => {
    const name = projectName.toLowerCase();
    if (name.includes('healthcare') || name.includes('medical') || name.includes('health')) return 'Healthcare';
    if (name.includes('fintech') || name.includes('banking') || name.includes('finance')) return 'Financial Services';
    if (name.includes('ecommerce') || name.includes('e-commerce') || name.includes('retail') || name.includes('shop')) return 'E-commerce';
    if (name.includes('education') || name.includes('learning') || name.includes('school')) return 'Education';
    if (name.includes('social') || name.includes('community') || name.includes('network')) return 'Social Media';
    if (name.includes('game') || name.includes('gaming') || name.includes('entertainment')) return 'Gaming & Entertainment';
    if (name.includes('iot') || name.includes('smart') || name.includes('automation')) return 'IoT & Automation';
    return 'Technology';
  };

  const detectProjectType = (projectName) => {
    const name = projectName.toLowerCase();
    if (name.includes('mobile') || name.includes('app') || name.includes('ios') || name.includes('android')) return 'Mobile Application';
    if (name.includes('web') || name.includes('website') || name.includes('portal')) return 'Web Application';
    if (name.includes('api') || name.includes('backend') || name.includes('service')) return 'API/Backend Service';
    if (name.includes('dashboard') || name.includes('admin') || name.includes('analytics')) return 'Dashboard/Analytics';
    if (name.includes('ai') || name.includes('ml') || name.includes('machine learning') || name.includes('chatbot')) return 'AI/ML Solution';
    if (name.includes('blockchain') || name.includes('crypto') || name.includes('nft')) return 'Blockchain Solution';
    return 'Software Development';
  };

  const detectComplexity = (projectName, projectType) => {
    const name = projectName.toLowerCase();
    if (name.includes('simple') || name.includes('basic') || name.includes('minimal')) return 'low complexity';
    if (name.includes('enterprise') || name.includes('complex') || name.includes('advanced') || name.includes('ai') || name.includes('blockchain')) return 'high complexity';
    if (projectType.includes('AI/ML') || projectType.includes('Blockchain')) return 'high complexity';
    return 'medium complexity';
  };

  const calculateDuration = (projectType, complexity) => {
    const baseDuration = {
      'Mobile Application': 3,
      'Web Application': 2,
      'API/Backend Service': 2,
      'Dashboard/Analytics': 2,
      'AI/ML Solution': 4,
      'Blockchain Solution': 5,
      'Software Development': 3
    };

    const complexityMultiplier = {
      'low complexity': 0.7,
      'medium complexity': 1,
      'high complexity': 1.5
    };

    const base = baseDuration[projectType] || 3;
    const multiplier = complexityMultiplier[complexity] || 1;
    const duration = Math.round(base * multiplier);
    
    return `${duration}-${duration + 1} months`;
  };

  const generateTags = (projectName, industry, projectType) => {
    const tags = [];
    const name = projectName.toLowerCase();

    // Add project type related tags
    if (projectType.includes('Mobile')) tags.push('Mobile App');
    if (projectType.includes('Web')) tags.push('Web Development');
    if (projectType.includes('API')) tags.push('Backend');
    if (projectType.includes('AI')) tags.push('AI', 'Machine Learning');
    if (projectType.includes('Blockchain')) tags.push('Blockchain', 'Crypto');
    if (projectType.includes('Dashboard')) tags.push('Analytics', 'Dashboard');

    // Add technology tags based on project name
    if (name.includes('react') || name.includes('javascript')) tags.push('React', 'JavaScript');
    if (name.includes('python')) tags.push('Python');
    if (name.includes('node')) tags.push('Node.js');
    if (name.includes('chatbot') || name.includes('bot')) tags.push('Chatbot', 'Natural Language Processing');
    if (name.includes('translation') || name.includes('multilingual')) tags.push('Translation', 'Multilingual');

    // Add industry tags
    if (industry !== 'Technology') tags.push(industry);

    // Add general development tags
    if (!tags.includes('Software Development')) tags.push('Software Development');

    return tags.slice(0, 6); // Limit to 6 tags
  };

  const calculateDueDate = (duration) => {
    const today = new Date();
    const months = parseInt(duration.split('-')[1]) || 3; // Get the upper bound of duration
    const dueDate = new Date(today.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  };

  const generateSimpleDescription = (projectName, userDescription, industry, projectType) => {
    if (userDescription && userDescription.trim()) {
      return userDescription;
    }

    const templates = {
      'Mobile Application': `Develop a mobile application that provides users with an intuitive and efficient solution for ${industry.toLowerCase()} needs. The app will feature modern design principles, seamless user experience, and robust functionality to enhance user engagement and productivity.`,
      'Web Application': `Create a comprehensive web application designed to streamline operations and improve user experience in the ${industry.toLowerCase()} sector. The platform will offer scalable architecture, responsive design, and integrated features for optimal performance.`,
      'AI/ML Solution': `Build an intelligent solution leveraging artificial intelligence and machine learning technologies to address complex challenges in ${industry.toLowerCase()}. The system will provide automated insights, predictive capabilities, and enhanced decision-making support.`,
      'API/Backend Service': `Develop a robust backend service and API infrastructure to support seamless data management and integration capabilities. The service will ensure high performance, security, and scalability for enterprise-level operations.`,
      'Dashboard/Analytics': `Create an advanced analytics dashboard that provides comprehensive insights and data visualization capabilities. The platform will enable users to monitor key metrics, generate reports, and make data-driven decisions effectively.`,
      'Blockchain Solution': `Implement a blockchain-based solution that ensures transparency, security, and decentralization for ${industry.toLowerCase()} operations. The platform will leverage distributed ledger technology for enhanced trust and efficiency.`,
      'Software Development': `Develop a comprehensive software solution that addresses specific requirements and challenges in the ${industry.toLowerCase()} domain. The application will feature modern architecture, user-friendly interface, and scalable functionality.`
    };

    return templates[projectType] || templates['Software Development'];
  };

  const handleNext = () => {
    onNext?.(overview);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    const configurationData = projectData?.configuration;
    if (configurationData) {
      setHasGeneratedAI(false);
      generateAIOverview(configurationData);
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)}>
      {/* AI Generation Loading Overlay */}
      {isGeneratingAI && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 mx-4 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
              <Icon name="Sparkles" size={24} className="text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is generating your project overview...</h3>
            <p className="text-sm text-gray-600 mb-4">Creating project details based on your configuration</p>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Overview</h2>
        <p className="text-gray-600">
          Define project details
        </p>
        {hasGeneratedAI && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mt-2">
            <Icon name="Sparkles" size={14} />
            AI-Generated Content
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Project Title */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{overview.title}</h1>
              {overview.complexity && (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  overview.complexity === 'low complexity' && "bg-green-100 text-green-800",
                  overview.complexity === 'medium complexity' && "bg-yellow-100 text-yellow-800",
                  overview.complexity === 'high complexity' && "bg-red-100 text-red-800"
                )}>
                  {overview.complexity}
                </span>
              )}
            </div>
            {hasGeneratedAI && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Icon name="Edit" size={14} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-2"
                >
                  <Icon name="Sparkles" size={14} />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Project Description */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-gray-700 leading-relaxed">{overview.description}</p>
        </div>

        {/* Project Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration:</p>
                <p className="font-medium text-gray-900">{overview.duration}</p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Icon name="Tag" size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Type:</p>
                <p className="font-medium text-gray-900">{overview.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {overview.tags && overview.tags.length > 0 && (
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-500 mb-3">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {overview.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-blue-100 bg-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Icon name="Lightbulb" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
                  <p className="text-sm text-gray-600">Intelligent recommendations for your project</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <Icon name="X" size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-white/50 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      suggestion.category === 'technology' && "bg-blue-100 text-blue-800",
                      suggestion.category === 'security' && "bg-red-100 text-red-800",
                      suggestion.category === 'performance' && "bg-green-100 text-green-800",
                      suggestion.category === 'architecture' && "bg-purple-100 text-purple-800",
                      suggestion.category === 'testing' && "bg-yellow-100 text-yellow-800",
                      suggestion.category === 'devops' && "bg-indigo-100 text-indigo-800",
                      suggestion.category === 'monitoring' && "bg-gray-100 text-gray-800"
                    )}>
                      {suggestion.category}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      suggestion.priority === 'high' && "bg-red-100 text-red-800",
                      suggestion.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                      suggestion.priority === 'low' && "bg-green-100 text-green-800"
                    )}>
                      {suggestion.priority} priority
                    </span>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
                <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>

                {suggestion.impact && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Expected Impact:</p>
                    <p className="text-sm text-gray-700">{suggestion.impact}</p>
                  </div>
                )}

                {suggestion.tags && suggestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {suggestion.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {suggestion.resources && suggestion.resources.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.resources.map((resource, resourceIndex) => (
                        <span
                          key={resourceIndex}
                          className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <Icon name="ArrowLeft" size={16} />
          Back
        </Button>

        <Button
          onClick={handleNext}
          className="flex items-center gap-2"
        >
          Next
          <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ProjectOverviewEditor;
