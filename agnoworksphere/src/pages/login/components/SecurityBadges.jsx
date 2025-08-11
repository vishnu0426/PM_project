import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Encrypted',
      description: '256-bit encryption',
    },
    {
      icon: 'Lock',
      title: 'SOC 2 Compliant',
      description: 'Enterprise security',
    },
    {
      icon: 'CheckCircle',
      title: 'GDPR Ready',
      description: 'Privacy protected',
    },
  ];

  return (
    <div className='mt-8 pt-6 border-t border-border'>
      <div className='text-center mb-4'>
        <p className='text-xs text-text-secondary font-medium uppercase tracking-wide'>
          Enterprise Security
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {securityFeatures.map((feature, index) => (
          <div key={index} className='text-center'>
            <div className='flex justify-center mb-2'>
              <div className='w-8 h-8 bg-success/10 rounded-full flex items-center justify-center'>
                <Icon name={feature.icon} size={14} className='text-success' />
              </div>
            </div>
            <div className='text-xs font-medium text-text-primary mb-1'>
              {feature.title}
            </div>
            <div className='text-xs text-text-secondary'>
              {feature.description}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Links */}
      <div className='flex justify-center space-x-4 mt-4 text-xs'>
        <button className='text-text-secondary hover:text-text-primary transition-micro'>
          Privacy Policy
        </button>
        <span className='text-border'>•</span>
        <button className='text-text-secondary hover:text-text-primary transition-micro'>
          Terms of Service
        </button>
        <span className='text-border'>•</span>
        <button className='text-text-secondary hover:text-text-primary transition-micro'>
          Security
        </button>
      </div>
    </div>
  );
};

export default SecurityBadges;
