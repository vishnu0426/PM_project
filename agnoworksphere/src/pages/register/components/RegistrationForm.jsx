import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationDomain: '',
    role: 'owner',
    agreeToTerms: false,
    agreeToPrivacy: false,
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmailDomain = async (email, organizationDomain) => {
    if (!email || !organizationDomain) return true;

    const emailDomain = email.split('@')[1]?.toLowerCase();
    const orgDomain = organizationDomain.toLowerCase();

    // For new organization registration, email domain should match organization domain
    return emailDomain === orgDomain;
  };

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateDomain = (domain) => {
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Real-time password strength validation
    if (field === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = async () => {
    const newErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!formData.organizationDomain.trim()) {
      newErrors.organizationDomain = 'Organization domain is required';
    } else if (!validateDomain(formData.organizationDomain)) {
      newErrors.organizationDomain =
        'Please enter a valid domain (e.g., company.com)';
    }

    // Validate email domain matches organization domain for new organization
    if (formData.email && formData.organizationDomain) {
      const isValidDomain = await validateEmailDomain(
        formData.email,
        formData.organizationDomain
      );
      if (!isValidDomain) {
        newErrors.email = `Email domain must match organization domain (${formData.organizationDomain})`;
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    const isValid = await validateStep2();
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Parse full name
      const nameParts = formData.fullName
        .trim()
        .split(' ')
        .filter((part) => part.length > 0);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Call the enhanced registration API
      const result = await register(formData.email, formData.password, {
        firstName,
        lastName,
        organizationName: formData.organizationName,
        organizationDomain: formData.organizationDomain,
      });

      if (!result.success) {
        setErrors({ submit: result.error });
        return;
      }

      // Registration successful - navigate to dashboard
      console.log('Registration successful:', result.data);

      // Navigate to role-based dashboard since user is now logged in
      navigate('/role-based-dashboard', {
        state: {
          message: `Welcome to ${formData.organizationName}! You are now the organization owner. A welcome email has been sent to ${formData.email}.`,
          type: 'success',
          isNewUser: true,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
      case 3:
        return 'Medium';
      case 4:
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-destructive';
      case 2:
      case 3:
        return 'bg-warning';
      case 4:
      case 5:
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-card rounded-lg shadow-enterprise border border-border p-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-semibold text-text-primary mb-2'>
            Create Your Account
          </h1>
          <p className='text-text-secondary'>
            {currentStep === 1
              ? 'Enter your personal information to get started'
              : 'Set up your organization workspace'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className='flex items-center justify-center mb-8'>
          <div className='flex items-center space-x-4'>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-text-secondary'
              }`}
            >
              {currentStep > 1 ? <Icon name='Check' size={16} /> : '1'}
            </div>
            <div
              className={`w-12 h-0.5 ${
                currentStep > 1 ? 'bg-primary' : 'bg-border'
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 2
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-text-secondary'
              }`}
            >
              2
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {currentStep === 1 && (
            <>
              {/* Step 1: Personal Information */}
              <Input
                label='Full Name'
                type='text'
                placeholder='Enter your full name'
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={errors.fullName}
                required
              />

              <Input
                label='Email Address'
                type='email'
                placeholder='Enter your email address'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                description="We'll use this email for account verification and notifications"
                required
              />

              <div className='space-y-2'>
                <Input
                  label='Password'
                  type='password'
                  placeholder='Create a strong password'
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  error={errors.password}
                  required
                />

                {formData.password && (
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-text-secondary'>
                        Password strength:
                      </span>
                      <span
                        className={`font-medium ${
                          passwordStrength <= 1
                            ? 'text-destructive'
                            : passwordStrength <= 3
                            ? 'text-warning'
                            : 'text-success'
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className='w-full bg-muted rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Input
                label='Confirm Password'
                type='password'
                placeholder='Confirm your password'
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                error={errors.confirmPassword}
                required
              />

              <Button
                type='button'
                onClick={handleNextStep}
                className='w-full'
                iconName='ArrowRight'
                iconPosition='right'
              >
                Continue
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* Step 2: Organization Setup */}
              <Input
                label='Organization Name'
                type='text'
                placeholder='Enter your organization name'
                value={formData.organizationName}
                onChange={(e) =>
                  handleInputChange('organizationName', e.target.value)
                }
                error={errors.organizationName}
                description='This will be the name of your workspace'
                required
              />

              <Input
                label='Organization Domain'
                type='text'
                placeholder='company.com'
                value={formData.organizationDomain}
                onChange={(e) =>
                  handleInputChange('organizationDomain', e.target.value)
                }
                error={errors.organizationDomain}
                description='Used for email invitations and domain restrictions'
                required
              />

              {/* Terms and Privacy */}
              <div className='space-y-4'>
                <Checkbox
                  label='I agree to the Terms of Service'
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    handleInputChange('agreeToTerms', e.target.checked)
                  }
                  error={errors.agreeToTerms}
                  required
                />

                <Checkbox
                  label='I agree to the Privacy Policy'
                  checked={formData.agreeToPrivacy}
                  onChange={(e) =>
                    handleInputChange('agreeToPrivacy', e.target.checked)
                  }
                  error={errors.agreeToPrivacy}
                  required
                />
              </div>

              {errors.submit && (
                <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
                  <p className='text-sm text-destructive'>{errors.submit}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex space-x-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handlePreviousStep}
                  className='flex-1'
                  iconName='ArrowLeft'
                  iconPosition='left'
                >
                  Back
                </Button>

                <Button
                  type='submit'
                  loading={isLoading}
                  className='flex-1'
                  iconName='UserPlus'
                  iconPosition='left'
                >
                  Create Account
                </Button>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className='mt-8 pt-6 border-t border-border text-center'>
          <p className='text-sm text-text-secondary'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-medium text-primary hover:text-primary/80 transition-colors'
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Additional Information */}
      <div className='mt-6 text-center'>
        <p className='text-xs text-text-secondary'>
          By creating an account, you'll be able to invite team members and
          manage projects.
          <br />
          Need to join an existing organization? Contact your administrator for
          an invitation.
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
