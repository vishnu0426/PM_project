import React from 'react';
import Icon from '../../../components/AppIcon';

const RegistrationBenefits = () => {
  const benefits = [
    {
      icon: 'Users',
      title: 'Team Collaboration',
      description: 'Invite team members and collaborate on projects with role-based permissions'
    },
    {
      icon: 'Kanban',
      title: 'Kanban Boards',
      description: 'Organize tasks with intuitive drag-and-drop Kanban boards'
    },
    {
      icon: 'Shield',
      title: 'Secure & Private',
      description: 'Enterprise-grade security with complete data isolation between organizations'
    },
    {
      icon: 'Zap',
      title: 'Real-time Updates',
      description: 'Stay synchronized with live updates and instant notifications'
    }
  ];

  return (
    <div className="hidden lg:block lg:w-1/2 bg-muted/30 p-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-text-primary mb-4">
            Welcome to Agno WorkSphere
          </h2>
          <p className="text-lg text-text-secondary">
            The complete project management platform for modern teams
          </p>
        </div>

        <div className="space-y-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={benefit.icon} size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">
                  {benefit.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-card rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-3">
            <Icon name="Quote" size={20} className="text-primary" />
            <span className="font-medium text-text-primary">Customer Success</span>
          </div>
          <blockquote className="text-text-secondary italic mb-4">
            "Agno WorkSphere transformed how our team collaborates. The multi-tenant architecture and role-based access control give us the security and flexibility we need."
          </blockquote>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">MJ</span>
            </div>
            <div>
              <div className="font-medium text-text-primary">Michael Johnson</div>
              <div className="text-sm text-text-secondary">Project Manager, TechCorp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationBenefits;