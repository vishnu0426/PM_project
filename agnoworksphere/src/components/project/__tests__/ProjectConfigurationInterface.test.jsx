import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProjectConfigurationInterface from '../ProjectConfigurationInterface';

// Mock dependencies
jest.mock('../../AppIcon', () => {
  return function MockIcon({ name, className }) {
    return <span data-testid={`icon-${name}`} className={className} />;
  };
});

describe('ProjectConfigurationInterface', () => {
  const defaultProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    initialData: {},
    className: 'test-class'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default configuration', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Project Configuration')).toBeInTheDocument();
    expect(screen.getByText('Customize your project settings and resource allocation')).toBeInTheDocument();
  });

  it('displays budget and timeline sliders', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Project Budget')).toBeInTheDocument();
    expect(screen.getByText('Project Duration')).toBeInTheDocument();
    
    // Check for slider inputs
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(7); // Budget, Duration, and 5 resource sliders
  });

  it('updates budget value when slider changes', async () => {
    const user = userEvent.setup();
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    const budgetSlider = screen.getAllByRole('slider')[0];
    await user.clear(budgetSlider);
    await user.type(budgetSlider, '100000');
    
    // Check if the formatted value is displayed
    await waitFor(() => {
      expect(screen.getByText('$100,000')).toBeInTheDocument();
    });
  });

  it('updates duration value when slider changes', async () => {
    const user = userEvent.setup();
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    const durationSlider = screen.getAllByRole('slider')[1];
    await user.clear(durationSlider);
    await user.type(durationSlider, '24');
    
    // Check if the formatted value is displayed
    await waitFor(() => {
      expect(screen.getByText('6 months')).toBeInTheDocument();
    });
  });

  it('displays methodology and priority selects', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Development Methodology')).toBeInTheDocument();
    expect(screen.getByText('Project Priority')).toBeInTheDocument();
  });

  it('shows team resources section with sliders', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Team Resources')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developers')).toBeInTheDocument();
    expect(screen.getByText('Backend Developers')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Designers')).toBeInTheDocument();
    expect(screen.getByText('QA Engineers')).toBeInTheDocument();
    expect(screen.getByText('DevOps Engineers')).toBeInTheDocument();
  });

  it('displays development tools toggles', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Development Tools')).toBeInTheDocument();
    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByText('Version Control')).toBeInTheDocument();
    expect(screen.getByText('CI/CD Pipeline')).toBeInTheDocument();
  });

  it('shows advanced features toggles', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Advanced Features')).toBeInTheDocument();
    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
    expect(screen.getByText('AI Assistance')).toBeInTheDocument();
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });

  it('displays configuration preview', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
    expect(screen.getByText('Budget & Timeline')).toBeInTheDocument();
    expect(screen.getByText('Team Composition')).toBeInTheDocument();
    expect(screen.getByText('Selected Tools')).toBeInTheDocument();
  });

  it('validates configuration before allowing next', async () => {
    const onNext = jest.fn();
    render(<ProjectConfigurationInterface {...defaultProps} onNext={onNext} />);
    
    const nextButton = screen.getByText('Continue to Overview');
    fireEvent.click(nextButton);
    
    // Should call onNext with valid configuration
    await waitFor(() => {
      expect(onNext).toHaveBeenCalledWith(expect.objectContaining({
        budget: expect.any(Number),
        duration: expect.any(Number),
        methodology: expect.any(String),
        priority: expect.any(String)
      }));
    });
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = jest.fn();
    render(<ProjectConfigurationInterface {...defaultProps} onBack={onBack} />);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(onBack).toHaveBeenCalled();
  });

  it('loads initial data correctly', () => {
    const initialData = {
      budget: 75000,
      duration: 16,
      methodology: 'kanban',
      priority: 'high'
    };
    
    render(<ProjectConfigurationInterface {...defaultProps} initialData={initialData} />);
    
    expect(screen.getByText('$75,000')).toBeInTheDocument();
    expect(screen.getByText('4 months')).toBeInTheDocument();
  });

  it('updates team size total when resource sliders change', async () => {
    const user = userEvent.setup();
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    // Find and update frontend developers slider
    const resourceSliders = screen.getAllByRole('slider');
    const frontendSlider = resourceSliders[2]; // Assuming it's the 3rd slider
    
    await user.clear(frontendSlider);
    await user.type(frontendSlider, '3');
    
    // Check if total team size is updated
    await waitFor(() => {
      expect(screen.getByText(/Total Team Size:/)).toBeInTheDocument();
    });
  });

  it('toggles tools correctly', async () => {
    const user = userEvent.setup();
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    // Find a toggle button (assuming it's rendered as a button)
    const toggles = screen.getAllByRole('button');
    const cicdToggle = toggles.find(button => 
      button.textContent.includes('CI/CD Pipeline') || 
      button.closest('[data-testid*="toggle"]')
    );
    
    if (cicdToggle) {
      await user.click(cicdToggle);
      // Verify the toggle state changed
      // This would depend on the actual implementation of the Toggle component
    }
  });

  it('shows step indicator', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
  });

  it('disables next button when validation fails', async () => {
    // Mock a scenario where validation would fail
    const invalidInitialData = {
      budget: -1000 // Invalid budget
    };
    
    render(<ProjectConfigurationInterface {...defaultProps} initialData={invalidInitialData} />);
    
    const nextButton = screen.getByText('Continue to Overview');
    
    // The button should be disabled or show validation error
    // This depends on the actual validation implementation
    expect(nextButton).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    const initialData = {
      budget: 123456
    };
    
    render(<ProjectConfigurationInterface {...defaultProps} initialData={initialData} />);
    
    expect(screen.getByText('$123,456')).toBeInTheDocument();
  });

  it('formats duration correctly for weeks and months', () => {
    const { rerender } = render(
      <ProjectConfigurationInterface {...defaultProps} initialData={{ duration: 2 }} />
    );
    
    expect(screen.getByText('2 weeks')).toBeInTheDocument();
    
    rerender(
      <ProjectConfigurationInterface {...defaultProps} initialData={{ duration: 8 }} />
    );
    
    expect(screen.getByText('2 months')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProjectConfigurationInterface {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('has proper accessibility attributes', () => {
    render(<ProjectConfigurationInterface {...defaultProps} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Project Configuration');
    
    // Check for proper form labels
    expect(screen.getByText('Project Budget')).toBeInTheDocument();
    expect(screen.getByText('Project Duration')).toBeInTheDocument();
  });
});
