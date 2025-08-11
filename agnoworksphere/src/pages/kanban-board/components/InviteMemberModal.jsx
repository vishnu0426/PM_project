import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import authService from '../../../utils/authService';
import realApiService from '../../../utils/realApiService';

const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState([]);

  // Load organization domain restrictions
  useEffect(() => {
    const loadOrganizationDomains = async () => {
      try {
        const organizationId = authService.getOrganizationId();
        if (organizationId) {
          const organization = await realApiService.organizations.getById(
            organizationId
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
  }, [isOpen]);

  const roleOptions = [
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Can view boards and cards',
    },
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
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (allowedDomains.length > 0) {
      // Check domain restrictions if they exist
      const emailDomain = formData.email.split('@')[1]?.toLowerCase();
      const isAllowedDomain = allowedDomains.some(
        (domain) => domain.toLowerCase() === emailDomain
      );

      if (!isAllowedDomain) {
        newErrors.email = `Email domain must be one of: ${allowedDomains.join(
          ', '
        )}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const organizationId = authService.getOrganizationId();
      if (!organizationId) {
        throw new Error(
          'No organization context. Please select an organization.'
        );
      }

      const payload = {
        email: formData.email.trim(),
        role: formData.role,
        message: formData.message.trim(),
      };

      const result = await realApiService.organizations.inviteMember(
        organizationId,
        payload
      );

      const invitation = {
        id: result?.data?.invitation_id || Date.now().toString(),
        email: payload.email,
        role: payload.role,
        message: payload.message,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        invitedBy: 'You',
      };

      onInvite(invitation);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Failed to send invitation. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      role: 'member',
      message: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Modal */}
      <div className='relative bg-surface rounded-lg shadow-focused w-full max-w-md mx-4'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-border'>
          <div>
            <h2 className='text-lg font-semibold text-text-primary'>
              Invite Team Member
            </h2>
            <p className='text-sm text-text-secondary mt-1'>
              Send an invitation to join this board
            </p>
          </div>
          <Button variant='ghost' size='icon' onClick={handleClose}>
            <Icon name='X' size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <Input
            label='Email Address'
            type='email'
            placeholder='colleague@company.com'
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
            description={
              allowedDomains.length > 0
                ? `Only emails from these domains are allowed: ${allowedDomains.join(
                    ', '
                  )}`
                : 'Enter the email address of the person you want to invite'
            }
          />

          <Select
            label='Role'
            options={roleOptions}
            value={formData.role}
            onChange={(value) => handleInputChange('role', value)}
            description='Choose the access level for this team member'
          />

          <div>
            <label className='block text-sm font-medium text-text-primary mb-2'>
              Personal Message (Optional)
            </label>
            <textarea
              placeholder='Add a personal message to your invitation...'
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none'
              rows={3}
            />
          </div>

          {errors.submit && (
            <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
              <p className='text-sm text-destructive'>{errors.submit}</p>
            </div>
          )}

          {/* Preview */}
          <div className='p-3 bg-muted rounded-md'>
            <h4 className='text-sm font-medium text-text-primary mb-2'>
              Invitation Preview
            </h4>
            <div className='text-xs text-text-secondary space-y-1'>
              <p>
                <strong>To:</strong> {formData.email || 'colleague@company.com'}
              </p>
              <p>
                <strong>Role:</strong>{' '}
                {roleOptions.find((r) => r.value === formData.role)?.label}
              </p>
              <p>
                <strong>Board:</strong> Project Management Board
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-end space-x-3 pt-4'>
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
              loading={isLoading}
              iconName='Send'
              iconPosition='left'
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
