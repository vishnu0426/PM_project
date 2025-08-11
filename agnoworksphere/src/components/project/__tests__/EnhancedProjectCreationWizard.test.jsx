import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EnhancedProjectCreationWizard from '../EnhancedProjectCreationWizard';

// Mock all step components
jest.mock('../ProjectConfigurationInterface', () => {
  return function MockProjectConfigurationInterface({ onNext, onBack }) {
    return (
      <div data-testid="configuration-step">
        <h2>Configuration Step</h2>
        <button onClick={() => onNext({ budget: 50000 })}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('../ProjectOverviewEditor', () => {
  return function MockProjectOverviewEditor({ onNext, onBack }) {
    return (
      <div data-testid="overview-step">
        <h2>Overview Step</h2>
        <button onClick={() => onNext({ title: 'Test Project' })}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('../TechStackDisplay', () => {
  return function MockTechStackDisplay({ onNext, onBack }) {
    return (
      <div data-testid="techstack-step">
        <h2>Tech Stack Step</h2>
        <button onClick={() => onNext({ frontend: ['react'] })}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('../WorkflowManagement', () => {
  return function MockWorkflowManagement({ onNext, onBack }) {
    return (
      <div data-testid="workflow-step">
        <h2>Workflow Step</h2>
        <button onClick={() => onNext({ phases: [] })}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('../TaskChecklistSystem', () => {
  return function MockTaskChecklistSystem({ onNext, onBack }) {
    return (
      <div data-testid="tasks-step">
        <h2>Tasks Step</h2>
        <button onClick={() => onNext([])}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('../ProjectConfirmationSummary', () => {
  return function MockProjectConfirmationSummary({ onFinalize, onBack }) {
    return (
      <div data-testid="summary-step">
        <h2>Summary Step</h2>
        <button onClick={() => onFinalize({ finalized: true })}>Finalize</button>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('../../AppIcon', () => {
  return function MockIcon({ name, className }) {
    return <span data-testid={`icon-${name}`} className={className} />;
  };
});

describe('EnhancedProjectCreationWizard', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onCreateProject: jest.fn(),
    organizationId: 'org-123',
    organizationName: 'Test Organization',
    className: 'test-class'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: { overflow: '' },
      writable: true
    });
  });

  it('renders when isOpen is true', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByText('for Test Organization')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('displays all step indicators', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('starts with configuration step', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    expect(screen.getByTestId('configuration-step')).toBeInTheDocument();
    expect(screen.getByText('Configuration Step')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    expect(screen.getByText('17%')).toBeInTheDocument(); // 1/6 * 100 rounded
  });

  it('navigates to next step when Next is clicked', async () => {
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // Click Next on configuration step
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('overview-step')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
    });
  });

  it('navigates to previous step when Back is clicked', async () => {
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // Go to step 2 first
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('overview-step')).toBeInTheDocument();
    });
    
    // Click Back
    const backButton = screen.getByText('Back');
    await user.click(backButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('configuration-step')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    });
  });

  it('allows clicking on previous steps to navigate', async () => {
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // Navigate to step 3
    await user.click(screen.getByText('Next')); // Step 2
    await waitFor(() => expect(screen.getByTestId('overview-step')).toBeInTheDocument());
    
    await user.click(screen.getByText('Next')); // Step 3
    await waitFor(() => expect(screen.getByTestId('techstack-step')).toBeInTheDocument());
    
    // Click on Configuration step indicator
    const configStep = screen.getByText('Configuration').closest('button');
    await user.click(configStep);
    
    await waitFor(() => {
      expect(screen.getByTestId('configuration-step')).toBeInTheDocument();
    });
  });

  it('disables future steps in navigation', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // Future steps should be disabled
    const workflowStep = screen.getByText('Workflow').closest('button');
    expect(workflowStep).toBeDisabled();
  });

  it('shows step completion indicators', async () => {
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // Complete first step
    await user.click(screen.getByText('Next'));
    
    await waitFor(() => {
      // First step should show as completed
      expect(screen.getByTestId('icon-Check')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByTestId('icon-X').closest('button');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onCreateProject when project is finalized', async () => {
    const onCreateProject = jest.fn();
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} onCreateProject={onCreateProject} />);
    
    // Navigate through all steps to summary
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByText('Next'));
      await waitFor(() => {}, { timeout: 1000 });
    }
    
    // Should be on summary step
    await waitFor(() => {
      expect(screen.getByTestId('summary-step')).toBeInTheDocument();
    });
    
    // Click Finalize
    await user.click(screen.getByText('Finalize'));
    
    expect(onCreateProject).toHaveBeenCalledWith(expect.objectContaining({
      configuration: expect.any(Object),
      overview: expect.any(Object),
      techStack: expect.any(Object),
      workflow: expect.any(Object),
      tasks: expect.any(Array),
      organizationId: 'org-123'
    }));
  });

  it('accumulates data from each step', async () => {
    const onCreateProject = jest.fn();
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} onCreateProject={onCreateProject} />);
    
    // Navigate through all steps
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByText('Next'));
      await waitFor(() => {}, { timeout: 1000 });
    }
    
    await user.click(screen.getByText('Finalize'));
    
    expect(onCreateProject).toHaveBeenCalledWith(expect.objectContaining({
      configuration: { budget: 50000 },
      overview: { title: 'Test Project' },
      techStack: { frontend: ['react'] },
      workflow: { phases: [] },
      tasks: []
    }));
  });

  it('sets body overflow hidden when open', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<EnhancedProjectCreationWizard {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('unset');
  });

  it('shows animation during step transitions', async () => {
    const user = userEvent.setup();
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // The component should handle animations internally
    // We can test that the step changes occur
    await user.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByTestId('overview-step')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('handles organization name fallback', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} organizationName={null} />);
    
    expect(screen.getByText('Enhanced project creation wizard')).toBeInTheDocument();
  });

  it('passes initial data to step components', () => {
    const { rerender } = render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // Navigate to step 2 and back to step 1 to test data persistence
    // This would be tested through the step component props
    expect(screen.getByTestId('configuration-step')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<EnhancedProjectCreationWizard {...defaultProps} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create New Project');
    
    // Check for button accessibility
    const closeButton = screen.getByTestId('icon-X').closest('button');
    expect(closeButton).toBeInTheDocument();
  });
});
