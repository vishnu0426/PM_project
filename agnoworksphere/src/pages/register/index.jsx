import React from 'react';
import RegistrationHeader from './components/RegistrationHeader';
import RegistrationForm from './components/RegistrationForm';
import RegistrationBenefits from './components/RegistrationBenefits';

const Register = () => {
  return (
    <div className='min-h-screen bg-background'>
      <RegistrationHeader />

      <main className='flex-1'>
        <div className='flex min-h-[calc(100vh-4rem)]'>
          {/* Registration Form Section */}
          <div className='flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8'>
            <div className='w-full max-w-md'>
              <RegistrationForm />
            </div>
          </div>

          {/* Benefits Section - Desktop Only */}
          <RegistrationBenefits />
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-surface border-t border-border py-6'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0'>
            <div className='flex items-center space-x-6 text-sm text-text-secondary'>
              <button
                type='button'
                className='hover:text-text-primary transition-colors underline'
                onClick={() => console.log('Terms of Service clicked')}
              >
                Terms of Service
              </button>
              <button
                type='button'
                className='hover:text-text-primary transition-colors underline'
                onClick={() => console.log('Privacy Policy clicked')}
              >
                Privacy Policy
              </button>
              <button
                type='button'
                className='hover:text-text-primary transition-colors underline'
                onClick={() => console.log('Support clicked')}
              >
                Support
              </button>
            </div>
            <div className='text-sm text-text-secondary'>
              © {new Date().getFullYear()} Agno WorkSphere. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;
