import React, { useState, useMemo, useEffect } from 'react';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import MemberTable from './components/MemberTable';
import MemberCard from './components/MemberCard';
import InviteMemberModal from './components/InviteMemberModal';
import EditRoleModal from './components/EditRoleModal';
import MemberActivityModal from './components/MemberActivityModal';
import RemoveMemberModal from './components/RemoveMemberModal';
import teamService from '../../utils/teamService';
import authService from '../../utils/authService';
import sessionService from '../../utils/sessionService';
import BulkActionsBar from './components/BulkActionsBar';

const TeamMembers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [currentOrganization, setCurrentOrganization] = useState(null);

  // Get role-specific features
  const getRoleFeatures = (role) => {
    const features = {
      viewer: {
        canInviteMembers: false,
        canManageMembers: false,
        canRemoveMembers: false,
      },
      member: {
        canInviteMembers: false,
        canManageMembers: false,
        canRemoveMembers: false,
      },
      admin: {
        canInviteMembers: true,
        canManageMembers: true,
        canRemoveMembers: true,
      },
      owner: {
        canInviteMembers: true,
        canManageMembers: true,
        canRemoveMembers: true,
      },
    };
    return features[role.toLowerCase()] || features.member;
  };

  const roleFeatures = getRoleFeatures(userRole);

  // Real team members data
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];

  // Load user and organization data
  useEffect(() => {
    const loadUserAndOrgData = async () => {
      try {
        const result = await authService.getCurrentUser();
        if (result.data && result.data.user) {
          setCurrentUser(result.data.user);
          setUserRole(
            result.data.user.organizationRole ||
              result.data.user.role ||
              sessionService.getUserRole() ||
              'member'
          );

          // Set current organization (first one for now)
          if (
            result.data.organizations &&
            result.data.organizations.length > 0
          ) {
            setCurrentOrganization(result.data.organizations[0]);
          } else {
            // Create a fallback organization if none exists
            setCurrentOrganization({
              id: 'fallback-org',
              name: 'Default Organization',
              domain: 'example.com',
            });
          }
        } else {
          // No user data, set fallbacks
          setCurrentUser({
            id: 'fallback-user',
            firstName: 'User',
            lastName: '',
            email: 'user@example.com',
            role: sessionService.getUserRole() || 'member',
          });

          setCurrentOrganization({
            id: 'fallback-org',
            name: 'Default Organization',
            domain: 'example.com',
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);

        // Set fallback data to prevent crashes and allow page to work
        setCurrentUser({
          id: 'fallback-user',
          firstName: 'User',
          lastName: '',
          email: 'user@example.com',
          role: 'member',
        });

        setCurrentOrganization({
          id: 'fallback-org',
          name: 'Default Organization',
          domain: 'example.com',
        });

        setUserRole(sessionService.getUserRole() || 'member');
      }
    };

    loadUserAndOrgData();
  }, []);

  // Load team members when organization is available
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!currentOrganization?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(
          'Loading team members for organization:',
          currentOrganization.id
        );

        const teamMembers = await teamService.getTeamMembers(
          currentOrganization.id,
          {
            search: searchQuery,
            role: roleFilter !== 'all' ? roleFilter : undefined,
            limit: 100, // Get more members for better filtering
          }
        );

        console.log('Loaded team members:', teamMembers);
        setMembers(teamMembers);
      } catch (error) {
        console.error('Failed to load team members:', error);

        // Set fallback team members to show something useful
        const fallbackMembers = [
          {
            id: 'current-user',
            name: `${currentUser?.firstName || 'Current'} ${
              currentUser?.lastName || 'User'
            }`.trim(),
            email: currentUser?.email || 'user@example.com',
            role: userRole || 'member',
            status: 'active',
            joinedDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            avatar: '/assets/images/avatar.jpg',
          },
        ];

        setMembers(fallbackMembers);
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, [currentOrganization, searchQuery, roleFilter]);

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        roleFilter === 'all' || member.role.toLowerCase() === roleFilter;
      const matchesStatus =
        statusFilter === 'all' || member.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort members
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'lastActivity') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [members, searchQuery, roleFilter, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleSelectMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredAndSortedMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredAndSortedMembers.map((member) => member.id));
    }
  };

  const handleInviteMembers = async (inviteData) => {
    if (!currentOrganization?.id) {
      console.error('No organization selected');
      return;
    }

    try {
      console.log('Inviting members:', inviteData);

      // Send invitations through API
      for (const email of inviteData.emails) {
        await teamService.inviteTeamMember(currentOrganization.id, {
          email,
          role: inviteData.role,
          message: inviteData.message,
        });
      }

      // Reload team members to show updated list
      const updatedMembers = await teamService.getTeamMembers(
        currentOrganization.id
      );
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Failed to invite members:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleEditRole = (member) => {
    setSelectedMember(member);
    setIsEditRoleModalOpen(true);
  };

  const handleUpdateRole = async (memberId, newRole) => {
    if (!currentOrganization?.id) {
      console.error('No organization selected');
      return;
    }

    try {
      console.log('Updating role:', memberId, newRole);

      await teamService.updateMemberRole(currentOrganization.id, memberId, {
        role: newRole,
      });

      // Update local state
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error) {
      console.error('Failed to update member role:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleViewActivity = (member) => {
    setSelectedMember(member);
    setIsActivityModalOpen(true);
  };

  const handleRemoveMember = (member) => {
    setSelectedMember(member);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async (memberId) => {
    if (!currentOrganization?.id) {
      console.error('No organization selected');
      return;
    }

    try {
      console.log('Removing member:', memberId);

      await teamService.removeMember(currentOrganization.id, memberId);

      // Update local state
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    } catch (error) {
      console.error('Failed to remove member:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    console.log('Bulk role change:', selectedMembers, newRole);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMembers((prev) =>
      prev.map((member) =>
        selectedMembers.includes(member.id)
          ? { ...member, role: newRole }
          : member
      )
    );
    setSelectedMembers([]);
  };

  const handleBulkRemove = async () => {
    console.log('Bulk remove:', selectedMembers);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMembers((prev) =>
      prev.filter((member) => !selectedMembers.includes(member.id))
    );
    setSelectedMembers([]);
  };

  const handleClearSelection = () => {
    setSelectedMembers([]);
  };

  return (
    <div className='min-h-screen bg-background'>
      <RoleBasedHeader
        userRole={userRole.toLowerCase()}
        currentUser={
          currentUser
            ? {
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                email: currentUser.email,
                avatar: currentUser.avatar || '/assets/images/avatar.jpg',
                role: userRole,
              }
            : {
                name: 'Loading...',
                email: '',
                avatar: '/assets/images/avatar.jpg',
                role: userRole,
              }
        }
        currentOrganization={currentOrganization}
      />

      <main className='pt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <Breadcrumb />

          {/* Page Header */}
          <div className='mb-8'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
                <Icon
                  name='Users'
                  size={20}
                  className='text-primary-foreground'
                />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-foreground'>
                  Team Members
                </h1>
                <p className='text-muted-foreground'>
                  Manage your organization's team members, roles, and
                  permissions
                </p>
              </div>
            </div>
            {roleFeatures.canInviteMembers && (
              <div className='flex justify-end'>
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  iconName='UserPlus'
                  iconPosition='left'
                >
                  Invite Members
                </Button>
              </div>
            )}
          </div>

          {/* Filters and Search */}
          <div className='bg-card border border-border rounded-lg p-6 mb-6 shadow-ambient'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
              <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
                <div className='w-full sm:w-80'>
                  <Input
                    type='search'
                    placeholder='Search members by name or email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full'
                  />
                </div>
                <div className='flex space-x-3'>
                  <Select
                    placeholder='Filter by role'
                    options={roleOptions}
                    value={roleFilter}
                    onChange={setRoleFilter}
                    className='min-w-[140px]'
                  />
                  <Select
                    placeholder='Filter by status'
                    options={statusOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className='min-w-[140px]'
                  />
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <div className='flex items-center bg-muted rounded-lg p-1'>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('table')}
                    iconName='Table'
                    className='h-8 w-8'
                  />
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('cards')}
                    iconName='Grid3X3'
                    className='h-8 w-8'
                  />
                </div>
                <div className='text-sm text-text-secondary'>
                  {filteredAndSortedMembers.length} of {members.length} members
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <BulkActionsBar
            selectedCount={selectedMembers.length}
            onBulkRoleChange={
              roleFeatures.canManageMembers ? handleBulkRoleChange : null
            }
            onBulkRemove={
              roleFeatures.canRemoveMembers ? handleBulkRemove : null
            }
            onClearSelection={handleClearSelection}
            canManageMembers={roleFeatures.canManageMembers}
            canRemoveMembers={roleFeatures.canRemoveMembers}
          />

          {/* Members List */}
          {viewMode === 'table' ? (
            <MemberTable
              members={filteredAndSortedMembers}
              sortConfig={sortConfig}
              onSort={handleSort}
              onEditRole={roleFeatures.canManageMembers ? handleEditRole : null}
              onViewActivity={handleViewActivity}
              onRemoveMember={
                roleFeatures.canRemoveMembers ? handleRemoveMember : null
              }
              selectedMembers={selectedMembers}
              onSelectMember={handleSelectMember}
              onSelectAll={handleSelectAll}
              canManageMembers={roleFeatures.canManageMembers}
              canRemoveMembers={roleFeatures.canRemoveMembers}
            />
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredAndSortedMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEditRole={
                    roleFeatures.canManageMembers ? handleEditRole : null
                  }
                  onViewActivity={handleViewActivity}
                  onRemoveMember={
                    roleFeatures.canRemoveMembers ? handleRemoveMember : null
                  }
                  canManageMembers={roleFeatures.canManageMembers}
                  canRemoveMembers={roleFeatures.canRemoveMembers}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedMembers.length === 0 && (
            <div className='text-center py-12'>
              <Icon
                name='Users'
                size={48}
                className='text-text-secondary mx-auto mb-4'
              />
              <h3 className='text-lg font-medium text-text-primary mb-2'>
                No members found
              </h3>
              <p className='text-text-secondary mb-6'>
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by inviting your first team member'}
              </p>
              {!searchQuery &&
                roleFilter === 'all' &&
                statusFilter === 'all' &&
                roleFeatures.canInviteMembers && (
                  <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    iconName='UserPlus'
                    iconPosition='left'
                  >
                    Invite Members
                  </Button>
                )}
            </div>
          )}

          {/* Modals */}
          <InviteMemberModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            onInvite={handleInviteMembers}
          />

          <EditRoleModal
            isOpen={isEditRoleModalOpen}
            onClose={() => setIsEditRoleModalOpen(false)}
            member={selectedMember}
            onUpdateRole={handleUpdateRole}
          />

          <MemberActivityModal
            isOpen={isActivityModalOpen}
            onClose={() => setIsActivityModalOpen(false)}
            member={selectedMember}
          />

          <RemoveMemberModal
            isOpen={isRemoveModalOpen}
            onClose={() => setIsRemoveModalOpen(false)}
            member={selectedMember}
            onRemove={handleConfirmRemove}
          />
        </div>
      </main>
    </div>
  );
};

export default TeamMembers;
