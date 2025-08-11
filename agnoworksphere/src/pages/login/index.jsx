import React from 'react';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import CredentialsHelper from './components/CredentialsHelper';

const LoginPage = () => {
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <LoginHeader />

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-4 py-12'>
        <div className='w-full max-w-md'>
          {/* Login Form */}
          <LoginForm />

          {/* Demo Credentials Helper */}
          <CredentialsHelper />

          {/* Security Badges */}
          <SecurityBadges />
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-surface border-t border-border py-6'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <p className='text-sm text-text-secondary'>
              © {new Date().getFullYear()} Agno WorkSphere. All rights reserved.
            </p>
            <div className='flex justify-center space-x-4 mt-2'>
              <button className='text-xs text-text-secondary hover:text-text-primary transition-micro'>
                Privacy
              </button>
              <span className='text-xs text-border'>•</span>
              <button className='text-xs text-text-secondary hover:text-text-primary transition-micro'>
                Terms
              </button>
              <span className='text-xs text-border'>•</span>
              <button className='text-xs text-text-secondary hover:text-text-primary transition-micro'>
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
