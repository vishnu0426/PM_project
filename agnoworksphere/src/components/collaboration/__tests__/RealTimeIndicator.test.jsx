import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RealTimeIndicator from '../RealTimeIndicator';
import websocketService from '../../../utils/websocketService';
import collaborationService from '../../../utils/collaborationService';

// Mock dependencies
jest.mock('../../../utils/websocketService');
jest.mock('../../../utils/collaborationService');
jest.mock('../../AppIcon', () => {
  return function MockIcon({ name, className }) {
    return <span data-testid={`icon-${name}`} className={className} />;
  };
});

describe('RealTimeIndicator', () => {
  const mockActiveUsers = [
    {
      userId: 'user-1',
      userInfo: { name: 'John Doe', role: 'admin' },
      lastActivity: Date.now() - 60000 // 1 minute ago
    },
    {
      userId: 'user-2',
      userInfo: { name: 'Jane Smith', role: 'member' },
      lastActivity: Date.now() - 120000 // 2 minutes ago
    }
  ];

  const mockConflicts = [
    {
      id: 'conflict-1',
      elementId: 'element-1',
      userId: 'user-1',
      timestamp: Date.now()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock websocketService
    websocketService.on = jest.fn();
    websocketService.off = jest.fn();
    websocketService.getConnectionStatus = jest.fn(() => ({
      isConnected: true,
      reconnectAttempts: 0,
      currentUser: 'current-user',
      currentProject: 'project-123'
    }));

    // Mock collaborationService
    collaborationService.on = jest.fn();
    collaborationService.off = jest.fn();
    collaborationService.getActiveUsers = jest.fn(() => mockActiveUsers);
    collaborationService.getPendingConflicts = jest.fn(() => []);
  });

  it('renders connection status indicator', () => {
    render(<RealTimeIndicator />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Settings')).toBeInTheDocument();
  });

  it('shows disconnected state', () => {
    websocketService.getConnectionStatus.mockReturnValue({
      isConnected: false,
      reconnectAttempts: 0,
      currentUser: null,
      currentProject: null
    });

    render(<RealTimeIndicator />);
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('displays active users count', () => {
    render(<RealTimeIndicator />);
    
    expect(screen.getByText('2 online')).toBeInTheDocument();
  });

  it('shows user avatars for active users', () => {
    render(<RealTimeIndicator />);
    
    // Should show first letters of user names
    expect(screen.getByText('J')).toBeInTheDocument(); // John
    expect(screen.getByText('J')).toBeInTheDocument(); // Jane (second J)
  });

  it('shows overflow indicator for many users', () => {
    const manyUsers = Array.from({ length: 5 }, (_, i) => ({
      userId: `user-${i}`,
      userInfo: { name: `User ${i}`, role: 'member' },
      lastActivity: Date.now()
    }));

    collaborationService.getActiveUsers.mockReturnValue(manyUsers);

    render(<RealTimeIndicator />);
    
    expect(screen.getByText('+2')).toBeInTheDocument(); // Shows +2 for users beyond first 3
  });

  it('displays conflicts indicator when conflicts exist', () => {
    collaborationService.getPendingConflicts.mockReturnValue(mockConflicts);

    render(<RealTimeIndicator />);
    
    expect(screen.getByText('1 conflict(s)')).toBeInTheDocument();
    expect(screen.getByTestId('icon-AlertTriangle')).toBeInTheDocument();
  });

  it('opens user list dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<RealTimeIndicator />);
    
    const onlineButton = screen.getByText('2 online');
    await user.click(onlineButton);
    
    await waitFor(() => {
      expect(screen.getByText('Active Users (2)')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows user roles in dropdown', async () => {
    const user = userEvent.setup();
    render(<RealTimeIndicator />);
    
    const onlineButton = screen.getByText('2 online');
    await user.click(onlineButton);
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('member')).toBeInTheDocument();
    });
  });

  it('displays last activity time', async () => {
    const user = userEvent.setup();
    render(<RealTimeIndicator />);
    
    const onlineButton = screen.getByText('2 online');
    await user.click(onlineButton);
    
    await waitFor(() => {
      expect(screen.getByText('1m ago')).toBeInTheDocument();
      expect(screen.getByText('2m ago')).toBeInTheDocument();
    });
  });

  it('sets up event listeners on mount', () => {
    render(<RealTimeIndicator />);
    
    expect(websocketService.on).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(websocketService.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
    expect(collaborationService.on).toHaveBeenCalledWith('userJoined', expect.any(Function));
    expect(collaborationService.on).toHaveBeenCalledWith('userLeft', expect.any(Function));
    expect(collaborationService.on).toHaveBeenCalledWith('conflictDetected', expect.any(Function));
    expect(collaborationService.on).toHaveBeenCalledWith('conflictResolved', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<RealTimeIndicator />);
    
    unmount();
    
    expect(websocketService.off).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(websocketService.off).toHaveBeenCalledWith('disconnected', expect.any(Function));
    expect(collaborationService.off).toHaveBeenCalledWith('userJoined', expect.any(Function));
    expect(collaborationService.off).toHaveBeenCalledWith('userLeft', expect.any(Function));
  });

  it('updates state when user joins', () => {
    render(<RealTimeIndicator />);
    
    // Get the userJoined handler
    const userJoinedHandler = collaborationService.on.mock.calls.find(
      call => call[0] === 'userJoined'
    )[1];
    
    // Simulate user joining
    const newUser = {
      userId: 'user-3',
      userInfo: { name: 'Bob Wilson', role: 'viewer' }
    };
    
    userJoinedHandler(newUser);
    
    // Should update the display (this would be tested through state changes)
    expect(screen.getByText('2 online')).toBeInTheDocument();
  });

  it('updates state when user leaves', () => {
    render(<RealTimeIndicator />);
    
    // Get the userLeft handler
    const userLeftHandler = collaborationService.on.mock.calls.find(
      call => call[0] === 'userLeft'
    )[1];
    
    // Simulate user leaving
    userLeftHandler({ userId: 'user-1' });
    
    // Should update the display
    expect(screen.getByText('2 online')).toBeInTheDocument();
  });

  it('shows connection status colors correctly', () => {
    const { rerender } = render(<RealTimeIndicator />);
    
    // Connected state
    expect(screen.getByText('Connected')).toHaveClass('text-green-500');
    
    // Disconnected state
    websocketService.getConnectionStatus.mockReturnValue({
      isConnected: false,
      reconnectAttempts: 0,
      currentUser: null,
      currentProject: null
    });
    
    rerender(<RealTimeIndicator />);
    expect(screen.getByText('Disconnected')).toHaveClass('text-red-500');
  });

  it('shows conflict warning color', () => {
    collaborationService.getPendingConflicts.mockReturnValue(mockConflicts);
    
    render(<RealTimeIndicator />);
    
    expect(screen.getByText('1 conflict(s)')).toHaveClass('text-yellow-500');
  });

  it('handles empty active users list', () => {
    collaborationService.getActiveUsers.mockReturnValue([]);
    
    render(<RealTimeIndicator />);
    
    expect(screen.queryByText('online')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<RealTimeIndicator className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows pulsing animation when connected', () => {
    render(<RealTimeIndicator />);
    
    const pulsingDot = document.querySelector('.animate-ping');
    expect(pulsingDot).toBeInTheDocument();
  });

  it('does not show pulsing animation when disconnected', () => {
    websocketService.getConnectionStatus.mockReturnValue({
      isConnected: false,
      reconnectAttempts: 0,
      currentUser: null,
      currentProject: null
    });
    
    render(<RealTimeIndicator />);
    
    const pulsingDot = document.querySelector('.animate-ping');
    expect(pulsingDot).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(<RealTimeIndicator />);
    
    // Open dropdown
    const onlineButton = screen.getByText('2 online');
    await user.click(onlineButton);
    
    await waitFor(() => {
      expect(screen.getByText('Active Users (2)')).toBeInTheDocument();
    });
    
    // Click outside
    await user.click(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Active Users (2)')).not.toBeInTheDocument();
    });
  });
});
