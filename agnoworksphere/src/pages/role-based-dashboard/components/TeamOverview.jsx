import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TeamOverview = ({ teamMembers, userRole, onInviteMembers }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Online': 'bg-success',
      'Away': 'bg-warning',
      'Busy': 'bg-error',
      'Offline': 'bg-muted'
    };
    return colors[status] || 'bg-muted';
  };

  const getRoleColor = (role) => {
    const colors = {
      'Owner': 'text-primary',
      'Admin': 'text-accent',
      'Member': 'text-success',
      'Viewer': 'text-text-secondary'
    };
    return colors[role] || 'text-text-secondary';
  };

  const canManageTeam = userRole === 'Owner' || userRole === 'Admin';

  const teamStats = {
    total: teamMembers.length,
    online: teamMembers.filter(member => member.status === 'Online').length,
    active: teamMembers.filter(member => member.lastActive && new Date(member.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">
          Team Overview
        </h3>
        {canManageTeam && (
          <Button
            variant="outline"
            size="sm"
            iconName="UserPlus"
            iconPosition="left"
            onClick={onInviteMembers}
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-xl font-semibold text-text-primary">
            {teamStats.total}
          </div>
          <div className="text-xs text-text-secondary">Total Members</div>
        </div>
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-xl font-semibold text-success">
            {teamStats.online}
          </div>
          <div className="text-xs text-text-secondary">Online Now</div>
        </div>
        <div className="text-center p-3 bg-accent/10 rounded-lg">
          <div className="text-xl font-semibold text-accent">
            {teamStats.active}
          </div>
          <div className="text-xs text-text-secondary">Active Today</div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary mb-3">
          Team Members
        </h4>
        
        {teamMembers.slice(0, 6).map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-150">
            <div className="relative flex-shrink-0">
              <Image
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="text-sm font-medium text-text-primary truncate">
                  {member.name}
                </h5>
                <span className={`text-xs font-medium ${getRoleColor(member.role)}`}>
                  {member.role}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <Icon name="Mail" size={12} />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.department && (
                  <div className="flex items-center gap-1">
                    <Icon name="Building" size={12} />
                    <span>{member.department}</span>
                  </div>
                )}
              </div>
              
              {member.currentTask && (
                <div className="flex items-center gap-1 mt-1">
                  <Icon name="Clock" size={12} className="text-accent" />
                  <span className="text-xs text-accent truncate">
                    Working on: {member.currentTask}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Icon name="CheckSquare" size={12} />
                <span>{member.tasksCompleted || 0}</span>
              </div>
              
              {canManageTeam && (
                <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
              )}
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary mb-2">No team members found</p>
          {canManageTeam && (
            <Button variant="outline" iconName="UserPlus" iconPosition="left">
              Invite your first team member
            </Button>
          )}
        </div>
      )}

      {teamMembers.length > 6 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" className="w-full" iconName="ArrowRight" iconPosition="right">
            View All Members ({teamMembers.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamOverview;