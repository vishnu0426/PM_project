import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import authService from '../../../utils/authService';
import realApiService from '../../../utils/realApiService';

const GeneralSettings = ({
  userRole = 'owner',
  currentUser,
  currentOrganization,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    description: '',
    website: '',
    industry: 'technology',
    size: '50-100',
    timezone: 'America/New_York',
    language: 'en',
    allowedDomains: '',
  });

  // Load organization data - SIMPLIFIED VERSION
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Use prop data if available
        if (currentOrganization) {
          setFormData({
            organizationName: currentOrganization.name || '',
            description: currentOrganization.description || '',
            website: currentOrganization.website || '',
            industry: currentOrganization.industry || 'technology',
            size: currentOrganization.size || '50-100',
            timezone: currentOrganization.timezone || 'America/New_York',
            language: currentOrganization.language || 'en',
            allowedDomains: '',
          });
          return;
        }

        // Simple timeout to prevent hanging
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Set default data if no organization
        setFormData({
          organizationName: 'Default Organization',
          description: 'Default description',
          website: '',
          industry: 'technology',
          size: '50-100',
          timezone: 'America/New_York',
          language: 'en',
          allowedDomains: '',
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentOrganization]);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center'
  );

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' },
  ];

  const sizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '50-100', label: '50-100 employees' },
    { value: '100-500', label: '100-500 employees' },
    { value: '500+', label: '500+ employees' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    // Show success message
    console.log('General settings saved:', formData);
  };

  return (
    <div className='space-y-8'>
      {/* Organization Identity */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
            <Icon name='Building2' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Organization Identity
            </h3>
            <p className='text-sm text-muted-foreground'>
              Basic information about your organization
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <Input
              label='Organization Name'
              type='text'
              value={formData.organizationName}
              onChange={(e) =>
                handleInputChange('organizationName', e.target.value)
              }
              placeholder='Enter organization name'
              required
            />

            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Brief description of your organization'
                rows={3}
                className='w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none'
              />
            </div>

            <Input
              label='Website'
              type='url'
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder='https://your-website.com'
            />
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Organization Logo
              </label>
              <div className='flex items-center space-x-4'>
                <div className='w-20 h-20 rounded-lg border-2 border-dashed border-border overflow-hidden'>
                  <Image
                    src={logoPreview}
                    alt='Organization logo'
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='flex-1'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleLogoUpload}
                    className='hidden'
                    id='logo-upload'
                  />
                  <label htmlFor='logo-upload'>
                    <Button variant='outline' asChild>
                      <span className='cursor-pointer'>
                        <Icon name='Upload' size={16} className='mr-2' />
                        Upload Logo
                      </span>
                    </Button>
                  </label>
                  <p className='text-xs text-muted-foreground mt-1'>
                    PNG, JPG up to 2MB. Recommended: 200x200px
                  </p>
                </div>
              </div>
            </div>

            <Select
              label='Industry'
              options={industryOptions}
              value={formData.industry}
              onChange={(value) => handleInputChange('industry', value)}
              placeholder='Select industry'
            />

            <Select
              label='Organization Size'
              options={sizeOptions}
              value={formData.size}
              onChange={(value) => handleInputChange('size', value)}
              placeholder='Select organization size'
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-accent rounded-lg flex items-center justify-center'>
            <Icon name='Globe' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Regional Settings
            </h3>
            <p className='text-sm text-muted-foreground'>
              Configure timezone and language preferences
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Select
            label='Default Timezone'
            options={timezoneOptions}
            value={formData.timezone}
            onChange={(value) => handleInputChange('timezone', value)}
            placeholder='Select timezone'
            searchable
          />

          <Select
            label='Default Language'
            options={languageOptions}
            value={formData.language}
            onChange={(value) => handleInputChange('language', value)}
            placeholder='Select language'
          />
        </div>
      </div>

      {/* Domain Configuration */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-secondary rounded-lg flex items-center justify-center'>
            <Icon name='Shield' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Domain Configuration
            </h3>
            <p className='text-sm text-muted-foreground'>
              Control who can join your organization
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          <Input
            label='Allowed Email Domains'
            type='text'
            value={formData.allowedDomains}
            onChange={(e) =>
              handleInputChange('allowedDomains', e.target.value)
            }
            placeholder='example.com, company.org'
            description='Comma-separated list of domains. Leave empty to allow all domains.'
          />

          <div className='bg-muted rounded-lg p-4'>
            <div className='flex items-start space-x-3'>
              <Icon name='Info' size={16} className='text-primary mt-0.5' />
              <div className='text-sm'>
                <p className='text-foreground font-medium mb-1'>
                  Domain Restrictions
                </p>
                <p className='text-muted-foreground'>
                  When domains are specified, only users with email addresses
                  from these domains can be invited to join your organization.
                  This helps maintain security and ensures only authorized
                  personnel can access your workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className='flex justify-end pt-6 border-t border-border'>
        <Button
          variant='default'
          onClick={handleSave}
          loading={saving}
          iconName='Save'
          iconPosition='left'
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
