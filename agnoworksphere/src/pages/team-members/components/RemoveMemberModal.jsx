import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RemoveMemberModal = ({ isOpen, onClose, member, onRemove }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleRemove = async () => {
    if (confirmText !== 'REMOVE') {
      return;
    }

    setIsLoading(true);
    try {
      await onRemove(member.id);
      onClose();
      setConfirmText('');
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmText('');
      onClose();
    }
  };

  if (!isOpen || !member) return null;

  const isConfirmValid = confirmText === 'REMOVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative bg-card border border-border rounded-lg shadow-focused w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Remove Team Member</h2>
              <p className="text-sm text-text-secondary">This action cannot be undone</p>
            </div>
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

        <div className="p-6 space-y-6">
          {/* Member Info */}
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
                Role: <span className="font-medium capitalize">{member.role}</span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-2">Warning: This action is permanent</p>
                <ul className="text-text-secondary space-y-1">
                  <li>• {member.name} will lose access to all boards and projects</li>
                  <li>• Their comments and activity history will remain visible</li>
                  <li>• Cards assigned to them will become unassigned</li>
                  <li>• They will need a new invitation to rejoin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Type <span className="font-mono bg-muted px-1 rounded">REMOVE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type REMOVE to confirm"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive focus:border-destructive"
              disabled={isLoading}
            />
          </div>

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
              type="button"
              variant="destructive"
              onClick={handleRemove}
              loading={isLoading}
              disabled={!isConfirmValid}
              iconName="Trash2"
              iconPosition="left"
            >
              Remove Member
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveMemberModal;