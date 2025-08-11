import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const SecuritySettings = ({
  userRole = 'owner',
  currentUser,
  currentOrganization,
}) => {
  const [securityData, setSecurityData] = useState({
    passwordMinLength: '8',
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    passwordExpiration: '90',
    sessionTimeout: '480',
    twoFactorRequired: false,
    twoFactorForAdmins: true,
    loginAttempts: '5',
    lockoutDuration: '30',
    dataRetention: '365',
    auditLogRetention: '1095',
  });

  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);

  const passwordExpirationOptions = [
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: '90', label: '90 days' },
    { value: '180', label: '180 days' },
    { value: '365', label: '1 year' },
    { value: 'never', label: 'Never expire' },
  ];

  const sessionTimeoutOptions = [
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '240', label: '4 hours' },
    { value: '480', label: '8 hours' },
    { value: '720', label: '12 hours' },
    { value: '1440', label: '24 hours' },
  ];

  const dataRetentionOptions = [
    { value: '90', label: '90 days' },
    { value: '180', label: '180 days' },
    { value: '365', label: '1 year' },
    { value: '730', label: '2 years' },
    { value: '1095', label: '3 years' },
    { value: '2555', label: '7 years' },
  ];

  const handleInputChange = (field, value) => {
    setSecurityData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCriticalChange = (field, value) => {
    const criticalFields = [
      'twoFactorRequired',
      'passwordExpiration',
      'dataRetention',
    ];

    if (criticalFields.includes(field)) {
      setPendingChanges({ field, value });
      setShowConfirmDialog(true);
    } else {
      handleInputChange(field, value);
    }
  };

  const confirmCriticalChange = () => {
    if (pendingChanges) {
      handleInputChange(pendingChanges.field, pendingChanges.value);
      setPendingChanges(null);
    }
    setShowConfirmDialog(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    console.log('Security settings saved:', securityData);
  };

  return (
    <div className='space-y-8'>
      {/* Password Policy */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-warning rounded-lg flex items-center justify-center'>
            <Icon name='Lock' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Password Policy
            </h3>
            <p className='text-sm text-muted-foreground'>
              Configure password requirements for all users
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <Input
              label='Minimum Password Length'
              type='number'
              value={securityData.passwordMinLength}
              onChange={(e) =>
                handleInputChange('passwordMinLength', e.target.value)
              }
              min='6'
              max='32'
            />

            <Select
              label='Password Expiration'
              options={passwordExpirationOptions}
              value={securityData.passwordExpiration}
              onChange={(value) =>
                handleCriticalChange('passwordExpiration', value)
              }
              description='How often users must change their passwords'
            />
          </div>

          <div className='space-y-4'>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-foreground'>
                Password Requirements
              </label>

              <Checkbox
                label='Require uppercase letters (A-Z)'
                checked={securityData.passwordRequireUppercase}
                onChange={(e) =>
                  handleInputChange(
                    'passwordRequireUppercase',
                    e.target.checked
                  )
                }
              />

              <Checkbox
                label='Require lowercase letters (a-z)'
                checked={securityData.passwordRequireLowercase}
                onChange={(e) =>
                  handleInputChange(
                    'passwordRequireLowercase',
                    e.target.checked
                  )
                }
              />

              <Checkbox
                label='Require numbers (0-9)'
                checked={securityData.passwordRequireNumbers}
                onChange={(e) =>
                  handleInputChange('passwordRequireNumbers', e.target.checked)
                }
              />

              <Checkbox
                label='Require special characters (!@#$%)'
                checked={securityData.passwordRequireSpecialChars}
                onChange={(e) =>
                  handleInputChange(
                    'passwordRequireSpecialChars',
                    e.target.checked
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-success rounded-lg flex items-center justify-center'>
            <Icon name='Smartphone' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Two-Factor Authentication
            </h3>
            <p className='text-sm text-muted-foreground'>
              Enhanced security with 2FA requirements
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          <Checkbox
            label='Require 2FA for all users'
            description='All organization members must enable two-factor authentication'
            checked={securityData.twoFactorRequired}
            onChange={(e) =>
              handleCriticalChange('twoFactorRequired', e.target.checked)
            }
          />

          <Checkbox
            label='Require 2FA for Admins and Owners'
            description='Administrative roles must use two-factor authentication'
            checked={securityData.twoFactorForAdmins}
            onChange={(e) =>
              handleInputChange('twoFactorForAdmins', e.target.checked)
            }
          />

          <div className='bg-muted rounded-lg p-4'>
            <div className='flex items-start space-x-3'>
              <Icon name='Shield' size={16} className='text-success mt-0.5' />
              <div className='text-sm'>
                <p className='text-foreground font-medium mb-1'>
                  Enhanced Security
                </p>
                <p className='text-muted-foreground'>
                  Two-factor authentication adds an extra layer of security by
                  requiring users to provide a second form of verification in
                  addition to their password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
            <Icon name='Clock' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Session Management
            </h3>
            <p className='text-sm text-muted-foreground'>
              Control user session behavior and security
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Select
            label='Session Timeout'
            options={sessionTimeoutOptions}
            value={securityData.sessionTimeout}
            onChange={(value) => handleInputChange('sessionTimeout', value)}
            description='Automatically log out inactive users'
          />

          <div className='space-y-4'>
            <Input
              label='Max Login Attempts'
              type='number'
              value={securityData.loginAttempts}
              onChange={(e) =>
                handleInputChange('loginAttempts', e.target.value)
              }
              min='3'
              max='10'
              description='Failed attempts before account lockout'
            />

            <Input
              label='Lockout Duration (minutes)'
              type='number'
              value={securityData.lockoutDuration}
              onChange={(e) =>
                handleInputChange('lockoutDuration', e.target.value)
              }
              min='5'
              max='1440'
              description='How long accounts remain locked'
            />
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-destructive rounded-lg flex items-center justify-center'>
            <Icon name='Database' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Data Retention
            </h3>
            <p className='text-sm text-muted-foreground'>
              Configure data retention and audit policies
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Select
            label='Data Retention Period'
            options={dataRetentionOptions}
            value={securityData.dataRetention}
            onChange={(value) => handleCriticalChange('dataRetention', value)}
            description='How long to keep deleted data'
          />

          <Select
            label='Audit Log Retention'
            options={dataRetentionOptions}
            value={securityData.auditLogRetention}
            onChange={(value) => handleInputChange('auditLogRetention', value)}
            description='How long to keep audit logs'
          />
        </div>

        <div className='mt-4 bg-warning/10 border border-warning/20 rounded-lg p-4'>
          <div className='flex items-start space-x-3'>
            <Icon
              name='AlertTriangle'
              size={16}
              className='text-warning mt-0.5'
            />
            <div className='text-sm'>
              <p className='text-foreground font-medium mb-1'>
                Data Retention Warning
              </p>
              <p className='text-muted-foreground'>
                Changing data retention policies affects compliance
                requirements. Consult with your legal team before making
                changes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='w-10 h-10 bg-warning rounded-lg flex items-center justify-center'>
                <Icon name='AlertTriangle' size={20} color='white' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground'>
                  Confirm Security Change
                </h3>
                <p className='text-sm text-muted-foreground'>
                  This change affects organization security
                </p>
              </div>
            </div>

            <p className='text-sm text-muted-foreground mb-6'>
              Are you sure you want to modify this security setting? This change
              will affect all organization members and may impact compliance
              requirements.
            </p>

            <div className='flex space-x-3'>
              <Button
                variant='outline'
                onClick={() => setShowConfirmDialog(false)}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                variant='warning'
                onClick={confirmCriticalChange}
                className='flex-1'
              >
                Confirm Change
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
          Save Security Settings
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
