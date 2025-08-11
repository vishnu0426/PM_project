import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';
import ProjectConfigurationInterface from './ProjectConfigurationInterface';
import ProjectOverviewEditor from './ProjectOverviewEditor';
import TechStackDisplay from './TechStackDisplay';
import WorkflowManagement from './WorkflowManagement';
import TaskChecklistSystem from './TaskChecklistSystem';
import ProjectConfirmationSummary from './ProjectConfirmationSummary';

const EnhancedProjectCreationWizard = ({
  isOpen,
  onClose,
  onCreateProject,
  organizationId,
  organizationName,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState({
    configuration: {},
    overview: {},
    techStack: {},
    workflow: {},
    tasks: [],
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      id: 'configuration',
      title: 'Configuration',
      description: 'Set up project basics',
      icon: 'Settings',
      component: ProjectConfigurationInterface,
    },
    {
      id: 'overview',
      title: 'Overview',
      description: 'Define project details',
      icon: 'FileText',
      component: ProjectOverviewEditor,
    },
    {
      id: 'techstack',
      title: 'Tech Stack',
      description: 'Choose technologies',
      icon: 'Code',
      component: TechStackDisplay,
    },
    {
      id: 'workflow',
      title: 'Workflow',
      description: 'Plan project phases',
      icon: 'GitBranch',
      component: WorkflowManagement,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Create task checklist',
      icon: 'CheckSquare',
      component: TaskChecklistSystem,
    },
    {
      id: 'summary',
      title: 'Summary',
      description: 'Review and launch',
      icon: 'Rocket',
      component: ProjectConfirmationSummary,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNext = (stepData) => {
    const stepKey = steps[currentStep].id;
    setProjectData((prev) => ({
      ...prev,
      [stepKey]: stepData,
    }));

    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleFinalize = async (finalData) => {
    try {
      const completeProjectData = {
        ...projectData,
        ...finalData,
        organizationId,
        createdAt: new Date().toISOString(),
      };

      await onCreateProject?.(completeProjectData);
      onClose?.();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex < currentStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsAnimating(false);
      }, 200);
    }
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep].component;
  const currentStepData = projectData[steps[currentStep].id];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        className
      )}
    >
      <div
        className={cn(
          'h-full w-full bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col',
          'animate-in fade-in-0 duration-500'
        )}
      >
        {/* Enhanced Header with Progress */}
        <div className='bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm'>
          <div className='max-w-7xl mx-auto px-6 py-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md'>
                  <Icon name='Sparkles' size={20} className='text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                    Create New Project
                  </h1>
                  <p className='text-gray-600 text-sm mt-0.5'>
                    {organizationName
                      ? `for ${organizationName}`
                      : 'Enhanced project creation wizard'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg transition-all duration-200'
              >
                <Icon name='X' className='h-5 w-5 text-gray-500' />
              </button>
            </div>

            {/* Progress Summary */}
            <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
              <span>{`Step ${currentStep + 1} of ${steps.length}`}</span>
              <span>{`${Math.round(
                ((currentStep + 1) / steps.length) * 100
              )}%`}</span>
            </div>

            {/* Enhanced Progress Steps */}
            <div className='relative'>
              {/* Progress Line */}
              <div className='absolute top-6 left-0 right-0 h-0.5 bg-gray-200 rounded-full'>
                <div
                  className='h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out'
                  style={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              <div className='flex items-center justify-between relative'>
                {steps.map((step, index) => (
                  <div key={step.id} className='flex flex-col items-center'>
                    <button
                      onClick={() => handleStepClick(index)}
                      disabled={index > currentStep}
                      className={cn(
                        'group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300',
                        'hover:bg-white/80 hover:shadow-lg disabled:cursor-not-allowed',
                        'transform hover:scale-105',
                        index === currentStep &&
                          'bg-white shadow-xl border border-blue-200',
                        index < currentStep && 'cursor-pointer',
                        index > currentStep && 'opacity-60'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300',
                          'shadow-lg group-hover:shadow-xl',
                          index === currentStep &&
                            'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110',
                          index < currentStep &&
                            'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
                          index > currentStep &&
                            'bg-white border-2 border-gray-300 text-gray-400'
                        )}
                      >
                        {index < currentStep ? (
                          <Icon name='Check' className='h-6 w-6' />
                        ) : (
                          <Icon name={step.icon} className='h-6 w-6' />
                        )}
                      </div>

                      <div className='text-center'>
                        <div
                          className={cn(
                            'font-semibold text-sm transition-colors duration-200',
                            index === currentStep && 'text-blue-700',
                            index < currentStep && 'text-green-700',
                            index > currentStep && 'text-gray-500'
                          )}
                        >
                          {step.title}
                        </div>
                        <div
                          className={cn(
                            'text-xs mt-1 transition-colors duration-200',
                            index === currentStep && 'text-blue-600',
                            index < currentStep && 'text-green-600',
                            index > currentStep && 'text-gray-400'
                          )}
                        >
                          {step.description}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Step Content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='min-h-full'>
            <div className='max-w-6xl mx-auto px-6 py-8'>
              <div
                className={cn(
                  'transition-all duration-500 ease-out',
                  isAnimating && 'opacity-0 translate-y-4 scale-98'
                )}
              >
                {/* Step Content Card */}
                <div className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden'>
                  <CurrentStepComponent
                    onNext={handleNext}
                    onBack={handleBack}
                    onFinalize={handleFinalize}
                    initialData={currentStepData}
                    projectData={projectData}
                    organizationName={organizationName}
                    organizationId={organizationId}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className='bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg'>
          <div className='max-w-6xl mx-auto px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='text-sm font-medium text-gray-700'>
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className='text-xs text-gray-500'>
                  {steps[currentStep].title}
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-32 bg-gray-200 rounded-full h-2 overflow-hidden'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700 ease-out'
                      style={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className='text-sm font-semibold text-gray-700 min-w-[3rem]'>
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProjectCreationWizard;
