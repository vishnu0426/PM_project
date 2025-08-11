import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
  const [emails, setEmails] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to boards and cards' },
    { value: 'member', label: 'Member', description: 'Can create and edit cards, add comments' },
    { value: 'admin', label: 'Admin', description: 'Can manage boards, columns, and invite users' },
    { value: 'owner', label: 'Owner', description: 'Full organizational control' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emailList = emails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emailList.length === 0) {
      alert('Please enter at least one valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await onInvite({
        emails: emailList,
        role: selectedRole,
        welcomeMessage: welcomeMessage.trim()
      });
      
      // Reset form
      setEmails('');
      setSelectedRole('member');
      setWelcomeMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmails('');
      setSelectedRole('member');
      setWelcomeMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative bg-card border border-border rounded-lg shadow-focused w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Invite Team Members</h2>
            <p className="text-sm text-text-secondary mt-1">
              Send invitations to new team members to join your organization
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
          <div>
            <Input
              label="Email Addresses"
              type="text"
              placeholder="Enter email addresses separated by commas or new lines"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              description="You can enter multiple email addresses separated by commas or line breaks"
              required
              className="min-h-[100px] resize-y"
              style={{ minHeight: '100px' }}
            />
          </div>

          <div>
            <Select
              label="Role Assignment"
              description="Select the role that will be assigned to all invited members"
              options={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
              required
            />
          </div>

          <div>
            <Input
              label="Welcome Message (Optional)"
              type="text"
              placeholder="Add a personal welcome message for the invited members..."
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              description="This message will be included in the invitation email"
              className="min-h-[80px] resize-y"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-text-primary mb-1">Invitation Process</p>
                <ul className="text-text-secondary space-y-1">
                  <li>• Invited members will receive an email with login credentials</li>
                  <li>• Temporary passwords will be generated automatically</li>
                  <li>• Members must change their password on first login</li>
                  <li>• Invitations expire after 7 days if not accepted</li>
                </ul>
              </div>
            </div>
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
              type="submit"
              loading={isLoading}
              iconName="Send"
              iconPosition="left"
            >
              Send Invitations
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;