import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MemberActivityModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const mockActivities = [
    {
      id: 1,
      type: 'card_created',
      description: 'Created card "Implement user authentication"',
      board: 'Development Sprint',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'Plus'
    },
    {
      id: 2,
      type: 'card_moved',
      description: 'Moved card "Fix login bug" from "In Progress" to "Done"',
      board: 'Bug Fixes',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: 'ArrowRight'
    },
    {
      id: 3,
      type: 'comment_added',
      description: 'Added comment on "Database optimization"',
      board: 'Performance Improvements',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      icon: 'MessageCircle'
    },
    {
      id: 4,
      type: 'board_created',
      description: 'Created new board "Q4 Planning"',
      board: 'Q4 Planning',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: 'Layout'
    },
    {
      id: 5,
      type: 'member_invited',
      description: 'Invited john.doe@company.com to join the team',
      board: 'Organization',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: 'UserPlus'
    },
    {
      id: 6,
      type: 'login',
      description: 'Logged in to the platform',
      board: 'System',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      icon: 'LogIn'
    }
  ];

  const formatTimestamp = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'card_created':
        return 'text-success bg-success/10';
      case 'card_moved':
        return 'text-primary bg-primary/10';
      case 'comment_added':
        return 'text-accent bg-accent/10';
      case 'board_created':
        return 'text-purple-600 bg-purple-100';
      case 'member_invited':
        return 'text-blue-600 bg-blue-100';
      case 'login':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-card border border-border rounded-lg shadow-focused w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Member Activity</h2>
            <p className="text-sm text-text-secondary mt-1">
              Recent activity for {member.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6">
          {/* Member Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-primary-foreground">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="font-semibold text-text-primary text-lg">{member.name}</div>
              <div className="text-text-secondary">{member.email}</div>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="text-text-secondary">
                  Role: <span className="font-medium capitalize">{member.role}</span>
                </span>
                <span className="text-text-secondary">
                  Status: <span className="font-medium capitalize">{member.status}</span>
                </span>
                <span className="text-text-secondary">
                  Last seen: {formatTimestamp(member.lastActivity)}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium text-text-primary">Recent Activity</h3>
            <div className="space-y-3">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    <Icon name={activity.icon} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium">{activity.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-text-secondary">
                      <span className="flex items-center space-x-1">
                        <Icon name="Layout" size={14} />
                        <span>{activity.board}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="Clock" size={14} />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-text-secondary">Cards Created</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success">18</div>
              <div className="text-sm text-text-secondary">Cards Completed</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent">42</div>
              <div className="text-sm text-text-secondary">Comments Added</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberActivityModal;