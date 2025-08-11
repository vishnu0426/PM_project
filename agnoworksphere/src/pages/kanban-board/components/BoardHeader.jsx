import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import Select from '../../../components/ui/Select';

const BoardHeader = ({
  board,
  members,
  onBoardUpdate,
  onMemberInvite,
  onFilterChange,
  onSearchChange,
  searchQuery,
  activeFilters,
  canInviteMembers = true,
  organizationName = 'Organization',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [boardTitle, setBoardTitle] = useState(board.title);
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
  });

  const handleTitleSave = () => {
    if (boardTitle.trim() && boardTitle !== board.title) {
      onBoardUpdate({ title: boardTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setBoardTitle(board.title);
      setIsEditing(false);
    }
  };

  // Prepare filter options for Select components
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Members' },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  const dueDateOptions = [
    { value: 'all', label: 'All Due Dates' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Helper functions to handle filter changes
  const handlePriorityChange = (value) => {
    if (value === 'all') {
      onFilterChange({ ...activeFilters, priority: [] });
    } else {
      onFilterChange({ ...activeFilters, priority: [value] });
    }
  };

  const handleAssigneeChange = (value) => {
    if (value === 'all') {
      onFilterChange({ ...activeFilters, assignee: [] });
    } else {
      onFilterChange({ ...activeFilters, assignee: [value] });
    }
  };

  const handleDueDateChange = (value) => {
    if (value === 'all') {
      onFilterChange({ ...activeFilters, dueDate: [] });
      setShowCustomDateRange(false);
    } else if (value === 'custom') {
      setShowCustomDateRange(true);
    } else {
      onFilterChange({ ...activeFilters, dueDate: [value] });
      setShowCustomDateRange(false);
    }
  };

  const handleCustomDateRangeApply = () => {
    if (customDateRange.start && customDateRange.end) {
      onFilterChange({
        ...activeFilters,
        dueDate: ['custom'],
        customDateRange: customDateRange,
      });
      setShowCustomDateRange(false);
    }
  };

  // Get current filter values for display
  const getCurrentPriorityValue = () => {
    return activeFilters.priority?.length > 0
      ? activeFilters.priority[0]
      : 'all';
  };

  const getCurrentAssigneeValue = () => {
    return activeFilters.assignee?.length > 0
      ? activeFilters.assignee[0]
      : 'all';
  };

  const getCurrentDueDateValue = () => {
    return activeFilters.dueDate?.length > 0 ? activeFilters.dueDate[0] : 'all';
  };

  return (
    <div className='bg-surface border-b border-border px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* Left Section - Board Title and Breadcrumb */}
        <div className='flex items-center space-x-4'>
          <nav className='flex items-center space-x-2 text-sm text-text-secondary'>
            <Link
              to='/organization-settings'
              className='hover:text-text-primary transition-colors'
            >
              {organizationName}
            </Link>
            <Icon name='ChevronRight' size={16} />
            <span className='text-text-primary'>Projects</span>
          </nav>

          <div className='flex items-center space-x-3'>
            {isEditing ? (
              <input
                type='text'
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyPress}
                className='text-xl font-semibold bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary'
                autoFocus
              />
            ) : (
              <h1
                className='text-xl font-semibold text-text-primary cursor-pointer hover:text-primary transition-colors'
                onClick={() => setIsEditing(true)}
              >
                {board.title}
              </h1>
            )}

            {board.isPrivate && (
              <Icon name='Lock' size={16} className='text-text-secondary' />
            )}
          </div>
        </div>

        {/* Right Section - Actions and Members */}
        <div className='flex items-center space-x-4'>
          {/* Search */}
          <div className='relative'>
            <Input
              type='search'
              placeholder='Search cards...'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-64 pl-8'
            />
            <Icon
              name='Search'
              size={16}
              className='absolute left-2 top-1/2 transform -translate-y-1/2 text-text-secondary'
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            iconName='Filter'
            iconPosition='left'
          >
            Filter
          </Button>

          {/* Board Members */}
          <div className='flex items-center space-x-2'>
            <div className='flex -space-x-2'>
              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className='w-8 h-8 rounded-full border-2 border-surface bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground'
                  title={`${member.name} (${member.role})`}
                >
                  {member.avatar ? (
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      className='w-full h-full rounded-full object-cover'
                    />
                  ) : (
                    member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  )}
                </div>
              ))}
              {members.length > 5 && (
                <div className='w-8 h-8 rounded-full border-2 border-surface bg-muted flex items-center justify-center text-sm font-medium text-text-secondary'>
                  +{members.length - 5}
                </div>
              )}
            </div>

            {canInviteMembers && (
              <Button
                variant='outline'
                size='sm'
                onClick={onMemberInvite}
                iconName='UserPlus'
                iconPosition='left'
              >
                Invite
              </Button>
            )}
          </div>

          {/* Board Settings */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              /* Handle board settings */
            }}
          >
            <Icon name='Settings' size={18} />
          </Button>

          {/* Team Members Link */}
          <Link to='/team-members'>
            <Button variant='ghost' size='icon'>
              <Icon name='Users' size={18} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Dropdowns - Show when filter button is clicked */}
      {showFilters && (
        <div className='mt-4 p-4 bg-muted rounded-lg'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-text-primary'>Filters</h3>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onFilterChange({})}
            >
              Clear all
            </Button>
          </div>

          <div className='flex items-center space-x-4'>
            <Select
              placeholder='Filter by Assignee'
              options={assigneeOptions}
              value={getCurrentAssigneeValue()}
              onChange={handleAssigneeChange}
              className='min-w-[160px]'
            />
            <Select
              placeholder='Filter by Label'
              options={priorityOptions}
              value={getCurrentPriorityValue()}
              onChange={handlePriorityChange}
              className='min-w-[160px]'
            />
            <Select
              placeholder='Filter by Due Date'
              options={dueDateOptions}
              value={getCurrentDueDateValue()}
              onChange={handleDueDateChange}
              className='min-w-[160px]'
            />
          </div>

          {/* Custom Date Range Picker */}
          {showCustomDateRange && (
            <div className='mt-4 p-4 bg-background border border-border rounded-lg'>
              <h4 className='text-sm font-medium text-text-primary mb-3'>
                Custom Date Range
              </h4>
              <div className='flex items-center space-x-4'>
                <div className='flex flex-col'>
                  <label className='text-xs text-text-secondary mb-1'>
                    From
                  </label>
                  <input
                    type='date'
                    value={customDateRange.start}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className='px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>
                <div className='flex flex-col'>
                  <label className='text-xs text-text-secondary mb-1'>To</label>
                  <input
                    type='date'
                    value={customDateRange.end}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        end: e.target.value,
                      }))
                    }
                    className='px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>
                <div className='flex items-end space-x-2'>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={handleCustomDateRangeApply}
                    disabled={!customDateRange.start || !customDateRange.end}
                  >
                    Apply
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowCustomDateRange(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardHeader;
