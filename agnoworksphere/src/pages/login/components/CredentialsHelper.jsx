import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CredentialsHelper = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mockCredentials = [
    { role: 'Owner', email: 'owner@acme.com', password: 'Owner123!', description: 'Full organizational control - Create projects, manage team, all features' },
    { role: 'Admin', email: 'admin@acme.com', password: 'Admin123!', description: 'Project & team management - Create projects, manage boards, invite members' },
    { role: 'Member', email: 'member@acme.com', password: 'Member123!', description: 'Project collaboration - Create/edit tasks, access kanban boards, team view' },
    { role: 'Viewer', email: 'viewer@acme.com', password: 'Viewer123!', description: 'Read-only access - View projects, dashboards, and reports only' }
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-6">
      <Button
        variant="ghost"
        onClick={toggleExpanded}
        className="w-full justify-between p-3 h-auto"
      >
        <div className="flex items-center space-x-2">
          <Icon name="Key" size={16} className="text-primary" />
          <span className="text-sm font-medium text-text-primary">Demo Credentials</span>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-text-secondary" 
        />
      </Button>

      {isExpanded && (
        <div className="mt-3 bg-muted/50 rounded-md p-4 space-y-3">
          <div className="text-xs text-text-secondary mb-3">
            Use these credentials to test different role permissions:
          </div>
          
          {mockCredentials.map((cred, index) => (
            <div key={index} className="bg-card border border-border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    cred.role === 'Owner' ? 'bg-primary' :
                    cred.role === 'Admin' ? 'bg-accent' :
                    cred.role === 'Member' ? 'bg-success' : 'bg-secondary'
                  }`}></div>
                  <span className="text-sm font-medium text-text-primary">{cred.role}</span>
                </div>
                <span className="text-xs text-text-secondary">{cred.description}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Email:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {cred.email}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cred.email)}
                      className="text-text-secondary hover:text-text-primary transition-micro"
                    >
                      <Icon name="Copy" size={12} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Password:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {cred.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cred.password)}
                      className="text-text-secondary hover:text-text-primary transition-micro"
                    >
                      <Icon name="Copy" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-xs text-text-secondary mt-3 p-2 bg-warning/10 border border-warning/20 rounded">
            <Icon name="Info" size={12} className="inline mr-1 text-warning" />
            These are demo credentials for testing purposes only.
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialsHelper;