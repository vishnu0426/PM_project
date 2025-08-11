import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const RegistrationHeader = () => {
  return (
    <header className="w-full bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover-lift">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground" fill="currentColor">
                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-text-primary">Agno WorkSphere</span>
          </Link>

          {/* Sign In Link */}
          <div className="flex items-center">
            <Link to="/login">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RegistrationHeader;