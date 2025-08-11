import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TechStackDisplay from '../TechStackDisplay';

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

describe('TechStackDisplay', () => {
  const defaultProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    initialData: {},
    className: 'test-class'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with technology categories', () => {
    render(<TechStackDisplay {...defaultProps} />);
    
    expect(screen.getByText('Technology Stack')).toBeInTheDocument();
    expect(screen.getByText('Select the technologies and tools for your project')).toBeInTheDocument();
    
    // Check for technology categories
    expect(screen.getByText('Frontend Technologies')).toBeInTheDocument();
    expect(screen.getByText('Backend Technologies')).toBeInTheDocument();
    expect(screen.getByText('Database Technologies')).toBeInTheDocument();
    expect(screen.getByText('Cloud & Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Development Tools')).toBeInTheDocument();
  });

  it('displays technology cards for each category', () => {
    render(<TechStackDisplay {...defaultProps} />);
    
    // Check for specific technologies
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue.js')).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
  });

  it('shows technology selection count', () => {
    render(<TechStackDisplay {...defaultProps} />);
    
    expect(screen.getByText('0 technologies selected')).toBeInTheDocument();
  });

  it('toggles technology selection when clicked', async () => {
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} />);
    
    // Find and click React technology card
    const reactCard = screen.getByText('React').closest('div[class*="cursor-pointer"]');
    expect(reactCard).toBeInTheDocument();
    
    await user.click(reactCard);
    
    // Check if selection count updated
    await waitFor(() => {
      expect(screen.getByText('1 technologies selected')).toBeInTheDocument();
    });
  });

  it('opens technology details modal when info button is clicked', async () => {
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} />);
    
    // Find info button for React (assuming it's the first info button)
    const infoButtons = screen.getAllByTestId('icon-Info');
    expect(infoButtons.length).toBeGreaterThan(0);
    
    await user.click(infoButtons[0].closest('button'));
    
    // Check if modal opened
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('displays technology details in modal', async () => {
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} />);
    
    // Click info button for React
    const infoButtons = screen.getAllByTestId('icon-Info');
    await user.click(infoButtons[0].closest('button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      // Check for technology details
      expect(screen.getByText('Pros')).toBeInTheDocument();
      expect(screen.getByText('Cons')).toBeInTheDocument();
      expect(screen.getByText('Common Use Cases')).toBeInTheDocument();
    });
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} />);
    
    // Open modal
    const infoButtons = screen.getAllByTestId('icon-Info');
    await user.click(infoButtons[0].closest('button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('shows selected technologies summary', async () => {
    const user = userEvent.setup();
    const initialData = {
      frontend: ['react'],
      backend: ['nodejs']
    };
    
    render(<TechStackDisplay {...defaultProps} initialData={initialData} />);
    
    // Should show selected technology stack summary
    expect(screen.getByText('Selected Technology Stack')).toBeInTheDocument();
    expect(screen.getByText('Frontend Technologies')).toBeInTheDocument();
    expect(screen.getByText('Backend Technologies')).toBeInTheDocument();
  });

  it('displays technology popularity and learning curve', () => {
    render(<TechStackDisplay {...defaultProps} />);
    
    // Check for popularity indicators (percentages)
    expect(screen.getByText('95%')).toBeInTheDocument(); // React popularity
    expect(screen.getByText('85%')).toBeInTheDocument(); // Vue popularity
    
    // Check for learning curve indicators
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('shows category selection counts', async () => {
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} />);
    
    // Initially should show 0 selected for each category
    const categoryHeaders = screen.getAllByText('0 selected');
    expect(categoryHeaders.length).toBeGreaterThan(0);
    
    // Select a technology and check if count updates
    const reactCard = screen.getByText('React').closest('div[class*="cursor-pointer"]');
    await user.click(reactCard);
    
    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });

  it('calls onNext with selected technologies', async () => {
    const onNext = jest.fn();
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} onNext={onNext} />);
    
    // Select some technologies
    const reactCard = screen.getByText('React').closest('div[class*="cursor-pointer"]');
    await user.click(reactCard);
    
    // Click next button
    const nextButton = screen.getByText('Continue to Workflow');
    await user.click(nextButton);
    
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({
      frontend: expect.arrayContaining(['react'])
    }));
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} onBack={onBack} />);
    
    const backButton = screen.getByText('Back to Overview');
    await user.click(backButton);
    
    expect(onBack).toHaveBeenCalled();
  });

  it('loads initial data correctly', () => {
    const initialData = {
      frontend: ['react', 'vue'],
      backend: ['nodejs'],
      database: ['postgresql']
    };
    
    render(<TechStackDisplay {...defaultProps} initialData={initialData} />);
    
    expect(screen.getByText('3 technologies selected')).toBeInTheDocument();
  });

  it('shows step indicator', () => {
    render(<TechStackDisplay {...defaultProps} />);
    
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();
  });

  it('handles technology addition and removal from modal', async () => {
    const user = userEvent.setup();
    render(<TechStackDisplay {...defaultProps} />);
    
    // Open modal for React
    const infoButtons = screen.getAllByTestId('icon-Info');
    await user.click(infoButtons[0].closest('button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Find and click "Add to Stack" button
    const addButton = screen.getByText('Add to Stack');
    await user.click(addButton);
    
    // Modal should close and technology should be selected
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      expect(screen.getByText('1 technologies selected')).toBeInTheDocument();
    });
  });

  it('opens documentation link in new tab', async () => {
    const user = userEvent.setup();
    // Mock window.open
    const mockOpen = jest.fn();
    global.window.open = mockOpen;
    
    render(<TechStackDisplay {...defaultProps} />);
    
    // Open modal
    const infoButtons = screen.getAllByTestId('icon-Info');
    await user.click(infoButtons[0].closest('button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Click documentation button
    const docButton = screen.getByText('View Documentation');
    await user.click(docButton);
    
    expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining('http'), '_blank');
  });

  it('applies custom className', () => {
    const { container } = render(<TechStackDisplay {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('has proper accessibility attributes', () => {
    render(<TechStackDisplay {...defaultProps} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Technology Stack');
    
    // Check for clickable elements
    const techCards = screen.getAllByText('React')[0].closest('div[class*="cursor-pointer"]');
    expect(techCards).toBeInTheDocument();
  });

  it('shows technology icons and emojis', () => {
    render(<TechStackDisplay {...defaultProps} />);
    
    // Check for technology emojis/icons
    expect(screen.getByText('⚛️')).toBeInTheDocument(); // React
    expect(screen.getByText('🟢')).toBeInTheDocument(); // Vue/Node
    expect(screen.getByText('🐍')).toBeInTheDocument(); // Python
    expect(screen.getByText('🐘')).toBeInTheDocument(); // PostgreSQL
  });
});
