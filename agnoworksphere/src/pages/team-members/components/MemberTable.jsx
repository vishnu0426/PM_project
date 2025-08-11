import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MemberTable = ({ members, sortConfig, onSort, onEditRole, onViewActivity, onRemoveMember, selectedMembers, onSelectMember, onSelectAll, canManageMembers, canRemoveMembers }) => {
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

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <Icon name="ArrowUpDown" size={16} className="text-text-secondary" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={16} className="text-primary" />
      : <Icon name="ArrowDown" size={16} className="text-primary" />;
  };

  const isAllSelected = members.length > 0 && selectedMembers.length === members.length;
  const isIndeterminate = selectedMembers.length > 0 && selectedMembers.length < members.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-ambient">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={onSelectAll}
                  className="rounded border-border text-primary focus:ring-primary"
                />
              </th>
              <th 
                className="text-left px-4 py-3 font-medium text-text-primary cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center space-x-2">
                  <span>Member</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 font-medium text-text-primary cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => onSort('role')}
              >
                <div className="flex items-center space-x-2">
                  <span>Role</span>
                  {getSortIcon('role')}
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 font-medium text-text-primary cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => onSort('lastActivity')}
              >
                <div className="flex items-center space-x-2">
                  <span>Last Activity</span>
                  {getSortIcon('lastActivity')}
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 font-medium text-text-primary cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center space-x-2">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="text-right px-4 py-3 font-medium text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => onSelectMember(member.id)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{member.name}</div>
                      <div className="text-sm text-text-secondary">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-text-secondary">
                  {formatLastActivity(member.lastActivity)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${getStatusColor(member.status)} rounded-full`}></div>
                    <span className="text-sm text-text-secondary capitalize">{member.status}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end space-x-1">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberTable;