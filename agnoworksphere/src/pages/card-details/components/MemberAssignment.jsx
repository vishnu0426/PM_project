import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import {
  getAssignableMembers,
  getAssignmentRestrictionMessage,
  getRolePermissions,
} from '../../../utils/rolePermissions';
import authService from '../../../utils/authService';
import sessionService from '../../../utils/sessionService';

const MemberAssignment = ({
  card,
  onMembersChange,
  canEdit,
  hasChanged = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const dropdownRef = useRef(null);

  // Real organization members should be loaded from team service
  const organizationMembers = [];

  // Load user data for role-based permissions
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userResult = await authService.getCurrentUser();
        if (userResult.data.user) {
          setCurrentUser(userResult.data.user);
          setUserRole(
            userResult.data.user.organizationRole ||
              userResult.data.user.role ||
              sessionService.getUserRole() ||
              'member'
          );
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setUserRole(sessionService.getUserRole() || 'member');
      }
    };

    loadUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter members based on role permissions
  const assignableMembers = currentUser
    ? getAssignableMembers(organizationMembers, userRole, currentUser.id)
    : organizationMembers;

  const filteredMembers = assignableMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rolePermissions = getRolePermissions(userRole);
  const assignmentRestrictionMessage =
    getAssignmentRestrictionMessage(userRole);

  const assignedMembers = organizationMembers.filter((member) =>
    card.assignedMembers?.includes(member.id)
  );

  const handleMemberToggle = (memberId) => {
    const currentMembers = card.assignedMembers || [];
    const updatedMembers = currentMembers.includes(memberId)
      ? currentMembers.filter((id) => id !== memberId)
      : [...currentMembers, memberId];

    onMembersChange(updatedMembers);
  };

  const handleRemoveMember = (memberId) => {
    const updatedMembers = (card.assignedMembers || []).filter(
      (id) => id !== memberId
    );
    onMembersChange(updatedMembers);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <Icon name='Users' size={16} className='text-text-secondary' />
          <h4 className='font-medium text-text-primary'>Members</h4>
          {hasChanged && (
            <div className='flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-md'>
              <Icon name='Edit' size={12} />
              <span>Modified</span>
            </div>
          )}
        </div>
        {canEdit && rolePermissions.canAssignTasksToSelf && (
          <div className='relative' ref={dropdownRef}>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={assignableMembers.length === 0}
              title={
                assignableMembers.length === 0
                  ? assignmentRestrictionMessage
                  : 'Add member'
              }
            >
              <Icon name='Plus' size={16} />
            </Button>

            {isDropdownOpen && (
              <div className='absolute top-full right-0 mt-1 w-72 bg-popover border border-border rounded-md shadow-elevated z-1010'>
                <div className='p-3'>
                  <div className='relative mb-3'>
                    <Icon
                      name='Search'
                      size={16}
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary'
                    />
                    <input
                      type='text'
                      placeholder='Search members...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent'
                    />
                  </div>

                  {/* Role-based assignment restriction message */}
                  {!rolePermissions.canAssignTasksToOthers && (
                    <div className='mb-3 p-2 bg-muted/50 rounded-md'>
                      <div className='flex items-start space-x-2'>
                        <Icon
                          name='Info'
                          size={14}
                          className='text-text-secondary mt-0.5 flex-shrink-0'
                        />
                        <p className='text-xs text-text-secondary'>
                          {assignmentRestrictionMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className='max-h-48 overflow-y-auto space-y-1'>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => handleMemberToggle(member.id)}
                          className='w-full flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-micro text-left'
                        >
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            className='w-8 h-8 rounded-full object-cover'
                          />
                          <div className='flex-1 min-w-0'>
                            <div className='font-medium text-text-primary truncate'>
                              {member.name}
                            </div>
                            <div className='text-xs text-text-secondary truncate'>
                              {member.role}
                            </div>
                          </div>
                          {card.assignedMembers?.includes(member.id) && (
                            <Icon
                              name='Check'
                              size={16}
                              className='text-success'
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className='text-center py-4 text-text-secondary text-sm'>
                        {assignableMembers.length === 0
                          ? 'No members available for assignment'
                          : 'No members found'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='space-y-2'>
        {assignedMembers.length > 0 ? (
          assignedMembers.map((member) => (
            <div
              key={member.id}
              className='flex items-center justify-between p-2 bg-muted rounded-md'
            >
              <div className='flex items-center space-x-3'>
                <Image
                  src={member.avatar}
                  alt={member.name}
                  className='w-8 h-8 rounded-full object-cover'
                />
                <div>
                  <div className='font-medium text-text-primary text-sm'>
                    {member.name}
                  </div>
                  <div className='text-xs text-text-secondary'>
                    {member.role}
                  </div>
                </div>
              </div>
              {canEdit && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleRemoveMember(member.id)}
                  className='text-text-secondary hover:text-destructive'
                >
                  <Icon name='X' size={14} />
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className='text-text-secondary text-sm italic'>
            No members assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberAssignment;
