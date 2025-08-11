import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const EditRoleModal = ({ isOpen, onClose, member, onUpdateRole }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { 
      value: 'viewer', 
      label: 'Viewer', 
      description: 'Read-only access to boards, cards, and comments' 
    },
    { 
      value: 'member', 
      label: 'Member', 
      description: 'Can create and edit cards, add comments, drag-drop' 
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Can manage boards, columns, and invite users' 
    },
    { 
      value: 'owner', 
      label: 'Owner', 
      description: 'Full organizational control and multi-org management' 
    }
  ];

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role.toLowerCase());
    }
  }, [member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onUpdateRole(member.id, selectedRole);
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !member) return null;

  const getRolePermissions = (role) => {
    switch (role) {
      case 'viewer':
        return [
          'View boards and cards',
          'Read comments and checklists',
          'View team member profiles',
          'Access organization dashboard'
        ];
      case 'member':
        return [
          'All Viewer permissions',
          'Create and edit cards',
          'Add comments and checklists',
          'Drag and drop cards',
          'Assign themselves to cards'
        ];
      case 'admin':
        return [
          'All Member permissions',
          'Create and manage boards',
          'Manage board columns',
          'Invite new team members',
          'Assign members to cards',
          'Manage board settings'
        ];
      case 'owner':
        return [
          'All Admin permissions',
          'Full organizational control',
          'Manage organization settings',
          'Remove team members',
          'Transfer ownership',
          'Multi-organization management'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative bg-card border border-border rounded-lg shadow-focused w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Edit Member Role</h2>
            <p className="text-sm text-text-secondary mt-1">
              Change role for {member.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="font-medium text-text-primary">{member.name}</div>
              <div className="text-sm text-text-secondary">{member.email}</div>
              <div className="text-xs text-text-secondary mt-1">
                Current role: <span className="font-medium capitalize">{member.role}</span>
              </div>
            </div>
          </div>

          <div>
            <Select
              label="New Role"
              description="Select the new role for this team member"
              options={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
              required
            />
          </div>

          {selectedRole && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="Shield" size={20} className="text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-text-primary mb-2">
                    {roleOptions.find(r => r.value === selectedRole)?.label} Permissions
                  </p>
                  <ul className="text-text-secondary space-y-1">
                    {getRolePermissions(selectedRole).map((permission, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Icon name="Check" size={14} className="text-success" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
              disabled={selectedRole === member.role.toLowerCase()}
            >
              Update Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;