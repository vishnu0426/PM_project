import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import Select from '../ui/Select';
import authService from '../../utils/authService';
import sessionService from '../../utils/sessionService';
import teamService from '../../utils/teamService';

const CreateProjectModal = ({
  isOpen,
  onClose,
  onCreateProject,
  organizationId,
  organizationName,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    projectManager: '',
    teamMembers: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('member');

  // Load team members and user role when modal opens
  useEffect(() => {
    if (isOpen && organizationId) {
      loadTeamMembers();
      loadUserRole();
    }
  }, [isOpen, organizationId]);

  const loadTeamMembers = async () => {
    try {
      const members = await teamService.getTeamMembers(organizationId);
      const memberOptions = members.map((member) => ({
        value: member.id,
        label: `${member.name} (${member.email})`,
        role: member.role,
      }));
      setTeamMembers(memberOptions);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const loadUserRole = async () => {
    try {
      const userResponse = await authService.getCurrentUser();
      if (userResponse.data && userResponse.data.user) {
        setCurrentUserRole(
          userResponse.data.user.organizationRole ||
            userResponse.data.user.role ||
            sessionService.getUserRole() ||
            'member'
        );
      }
    } catch (error) {
      console.error('Failed to load user role:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      setError('End date must be after start date');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        projectManager: formData.projectManager || null,
        teamMembers: formData.teamMembers || [],
      };

      // Only include budget if user is owner
      if (currentUserRole === 'owner' && formData.budget) {
        projectData.budget = parseFloat(formData.budget);
      }

      await onCreateProject(projectData);

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        budget: '',
        startDate: '',
        endDate: '',
        projectManager: '',
        teamMembers: [],
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        budget: '',
        startDate: '',
        endDate: '',
        projectManager: '',
        teamMembers: [],
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Create New Project
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className='text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          {/* Organization Info */}
          <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <span className='font-medium'>Organization:</span>{' '}
              {organizationName}
            </p>
          </div>

          {/* Project Name */}
          <div className='mb-4'>
            <label
              htmlFor='projectName'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Project Name *
            </label>
            <Input
              id='projectName'
              type='text'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='Enter project name'
              disabled={isLoading}
              className='w-full'
            />
          </div>

          {/* Project Description */}
          <div className='mb-4'>
            <label
              htmlFor='projectDescription'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Description
            </label>
            <Textarea
              id='projectDescription'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='Enter project description (optional)'
              disabled={isLoading}
              rows={3}
              className='w-full'
            />
          </div>

          {/* Budget - Only visible to owners */}
          {currentUserRole === 'owner' && (
            <div className='mb-4'>
              <label
                htmlFor='projectBudget'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Budget (USD)
              </label>
              <Input
                id='projectBudget'
                type='number'
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder='Enter project budget'
                disabled={isLoading}
                className='w-full'
                min='0'
                step='0.01'
              />
            </div>
          )}

          {/* Date Range */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label
                htmlFor='startDate'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Start Date
              </label>
              <Input
                id='startDate'
                type='date'
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                disabled={isLoading}
                className='w-full'
              />
            </div>
            <div>
              <label
                htmlFor='endDate'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                End Date
              </label>
              <Input
                id='endDate'
                type='date'
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                disabled={isLoading}
                className='w-full'
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Project Manager */}
          <div className='mb-4'>
            <label
              htmlFor='projectManager'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Project Manager
            </label>
            <Select
              id='projectManager'
              options={[
                { value: '', label: 'Select project manager (optional)' },
                ...teamMembers.filter((member) =>
                  ['admin', 'owner'].includes(member.role)
                ),
              ]}
              value={formData.projectManager}
              onChange={(value) => handleInputChange('projectManager', value)}
              disabled={isLoading}
              className='w-full'
              placeholder='Select project manager'
            />
          </div>

          {/* Team Members */}
          <div className='mb-6'>
            <label
              htmlFor='teamMembers'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Team Members
            </label>
            <Select
              id='teamMembers'
              options={teamMembers}
              value={formData.teamMembers}
              onChange={(value) => handleInputChange('teamMembers', value)}
              disabled={isLoading}
              multiple={true}
              className='w-full'
              placeholder='Select team members (optional)'
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='default'
              disabled={isLoading || !formData.name.trim()}
              iconName={isLoading ? 'Loader2' : 'Plus'}
              iconPosition='left'
              className={isLoading ? 'animate-spin' : ''}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
