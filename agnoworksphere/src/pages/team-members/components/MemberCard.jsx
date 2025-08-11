import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MemberCard = ({ member, onEditRole, onViewActivity, onRemoveMember, canManageMembers, canRemoveMembers }) => {
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return activityDate.toLocaleDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-ambient">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={member.avatar}
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{member.name}</h3>
            <p className="text-sm text-text-secondary">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {canManageMembers && onEditRole && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditRole(member)}
              className="h-8 w-8"
            >
              <Icon name="Edit" size={16} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewActivity(member)}
            className="h-8 w-8"
          >
            <Icon name="Activity" size={16} />
          </Button>
          {canRemoveMembers && onRemoveMember && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveMember(member)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
          {member.role}
        </span>
        <span className="text-xs text-text-secondary">
          {formatLastActivity(member.lastActivity)}
        </span>
      </div>
    </div>
  );
};

export default MemberCard;