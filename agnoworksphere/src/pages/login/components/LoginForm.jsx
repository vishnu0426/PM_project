import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Use AuthContext login method
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Redirect to role-based dashboard on successful login
        navigate('/role-based-dashboard');
      } else {
        setErrors({
          general:
            result.error ||
            'Invalid email or password. Please check your credentials and try again.',
        });
      }
    } catch (error) {
      setErrors({
        general: 'An error occurred during login. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-card border border-border rounded-lg shadow-enterprise p-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-semibold text-text-primary mb-2'>
            Welcome Back
          </h1>
          <p className='text-text-secondary'>
            Sign in to your Agno WorkSphere account
          </p>
        </div>

        {/* Demo Credentials */}
        <div className='bg-muted/50 border border-border rounded-md p-4 mb-6'>
          <h3 className='text-sm font-medium text-text-primary mb-3'>
            🔐 Demo Credentials for Testing:
          </h3>
          <div className='grid grid-cols-1 gap-2 text-xs'>
            <div className='flex justify-between'>
              <span className='font-medium text-green-600'>Owner:</span>
              <span className='text-text-secondary'>
                owner@example.com / owner123
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-purple-600'>Admin:</span>
              <span className='text-text-secondary'>
                admin@example.com / admin123
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-blue-600'>Member:</span>
              <span className='text-text-secondary'>
                member@example.com / member123
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-gray-600'>Viewer:</span>
              <span className='text-text-secondary'>
                viewer@example.com / viewer123
              </span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* General Error */}
          {errors.general && (
            <div className='bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start space-x-2'>
              <Icon
                name='AlertCircle'
                size={16}
                className='text-destructive mt-0.5 flex-shrink-0'
              />
              <p className='text-sm text-destructive'>{errors.general}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <Input
              label='Email Address'
              type='email'
              name='email'
              placeholder='Enter your email address'
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <div className='relative'>
              <Input
                label='Password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                required
                disabled={isLoading}
              />
              <button
                type='button'
                onClick={togglePasswordVisibility}
                className='absolute right-3 top-9 text-text-secondary hover:text-text-primary transition-micro'
                disabled={isLoading}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className='flex items-center justify-between'>
            <label className='flex items-center space-x-2 cursor-pointer'>
              <input
                type='checkbox'
                className='w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2'
                disabled={isLoading}
              />
              <span className='text-sm text-text-secondary'>Remember me</span>
            </label>
            <button
              type='button'
              className='text-sm text-primary hover:text-primary/80 transition-micro'
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <Button
            type='submit'
            variant='default'
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            className='h-12'
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-border'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-card text-text-secondary'>
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Options */}
        <div className='grid grid-cols-2 gap-3'>
          <Button variant='outline' disabled={isLoading} className='h-10'>
            <Icon name='Mail' size={16} className='mr-2' />
            Google
          </Button>
          <Button variant='outline' disabled={isLoading} className='h-10'>
            <Icon name='Github' size={16} className='mr-2' />
            GitHub
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className='text-center mt-6'>
          <p className='text-sm text-text-secondary'>
            Don't have an account?{' '}
            <button
              type='button'
              onClick={() => navigate('/register')}
              className='text-primary hover:text-primary/80 font-medium transition-micro'
              disabled={isLoading}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
