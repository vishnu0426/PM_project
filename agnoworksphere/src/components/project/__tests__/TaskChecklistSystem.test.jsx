import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TaskChecklistSystem from '../TaskChecklistSystem';

// Mock dependencies
jest.mock('../../AppIcon', () => {
  return function MockIcon({ name, className }) {
    return <span data-testid={`icon-${name}`} className={className} />;
  };
});

jest.mock('../../ui/Checkbox', () => {
  return function MockCheckbox({ checked, onChange, children, ...props }) {
    return (
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          {...props}
        />
        {children}
      </label>
    );
  };
});

describe('TaskChecklistSystem', () => {
  const defaultProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    initialData: [],
    className: 'test-class'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with task management interface', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByText('Task Checklist')).toBeInTheDocument();
    expect(screen.getByText('Manage and track project tasks with advanced filtering and dependencies')).toBeInTheDocument();
  });

  it('displays task statistics', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('shows default tasks', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByText('Set up development environment')).toBeInTheDocument();
    expect(screen.getByText('Design database schema')).toBeInTheDocument();
    expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
  });

  it('displays task filters and controls', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
    expect(screen.getByText('Show completed tasks')).toBeInTheDocument();
  });

  it('filters tasks by search query', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'database');
    
    await waitFor(() => {
      expect(screen.getByText('Design database schema')).toBeInTheDocument();
      expect(screen.queryByText('Set up development environment')).not.toBeInTheDocument();
    });
  });

  it('toggles task completion status', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    // Find the first task checkbox
    const taskCheckboxes = screen.getAllByRole('checkbox');
    const firstTaskCheckbox = taskCheckboxes[1]; // Skip the "show completed" checkbox
    
    await user.click(firstTaskCheckbox);
    
    // Task should be marked as completed
    await waitFor(() => {
      expect(firstTaskCheckbox).toBeChecked();
    });
  });

  it('shows task details with priority and due date', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByText('high')).toBeInTheDocument(); // Priority
    expect(screen.getByText('medium')).toBeInTheDocument(); // Priority
    expect(screen.getByText(/Due:/)).toBeInTheDocument(); // Due date
  });

  it('displays subtasks for tasks', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByText('Subtasks')).toBeInTheDocument();
    expect(screen.getByText('Install Node.js and npm')).toBeInTheDocument();
    expect(screen.getByText('Set up Git repository')).toBeInTheDocument();
  });

  it('toggles subtask completion', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    // Find a subtask checkbox
    const subtaskCheckbox = screen.getByLabelText('Install Node.js and npm');
    await user.click(subtaskCheckbox);
    
    await waitFor(() => {
      expect(subtaskCheckbox).toBeChecked();
    });
  });

  it('shows progress bars for tasks', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getAllByText('Progress')).toHaveLength(3); // One for each default task
    expect(screen.getByText('0%')).toBeInTheDocument(); // Initial progress
  });

  it('adds new task when Add Task button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    const addButton = screen.getByText('Add Task');
    await user.click(addButton);
    
    // Should open task creation modal or form
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('filters tasks by status', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    // Find status filter dropdown
    const statusFilter = screen.getAllByRole('combobox')[0]; // Assuming first combobox is status
    await user.selectOptions(statusFilter, 'completed');
    
    // Should filter to show only completed tasks
    await waitFor(() => {
      // Since no tasks are completed initially, should show empty state or no tasks
      expect(screen.queryByText('Set up development environment')).not.toBeInTheDocument();
    });
  });

  it('sorts tasks by different criteria', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    // Find sort dropdown
    const sortSelect = screen.getAllByRole('combobox').find(select => 
      select.value === 'dueDate' || select.textContent.includes('Due Date')
    );
    
    if (sortSelect) {
      await user.selectOptions(sortSelect, 'priority');
      
      // Tasks should be reordered by priority
      await waitFor(() => {
        // High priority tasks should appear first
        const tasks = screen.getAllByText(/high|medium|low/);
        expect(tasks[0]).toHaveTextContent('high');
      });
    }
  });

  it('shows task dependencies', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByText(/dependencies/)).toBeInTheDocument();
  });

  it('displays overdue tasks with warning', () => {
    // Mock a task with past due date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const tasksWithOverdue = [
      {
        id: 'overdue-task',
        title: 'Overdue Task',
        dueDate: pastDate.toISOString().split('T')[0],
        status: 'pending'
      }
    ];
    
    render(<TaskChecklistSystem {...defaultProps} initialData={tasksWithOverdue} />);
    
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('bulk updates selected tasks', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    // Select multiple tasks
    const taskCheckboxes = screen.getAllByRole('checkbox');
    await user.click(taskCheckboxes[1]); // First task
    await user.click(taskCheckboxes[2]); // Second task
    
    // Bulk action buttons should appear
    await waitFor(() => {
      expect(screen.getByText('Mark Complete')).toBeInTheDocument();
      expect(screen.getByText('Start Progress')).toBeInTheDocument();
    });
  });

  it('calls onNext with tasks data', async () => {
    const onNext = jest.fn();
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} onNext={onNext} />);
    
    const nextButton = screen.getByText('Continue to Summary');
    await user.click(nextButton);
    
    expect(onNext).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        status: expect.any(String)
      })
    ]));
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} onBack={onBack} />);
    
    const backButton = screen.getByText('Back to Workflow');
    await user.click(backButton);
    
    expect(onBack).toHaveBeenCalled();
  });

  it('shows step indicator', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(screen.getByText('Step 5 of 6')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<TaskChecklistSystem {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('has proper accessibility attributes', () => {
    render(<TaskChecklistSystem {...defaultProps} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Task Checklist');
    
    // Check for form elements
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('shows empty state when no tasks match filters', async () => {
    const user = userEvent.setup();
    render(<TaskChecklistSystem {...defaultProps} />);
    
    // Search for non-existent task
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'nonexistent task');
    
    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or create a new task to get started.')).toBeInTheDocument();
    });
  });
});
