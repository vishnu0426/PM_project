import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import authService from '../../utils/authService';
import realApiService from '../../utils/realApiService';

const InviteMemberModal = ({
  isOpen,
  onClose,
  onInviteMember,
  organizationId,
  organizationName,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allowedDomains, setAllowedDomains] = useState([]);

  const roleOptions = [
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' },
    { value: 'viewer', label: 'Viewer' },
  ];

  // Load organization domain restrictions
  useEffect(() => {
    const loadOrganizationDomains = async () => {
      try {
        let currentOrgId = organizationId;

        // If no organizationId provided, try to get it from authService
        if (!currentOrgId) {
          currentOrgId = await authService.getOrganizationId();
        }
        if (currentOrgId) {
          const organization = await realApiService.organizations.getById(
            currentOrgId
          );
          if (organization && organization.allowed_domains) {
            setAllowedDomains(organization.allowed_domains);
          }
        }
      } catch (error) {
        console.error('Failed to load organization domains:', error);
      }
    };

    if (isOpen) {
      loadOrganizationDomains();
    }
  }, [isOpen, organizationId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Check domain restrictions if they exist
    if (allowedDomains.length > 0) {
      const emailDomain = formData.email.split('@')[1]?.toLowerCase();
      const isAllowedDomain = allowedDomains.some(
        (domain) => domain.toLowerCase() === emailDomain
      );

      if (!isAllowedDomain) {
        setError(`Email domain must be one of: ${allowedDomains.join(', ')}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onInviteMember({
        email: formData.email.trim(),
        role: formData.role,
        organization_id: organizationId,
      });

      // Reset form and close modal
      setFormData({ email: '', role: 'member' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', role: 'member' });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Invite Team Member
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
            {allowedDomains.length > 0 ? (
              <p className='text-xs text-blue-600 mt-1'>
                <span className='font-medium'>Allowed domains:</span>{' '}
                {allowedDomains.join(', ')}
              </p>
            ) : (
              <p className='text-xs text-blue-600 mt-1'>
                Any email domain is allowed
              </p>
            )}
          </div>

          {/* Email */}
          <div className='mb-4'>
            <label
              htmlFor='memberEmail'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Email Address *
            </label>
            <Input
              id='memberEmail'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder='Enter email address'
              disabled={isLoading}
              className='w-full'
            />
          </div>

          {/* Role */}
          <div className='mb-6'>
            <label
              htmlFor='memberRole'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Role
            </label>
            <Select
              id='memberRole'
              value={formData.role}
              onChange={(value) => handleInputChange('role', value)}
              options={roleOptions}
              disabled={isLoading}
              className='w-full'
            />
            <p className='text-xs text-gray-500 mt-1'>
              {formData.role === 'admin' &&
                'Can manage projects and invite members'}
              {formData.role === 'member' &&
                'Can access projects and create tasks'}
              {formData.role === 'viewer' &&
                'Read-only access to projects and data'}
            </p>
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
              disabled={isLoading || !formData.email.trim()}
              iconName={isLoading ? 'Loader2' : 'UserPlus'}
              iconPosition='left'
              className={isLoading ? 'animate-spin' : ''}
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
