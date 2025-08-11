import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ActivityTimeline = ({ card, onAddComment, canComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Real current user and activity data should be loaded from API
  const currentUser = {
    id: 1,
    name: 'User',
    avatar: '/assets/images/avatar.jpg'
  };

  // Real activity data should be loaded from API
  const activities = [];

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        type: 'comment',
        user: currentUser,
        content: newComment.trim(),
        timestamp: new Date(),
        mentions: extractMentions(newComment)
      };
      
      onAddComment(comment);
      setNewComment('');
      setIsCommenting(false);
    }
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+(?:\.\w+)*)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const renderActivityContent = (activity) => {
    if (activity.type === 'comment') {
      // Process mentions in comments
      let content = activity.content;
      if (activity.mentions && activity.mentions.length > 0) {
        activity.mentions.forEach(mention => {
          content = content.replace(
            new RegExp(`@${mention}`, 'g'),
            `<span class="text-primary font-medium">@${mention}</span>`
          );
        });
      }
      
      return (
        <div 
          className="text-text-primary"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    
    return (
      <div className="text-text-secondary">
        <span className="font-medium text-text-primary">{activity.user.name}</span>
        {' '}
        {activity.content}
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAddComment();
    } else if (e.key === 'Escape') {
      setIsCommenting(false);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Icon name="MessageSquare" size={20} className="text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary">Activity</h3>
      </div>

      {/* Add Comment Section */}
      {canComment && (
        <div className="flex space-x-3">
          <Image
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            {isCommenting ? (
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Write a comment... Use @username to mention someone"
                  className="w-full min-h-[80px] p-3 border border-border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-text-secondary">
                    Press Ctrl+Enter to post, Escape to cancel
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={handleAddComment}>
                      Comment
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsCommenting(false);
                        setNewComment('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCommenting(true)}
                className="w-full p-3 text-left text-text-secondary bg-muted rounded-md hover:bg-muted/80 transition-micro"
              >
                Write a comment...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex space-x-3">
            <Image
              src={activity.user.avatar}
              alt={activity.user.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-text-primary text-sm">
                  {activity.user.name}
                </span>
                <span className="text-xs text-text-secondary">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
              <div className="text-sm">
                {renderActivityContent(activity)}
              </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            <Icon name="MessageSquare" size={48} className="mx-auto mb-3 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Comments and updates will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;