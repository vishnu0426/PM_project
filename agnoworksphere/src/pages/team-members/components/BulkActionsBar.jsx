import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsBar = ({ selectedCount, onBulkRoleChange, onBulkRemove, onClearSelection, canManageMembers, canRemoveMembers }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const actionOptions = [
    ...(canManageMembers ? [{ value: 'change_role', label: 'Change Role' }] : []),
    ...(canRemoveMembers ? [{ value: 'remove_members', label: 'Remove Members' }] : [])
  ];

  const roleOptions = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' }
  ];

  const handleApplyAction = async () => {
    if (!selectedAction) return;

    setIsLoading(true);
    try {
      if (selectedAction === 'change_role' && selectedRole && canManageMembers && onBulkRoleChange) {
        await onBulkRoleChange(selectedRole);
      } else if (selectedAction === 'remove_members' && canRemoveMembers && onBulkRemove) {
        const confirmed = window.confirm(
          `Are you sure you want to remove ${selectedCount} member${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`
        );
        if (confirmed) {
          await onBulkRemove();
        }
      }
      
      // Reset selections
      setSelectedAction('');
      setSelectedRole('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedCount === 0 || actionOptions.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-text-primary">
              {selectedCount} member{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Select
              placeholder="Choose action..."
              options={actionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              className="min-w-[150px]"
            />

            {selectedAction === 'change_role' && (
              <Select
                placeholder="Select role..."
                options={roleOptions}
                value={selectedRole}
                onChange={setSelectedRole}
                className="min-w-[120px]"
              />
            )}

            <Button
              onClick={handleApplyAction}
              loading={isLoading}
              disabled={!selectedAction || (selectedAction === 'change_role' && !selectedRole)}
              iconName="Play"
              iconPosition="left"
              size="sm"
            >
              Apply
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          iconName="X"
          iconPosition="left"
        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;