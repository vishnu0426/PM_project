import React from 'react';
import { Link } from 'react-router-dom';

const LoginHeader = () => {
  return (
    <header className='w-full bg-surface border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link to='/login' className='flex items-center space-x-3 hover-lift'>
            <div className='w-8 h-8 bg-primary rounded-md flex items-center justify-center'>
              <svg
                viewBox='0 0 24 24'
                className='w-5 h-5 text-primary-foreground'
                fill='currentColor'
              >
                <path d='M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z' />
              </svg>
            </div>
            <span className='text-xl font-semibold text-text-primary'>
              Agno WorkSphere
            </span>
          </Link>

          {/* Right Side Actions */}
          <div className='flex items-center space-x-4'>
            {/* Language Selector */}
            <div className='hidden sm:block'>
              <select className='text-sm text-text-secondary bg-transparent border-none focus:outline-none cursor-pointer'>
                <option value='en'>English</option>
                <option value='es'>Español</option>
                <option value='fr'>Français</option>
              </select>
            </div>

            {/* Help Link */}
            <Link
              to='#'
              className='text-sm text-text-secondary hover:text-text-primary transition-micro'
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoginHeader;
