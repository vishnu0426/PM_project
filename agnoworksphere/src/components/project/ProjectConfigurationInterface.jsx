import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import Icon from '../AppIcon';
import apiService from '../../utils/apiService';

const ProjectConfigurationInterface = ({
  onNext,
  onBack,
  initialData = {},
  organizationId,
  className,
}) => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    project_type: 'general',
    team_size: 5,
    team_experience: 'intermediate',
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => {
    validateConfiguration();
  }, [config]);

  const validateConfiguration = () => {
    const newErrors = {};

    if (!config.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  const updateConfig = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = async () => {
    if (isValid && !isGenerating && organizationId) {
      setIsGenerating(true);
      setGenerationError(null);

      try {
        // Prepare AI project data
        const aiProjectData = {
          name: config.name.trim(),
          project_type: config.project_type,
          team_size: config.team_size,
          team_experience: config.team_experience,
          organization_id: organizationId,
        };

        console.log('Generating AI project with data:', aiProjectData);

        // Call AI project generation API
        const result = await apiService.ai.generateProjectPreview(
          aiProjectData
        );

        // realApiService.handle returns the JSON response directly
        // The preview endpoint returns fields like project, workflow, tasks, metadata, estimated_duration, estimated_cost
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid AI preview response');
        }

        console.log('AI project generation successful:', result);

        // Store the AI generated data (entire result object)
        setAiGeneratedData(result);

        // Pass the enhanced config with AI data to the next step
        const enhancedConfig = {
          ...config,
          aiGenerated: true,
          aiData: result,
        };

        onNext?.(enhancedConfig);
      } catch (error) {
        console.error('Error generating AI project:', error);
        setGenerationError(error.message || 'Failed to generate AI project');

        // Still allow proceeding with basic config if AI fails
        setTimeout(() => {
          onNext?.(config);
        }, 1000);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className={cn('min-h-full py-8 px-6', className)}>
      <div className='w-full max-w-lg mx-auto relative'>
        {/* Loading Overlay */}
        {isGenerating && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl'>
              <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg'>
                <Icon
                  name='Sparkles'
                  size={28}
                  className='text-white animate-pulse'
                />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                AI is analyzing your project...
              </h3>
              <p className='text-sm text-gray-600 mb-6'>
                Generating intelligent project structure and recommendations
              </p>
              <div className='flex justify-center'>
                <div className='flex space-x-2'>
                  <div className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'></div>
                  <div
                    className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8'>
          {/* Header */}
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-8 border-b border-gray-100'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                <Icon name='Sparkles' size={20} className='text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  AI-Powered Project Creation
                </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  Let AI create your complete project structure automatically
                </p>
              </div>
            </div>

            {/* AI Benefits */}
            <div className='bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50'>
              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-gray-700'>Auto-detects industry</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-gray-700'>Generates tech stack</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-gray-700'>Creates task breakdown</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-gray-700'>Plans workflow phases</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className='p-6 sm:p-8 space-y-6'>
            {/* Project Name - Primary Input */}
            <div className='space-y-3'>
              <label className='block text-sm font-semibold text-gray-900'>
                Project Name <span className='text-red-500'>*</span>
              </label>
              <Input
                type='text'
                placeholder='e.g., E-commerce Mobile App, Healthcare Analytics Platform, Marketing Campaign'
                value={config.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                className='w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white'
              />
              {errors.name && (
                <p className='text-red-500 text-sm font-medium'>
                  {errors.name}
                </p>
              )}
              <p className='text-xs text-gray-500 flex items-center gap-2'>
                <Icon name='Lightbulb' size={14} className='text-yellow-500' />
                AI will automatically detect project type, industry, and
                generate complete project structure
              </p>
            </div>

            {/* Project Description - Optional */}
            <div className='space-y-3'>
              <label className='block text-sm font-semibold text-gray-900'>
                Project Description{' '}
                <span className='text-gray-400 text-xs font-normal'>
                  (Optional)
                </span>
              </label>
              <Textarea
                placeholder='Provide additional context about your project goals, specific requirements, or constraints...'
                value={config.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                rows={4}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-gray-50 focus:bg-white'
              />
              <p className='text-xs text-gray-500 flex items-center gap-2'>
                <Icon name='Info' size={14} className='text-blue-500' />
                Optional: AI will generate comprehensive project details even
                without this
              </p>
            </div>

            {/* Error Display */}
            {generationError && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                <div className='flex items-start gap-3'>
                  <Icon
                    name='AlertCircle'
                    size={20}
                    className='text-red-500 flex-shrink-0 mt-0.5'
                  />
                  <div>
                    <h4 className='font-semibold text-red-900 mb-1'>
                      AI Generation Error
                    </h4>
                    <p className='text-sm text-red-700'>{generationError}</p>
                    <p className='text-xs text-red-600 mt-2'>
                      Don't worry! You can still proceed with manual project
                      creation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Generation Info */}
            <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1'>
                  <Icon name='Zap' size={16} className='text-white' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    What AI will generate for you:
                  </h4>
                  <ul className='text-sm text-gray-700 space-y-1'>
                    <li>• Intelligent industry and project type detection</li>
                    <li>• Comprehensive project description and objectives</li>
                    <li>• Recommended technology stack and tools</li>
                    <li>• Detailed task breakdown with priorities</li>
                    <li>• Project workflow and timeline phases</li>
                    <li>• Team size and role recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='px-6 sm:px-8 pb-6 sm:pb-8'>
            <div className='flex justify-between items-center gap-4'>
              <Button
                variant='outline'
                onClick={onBack}
                className='px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200'
              >
                <Icon name='ArrowLeft' size={16} className='mr-2' />
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isValid || isGenerating}
                className='px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 min-w-[200px] justify-center font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
              >
                {isGenerating ? (
                  <>
                    <Icon name='Loader2' size={18} className='animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Icon name='Sparkles' size={18} />
                    Generate AI Project
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectConfigurationInterface;
