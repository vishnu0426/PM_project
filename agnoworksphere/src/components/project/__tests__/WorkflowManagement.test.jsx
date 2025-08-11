import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import WorkflowManagement from '../WorkflowManagement';

// Mock dependencies
jest.mock('../../AppIcon', () => {
  return function MockIcon({ name, className }) {
    return <span data-testid={`icon-${name}`} className={className} />;
  };
});

jest.mock('../../ui/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    );
  };
});

describe('WorkflowManagement', () => {
  const defaultProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    initialData: {},
    className: 'test-class'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with workflow visualization options', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    expect(screen.getByText('Project Workflow')).toBeInTheDocument();
    expect(screen.getByText('Visualize and organize your project tasks and dependencies')).toBeInTheDocument();
  });

  it('displays view mode selector', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    // Should have a select for view modes
    expect(screen.getByDisplayValue('Gantt Chart')).toBeInTheDocument();
  });

  it('shows default workflow phases', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    expect(screen.getByText('Planning & Analysis')).toBeInTheDocument();
    expect(screen.getByText('Design & Prototyping')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Testing & QA')).toBeInTheDocument();
    expect(screen.getByText('Deployment & Launch')).toBeInTheDocument();
  });

  it('displays tasks within phases', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    expect(screen.getByText('Requirements Gathering')).toBeInTheDocument();
    expect(screen.getByText('System Analysis')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
    expect(screen.getByText('Backend Development')).toBeInTheDocument();
  });

  it('switches between view modes', async () => {
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} />);
    
    // Switch to Flow Diagram view
    const viewSelect = screen.getByDisplayValue('Gantt Chart');
    await user.selectOptions(viewSelect, 'flowchart');
    
    await waitFor(() => {
      expect(screen.getByText('Flow Diagram')).toBeInTheDocument();
    });
  });

  it('opens task modal when task is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} />);
    
    // Click on a task
    const task = screen.getByText('Requirements Gathering');
    await user.click(task);
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Task Details');
    });
  });

  it('allows task editing in modal', async () => {
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} />);
    
    // Open task modal
    const task = screen.getByText('Requirements Gathering');
    await user.click(task);
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Should have form fields for editing
    expect(screen.getByLabelText('Task Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration (days)')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });

  it('supports drag and drop for task reordering', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    // Switch to flow chart view for drag and drop
    const viewSelect = screen.getByDisplayValue('Gantt Chart');
    fireEvent.change(viewSelect, { target: { value: 'flowchart' } });
    
    // Tasks should have draggable attribute
    const tasks = screen.getAllByText(/Requirements Gathering|System Analysis/);
    tasks.forEach(task => {
      const taskElement = task.closest('[draggable="true"]');
      expect(taskElement).toBeInTheDocument();
    });
  });

  it('displays Gantt chart view correctly', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    // Should show Gantt chart elements
    expect(screen.getByText('Gantt Chart View')).toBeInTheDocument();
    expect(screen.getByText(/Total Duration:/)).toBeInTheDocument();
  });

  it('shows timeline view with proper structure', async () => {
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} />);
    
    // Switch to timeline view
    const viewSelect = screen.getByDisplayValue('Gantt Chart');
    await user.selectOptions(viewSelect, 'timeline');
    
    await waitFor(() => {
      expect(screen.getByText('Timeline View')).toBeInTheDocument();
    });
  });

  it('displays task count and phase information', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    expect(screen.getByText(/tasks across \d+ phases/)).toBeInTheDocument();
  });

  it('calls onNext with workflow data', async () => {
    const onNext = jest.fn();
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} onNext={onNext} />);
    
    const nextButton = screen.getByText('Continue to Tasks');
    await user.click(nextButton);
    
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({
      phases: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          tasks: expect.any(Array)
        })
      ])
    }));
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} onBack={onBack} />);
    
    const backButton = screen.getByText('Back to Tech Stack');
    await user.click(backButton);
    
    expect(onBack).toHaveBeenCalled();
  });

  it('shows step indicator', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    expect(screen.getByText('Step 4 of 6')).toBeInTheDocument();
  });

  it('handles task deletion', async () => {
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} />);
    
    // Open task modal
    const task = screen.getByText('Requirements Gathering');
    await user.click(task);
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButton = screen.getByText('Delete Task');
    await user.click(deleteButton);
    
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('validates task dependencies', async () => {
    const user = userEvent.setup();
    render(<WorkflowManagement {...defaultProps} />);
    
    // Open task modal
    const task = screen.getByText('System Analysis');
    await user.click(task);
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Should show dependencies section
    expect(screen.getByText('Dependencies')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<WorkflowManagement {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('has proper accessibility attributes', () => {
    render(<WorkflowManagement {...defaultProps} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Project Workflow');
    
    // Check for select element
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('loads initial workflow data', () => {
    const initialData = {
      phases: [
        {
          id: 'custom-phase',
          name: 'Custom Phase',
          duration: 4,
          tasks: [
            { id: 'custom-task', name: 'Custom Task', duration: 5, dependencies: [], priority: 'high' }
          ]
        }
      ]
    };
    
    render(<WorkflowManagement {...defaultProps} initialData={initialData} />);
    
    expect(screen.getByText('Custom Phase')).toBeInTheDocument();
    expect(screen.getByText('Custom Task')).toBeInTheDocument();
  });
});
