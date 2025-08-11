import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
// Removed unused imports - using props instead of direct API calls

const MemberManagement = ({
  userRole = 'owner',
  currentUser,
  currentOrganization,
}) => {
  const [loading, setLoading] = useState(true);
  const [invitationSettings, setInvitationSettings] = useState({
    defaultRole: 'member',
    requireApproval: false,
    allowSelfRegistration: true,
    maxMembers: '100',
    invitationExpiry: '7',
  });

  const [members, setMembers] = useState([]);

  // Load organization members using props data (no redundant API calls)
  useEffect(() => {
    const loadMembers = () => {
      try {
        setLoading(true);

        // Use the currentUser prop that's already loaded by the parent component
        if (currentUser) {
          // Create a member entry for the current user
          const memberData = {
            id: currentUser.id,
            name:
              `${currentUser.firstName || ''} ${
                currentUser.lastName || ''
              }`.trim() ||
              currentUser.email?.split('@')[0] ||
              'User',
            email: currentUser.email,
            role: currentUser.role || userRole || 'owner',
            status: 'active',
            avatar: currentUser.avatar || currentUser.profilePicture || '',
            joinedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          };

          setMembers([memberData]);
        } else {
          // Fallback member data if no currentUser prop
          setMembers([
            {
              id: 'default-user',
              name: 'Current User',
              email: 'user@example.com',
              role: userRole || 'owner',
              status: 'active',
              avatar: '',
              joinedAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load members:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [currentUser, userRole]);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [inviteData, setInviteData] = useState({
    emails: '',
    role: 'member',
    message: '',
  });
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);

  const roleOptions = [
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
    {
      value: 'member',
      label: 'Member',
      description: 'Can create and edit cards',
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Can manage boards and members',
    },
    {
      value: 'owner',
      label: 'Owner',
      description: 'Full organizational control',
    },
  ];

  const expiryOptions = [
    { value: '1', label: '1 day' },
    { value: '3', label: '3 days' },
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' },
  ];

  const handleInvitationSettingChange = useCallback((field, value) => {
    setInvitationSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleMemberSelect = useCallback((memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  const allSelected = useMemo(
    () =>
      selectedMembers.length > 0 && selectedMembers.length === members.length,
    [selectedMembers, members.length]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedMembers((prev) =>
      prev.length === members.length ? [] : members.map((m) => m.id)
    );
  }, [members]);

  const handleRoleChange = useCallback((memberId, newRole) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  }, []);

  const handleStatusChange = useCallback((memberId, newStatus) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, status: newStatus } : member
      )
    );
  }, []);

  const handleInviteMembers = useCallback(async () => {
    setInviting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const emails = inviteData.emails
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
    const newMembers = emails.map((email, index) => ({
      id: Date.now() + index,
      name: email.split('@')[0],
      email,
      role: inviteData.role,
      status: 'pending',
      avatar: `https://randomuser.me/api/portraits/${
        index % 2 === 0 ? 'men' : 'women'
      }/${10 + index}.jpg`,
      joinedAt: null,
      lastActive: null,
    }));

    setMembers((prev) => [...prev, ...newMembers]);
    setInviteData({ emails: '', role: 'member', message: '' });
    setShowInviteForm(false);
    setInviting(false);
  }, [inviteData]);

  const handleBulkAction = useCallback(
    (action) => {
      switch (action) {
        case 'activate':
          setMembers((prev) =>
            prev.map((member) =>
              selectedMembers.includes(member.id)
                ? { ...member, status: 'active' }
                : member
            )
          );
          break;
        case 'deactivate':
          setMembers((prev) =>
            prev.map((member) =>
              selectedMembers.includes(member.id)
                ? { ...member, status: 'inactive' }
                : member
            )
          );
          break;
        case 'remove':
          setMembers((prev) =>
            prev.filter((member) => !selectedMembers.includes(member.id))
          );
          break;
      }
      setSelectedMembers([]);
      setShowBulkActions(false);
    },
    [selectedMembers]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    console.log('Member management settings saved');
  }, []);

  const getRoleColor = (role) => {
    const colors = {
      owner: 'bg-destructive text-destructive-foreground',
      admin: 'bg-warning text-warning-foreground',
      member: 'bg-primary text-primary-foreground',
      viewer: 'bg-secondary text-secondary-foreground',
    };
    return colors[role] || colors.viewer;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success text-success-foreground',
      pending: 'bg-warning text-warning-foreground',
      inactive: 'bg-muted text-muted-foreground',
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='space-y-8'>
      {/* Invitation Settings */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
            <Icon name='UserPlus' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Invitation Settings
            </h3>
            <p className='text-sm text-muted-foreground'>
              Configure how new members join your organization
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <Select
              label='Default Role for New Members'
              options={roleOptions}
              value={invitationSettings.defaultRole}
              onChange={(value) =>
                handleInvitationSettingChange('defaultRole', value)
              }
              description='Role assigned to new members by default'
            />

            <Input
              label='Maximum Members'
              type='number'
              value={invitationSettings.maxMembers}
              onChange={(e) =>
                handleInvitationSettingChange('maxMembers', e.target.value)
              }
              min='1'
              max='1000'
              description='Maximum number of members allowed'
            />

            <Select
              label='Invitation Expiry'
              options={expiryOptions}
              value={invitationSettings.invitationExpiry}
              onChange={(value) =>
                handleInvitationSettingChange('invitationExpiry', value)
              }
              description='How long invitations remain valid'
            />
          </div>

          <div className='space-y-4'>
            <Checkbox
              label='Require Admin Approval'
              description='New member requests must be approved by an admin'
              checked={invitationSettings.requireApproval}
              onChange={(e) =>
                handleInvitationSettingChange(
                  'requireApproval',
                  e.target.checked
                )
              }
            />

            <Checkbox
              label='Allow Self Registration'
              description='Users can join using the organization domain'
              checked={invitationSettings.allowSelfRegistration}
              onChange={(e) =>
                handleInvitationSettingChange(
                  'allowSelfRegistration',
                  e.target.checked
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-accent rounded-lg flex items-center justify-center'>
              <Icon name='Users' size={20} color='white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Organization Members
              </h3>
              <p className='text-sm text-muted-foreground'>
                {members.length} total members
              </p>
            </div>
          </div>
          <div className='flex space-x-2'>
            {selectedMembers.length > 0 && (
              <Button
                variant='outline'
                iconName='Settings'
                onClick={() => setShowBulkActions(true)}
              >
                Bulk Actions ({selectedMembers.length})
              </Button>
            )}
            <Button
              variant='default'
              iconName='UserPlus'
              onClick={() => setShowInviteForm(true)}
            >
              Invite Members
            </Button>
          </div>
        </div>

        {/* Member Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border'>
                <th className='text-left py-3 px-4'>
                  <Checkbox checked={allSelected} onChange={handleSelectAll} />
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Member
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Role
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Status
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Joined
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Last Active
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan='7' className='py-8 text-center'>
                    <div className='flex items-center justify-center space-x-2'>
                      <Icon name='Loader' size={20} className='animate-spin' />
                      <span className='text-muted-foreground'>
                        Loading members...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan='7' className='py-8 text-center'>
                    <div className='text-muted-foreground'>
                      <Icon
                        name='Users'
                        size={48}
                        className='mx-auto mb-2 opacity-50'
                      />
                      <p>No members found</p>
                      <p className='text-sm'>
                        Invite team members to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className='border-b border-border hover:bg-muted/50'
                  >
                    <td className='py-3 px-4'>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleMemberSelect(member.id)}
                      />
                    </td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center space-x-3'>
                        {member.avatar ? (
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            className='w-8 h-8 rounded-full object-cover'
                          />
                        ) : (
                          <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
                            <Icon
                              name='User'
                              size={16}
                              className='text-muted-foreground'
                            />
                          </div>
                        )}
                        <div>
                          <div className='font-medium text-foreground'>
                            {member.name}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='py-3 px-4'>
                      <Select
                        options={roleOptions}
                        value={member.role}
                        onChange={(value) => handleRoleChange(member.id, value)}
                        className='w-32'
                      />
                    </td>
                    <td className='py-3 px-4'>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className='py-3 px-4 text-sm text-muted-foreground'>
                      {formatDate(member.joinedAt)}
                    </td>
                    <td className='py-3 px-4 text-sm text-muted-foreground'>
                      {formatDate(member.lastActive)}
                    </td>
                    <td className='py-3 px-4'>
                      <div className='flex space-x-1'>
                        {member.status === 'pending' && (
                          <Button
                            variant='ghost'
                            size='xs'
                            iconName='Check'
                            onClick={() =>
                              handleStatusChange(member.id, 'active')
                            }
                          />
                        )}
                        {member.status === 'active' && (
                          <Button
                            variant='ghost'
                            size='xs'
                            iconName='Pause'
                            onClick={() =>
                              handleStatusChange(member.id, 'inactive')
                            }
                          />
                        )}
                        <Button
                          variant='ghost'
                          size='xs'
                          iconName='MoreHorizontal'
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Members Modal */}
      {showInviteForm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-foreground'>
                Invite Members
              </h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <Icon name='X' size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  Email Addresses
                </label>
                <textarea
                  value={inviteData.emails}
                  onChange={(e) =>
                    setInviteData((prev) => ({
                      ...prev,
                      emails: e.target.value,
                    }))
                  }
                  placeholder='Enter email addresses separated by commas'
                  rows={3}
                  className='w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none'
                />
              </div>

              <Select
                label='Role'
                options={roleOptions}
                value={inviteData.role}
                onChange={(value) =>
                  setInviteData((prev) => ({ ...prev, role: value }))
                }
              />

              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) =>
                    setInviteData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder='Add a personal message to the invitation'
                  rows={2}
                  className='w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none'
                />
              </div>
            </div>

            <div className='flex space-x-3 mt-6'>
              <Button
                variant='outline'
                onClick={() => setShowInviteForm(false)}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                variant='default'
                onClick={handleInviteMembers}
                loading={inviting}
                className='flex-1'
              >
                Send Invitations
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-foreground'>
                Bulk Actions
              </h3>
              <button
                onClick={() => setShowBulkActions(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <Icon name='X' size={20} />
              </button>
            </div>

            <p className='text-sm text-muted-foreground mb-6'>
              Select an action to apply to {selectedMembers.length} selected
              members:
            </p>

            <div className='space-y-3'>
              <Button
                variant='outline'
                onClick={() => handleBulkAction('activate')}
                className='w-full justify-start'
                iconName='Play'
              >
                Activate Members
              </Button>
              <Button
                variant='outline'
                onClick={() => handleBulkAction('deactivate')}
                className='w-full justify-start'
                iconName='Pause'
              >
                Deactivate Members
              </Button>
              <Button
                variant='destructive'
                onClick={() => handleBulkAction('remove')}
                className='w-full justify-start'
                iconName='Trash2'
              >
                Remove Members
              </Button>
            </div>

            <div className='flex space-x-3 mt-6'>
              <Button
                variant='outline'
                onClick={() => setShowBulkActions(false)}
                className='flex-1'
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className='flex justify-end pt-6 border-t border-border'>
        <Button
          variant='default'
          onClick={handleSave}
          loading={saving}
          iconName='Save'
          iconPosition='left'
        >
          Save Member Settings
        </Button>
      </div>
    </div>
  );
};

export default MemberManagement;
