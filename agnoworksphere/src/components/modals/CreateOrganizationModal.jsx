import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const CreateOrganizationModal = ({ isOpen, onClose, onCreateOrganization }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    organization_category: '',
    
    // Contact Information
    contact_email: '',
    contact_phone: '',
    
    // Address Details
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    
    // Regional Settings
    timezone: 'UTC',
    language: 'en',
    allowed_domains: ''
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Options for dropdowns
  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' }
  ];

  const sizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  const categoryOptions = [
    { value: 'startup', label: 'Startup' },
    { value: 'small_business', label: 'Small Business' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'agency', label: 'Agency' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' }
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
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
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' }
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'AU', label: 'Australia' },
    { value: 'JP', label: 'Japan' },
    { value: 'CN', label: 'China' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'File size must be less than 5MB' }));
        return;
      }
      
      setLogoFile(file);
      setErrors(prev => ({ ...prev, logo: '' }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Organization name must be at least 2 characters long';
    }
    
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    // Step 2 validation is optional for most fields
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare form data for submission
      const organizationData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        website: formData.website.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        address_line1: formData.address_line1.trim() || null,
        address_line2: formData.address_line2.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        allowed_domains: formData.allowed_domains.trim() ? 
          formData.allowed_domains.split(',').map(d => d.trim()).filter(d => d) : null
      };

      await onCreateOrganization(organizationData, logoFile);
      
      // Reset form and close modal
      handleClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create organization' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCurrentStep(1);
      setFormData({
        name: '', description: '', website: '', industry: '', size: '', organization_category: '',
        contact_email: '', contact_phone: '', address_line1: '', address_line2: '',
        city: '', state: '', postal_code: '', country: '', timezone: 'UTC', language: 'en', allowed_domains: ''
      });
      setLogoFile(null);
      setLogoPreview(null);
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-enterprise border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Building2" size={20} color="white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create New Organization</h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of 2: {currentStep === 1 ? 'Basic Information' : 'Additional Details'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Basic Info</span>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* General Error */}
          {errors.submit && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Organization Identity Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Icon name="Building2" size={18} />
                  <span>Organization Identity</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Organization Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter organization name"
                      error={errors.name}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of your organization"
                      rows={3}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <Input
                    label="Website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://your-website.com"
                    disabled={isLoading}
                  />
                  
                  <Select
                    label="Organization Category"
                    options={categoryOptions}
                    value={formData.organization_category}
                    onChange={(value) => handleInputChange('organization_category', value)}
                    placeholder="Select category"
                    disabled={isLoading}
                  />
                  
                  <Select
                    label="Industry"
                    options={industryOptions}
                    value={formData.industry}
                    onChange={(value) => handleInputChange('industry', value)}
                    placeholder="Select industry"
                    disabled={isLoading}
                  />
                  
                  <Select
                    label="Organization Size"
                    options={sizeOptions}
                    value={formData.size}
                    onChange={(value) => handleInputChange('size', value)}
                    placeholder="Select size"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Icon name="Image" size={18} />
                  <span>Organization Logo</span>
                </h3>
                
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="Building2" size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={isLoading}
                    />
                    <label htmlFor="logo-upload">
                      <Button variant="outline" asChild disabled={isLoading}>
                        <span className="cursor-pointer">
                          <Icon name="Upload" size={16} className="mr-2" />
                          Upload Logo
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 5MB. Recommended: 200x200px
                    </p>
                    {errors.logo && (
                      <p className="text-xs text-destructive mt-1">{errors.logo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Icon name="Mail" size={18} />
                  <span>Contact Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="contact@organization.com"
                    error={errors.contact_email}
                    disabled={isLoading}
                  />
                  
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Address Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Icon name="MapPin" size={18} />
                  <span>Address Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 1"
                      type="text"
                      value={formData.address_line1}
                      onChange={(e) => handleInputChange('address_line1', e.target.value)}
                      placeholder="Street address"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 2"
                      type="text"
                      value={formData.address_line2}
                      onChange={(e) => handleInputChange('address_line2', e.target.value)}
                      placeholder="Apartment, suite, etc. (optional)"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Input
                    label="City"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    disabled={isLoading}
                  />
                  
                  <Input
                    label="State/Province"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State or Province"
                    disabled={isLoading}
                  />
                  
                  <Input
                    label="Postal Code"
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="ZIP or Postal Code"
                    disabled={isLoading}
                  />
                  
                  <Select
                    label="Country"
                    options={countryOptions}
                    value={formData.country}
                    onChange={(value) => handleInputChange('country', value)}
                    placeholder="Select country"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Regional Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Icon name="Globe" size={18} />
                  <span>Regional Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Default Timezone"
                    options={timezoneOptions}
                    value={formData.timezone}
                    onChange={(value) => handleInputChange('timezone', value)}
                    placeholder="Select timezone"
                    disabled={isLoading}
                    searchable
                  />
                  
                  <Select
                    label="Default Language"
                    options={languageOptions}
                    value={formData.language}
                    onChange={(value) => handleInputChange('language', value)}
                    placeholder="Select language"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Domain Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Icon name="Shield" size={18} />
                  <span>Domain Configuration</span>
                </h3>
                
                <Input
                  label="Allowed Email Domains"
                  type="text"
                  value={formData.allowed_domains}
                  onChange={(e) => handleInputChange('allowed_domains', e.target.value)}
                  placeholder="example.com, company.org"
                  description="Comma-separated list of domains. Leave empty to allow all domains."
                  disabled={isLoading}
                />
                
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Info" size={16} className="text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium mb-1">Domain Restrictions</p>
                      <p className="text-muted-foreground">
                        When domains are specified, only users with email addresses from these domains can be invited to join your organization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <div className="flex items-center space-x-3">
              {currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                  iconName="ChevronLeft"
                  iconPosition="left"
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="default"
                disabled={isLoading || (currentStep === 1 && !formData.name.trim())}
                iconName={isLoading ? "Loader2" : currentStep === 1 ? "ChevronRight" : "Plus"}
                iconPosition="left"
                className={isLoading ? "animate-spin" : ""}
              >
                {isLoading ? 'Creating...' : currentStep === 1 ? 'Next' : 'Create Organization'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;
