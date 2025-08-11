import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const SettingsTab = () => {
  const [projectSettings, setProjectSettings] = useState({
    name: "Enterprise CRM System",
    description: "A comprehensive customer relationship management system designed to streamline sales processes and improve customer engagement across multiple channels.",
    visibility: "private",
    status: "active",
    priority: "high",
    startDate: "2025-01-15",
    endDate: "2025-08-30",
    budget: "250000",
    currency: "USD",
    timezone: "America/New_York"
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    taskAssignments: true,
    deadlineReminders: true,
    statusChanges: false,
    weeklyReports: true,
    slackIntegration: false,
    teamsIntegration: true
  });

  const [workflowSettings, setWorkflowSettings] = useState({
    autoAssignTasks: false,
    requireApproval: true,
    allowGuestAccess: false,
    enableTimeTracking: true,
    mandatoryComments: false
  });

  const visibilityOptions = [
    { value: 'private', label: 'Private - Only team members' },
    { value: 'organization', label: 'Organization - All org members' },
    { value: 'public', label: 'Public - Anyone with link' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Priority' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' }
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' }
  ];

  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications and updates to Slack channels',
      icon: 'MessageSquare',
      connected: true,
      lastSync: '2025-07-28T06:30:00Z'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Collaborate and share updates in Teams channels',
      icon: 'Users',
      connected: false,
      lastSync: null
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Sync issues and track development progress',
      icon: 'Bug',
      connected: true,
      lastSync: '2025-07-28T05:45:00Z'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Sync project deadlines and meetings',
      icon: 'Calendar',
      connected: false,
      lastSync: null
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Link commits and pull requests to tasks',
      icon: 'GitBranch',
      connected: true,
      lastSync: '2025-07-28T07:00:00Z'
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "owner",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      joinedDate: "2025-01-15",
      lastActive: "2025-07-28T06:45:00Z"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@company.com",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      joinedDate: "2025-01-20",
      lastActive: "2025-07-28T07:00:00Z"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@company.com",
      role: "member",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      joinedDate: "2025-02-01",
      lastActive: "2025-07-28T06:30:00Z"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@company.com",
      role: "member",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      joinedDate: "2025-02-10",
      lastActive: "2025-07-27T18:20:00Z"
    }
  ];

  const roleOptions = [
    { value: 'viewer', label: 'Viewer - Can view project' },
    { value: 'member', label: 'Member - Can edit tasks' },
    { value: 'admin', label: 'Admin - Can manage project' },
    { value: 'owner', label: 'Owner - Full control' }
  ];

  const handleProjectSettingChange = (field, value) => {
    setProjectSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, checked) => {
    setNotifications(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleWorkflowChange = (field, checked) => {
    setWorkflowSettings(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleIntegrationToggle = (integrationId) => {
    console.log(`Toggling integration: ${integrationId}`);
  };

  const handleRoleChange = (memberId, newRole) => {
    console.log(`Changing role for member ${memberId} to ${newRole}`);
  };

  const handleRemoveMember = (memberId) => {
    console.log(`Removing member: ${memberId}`);
  };

  const formatLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Active now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'text-error bg-error/10';
      case 'admin':
        return 'text-warning bg-warning/10';
      case 'member':
        return 'text-primary bg-primary/10';
      case 'viewer':
        return 'text-text-secondary bg-muted';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  return (
    <div className="space-y-8">
      {/* Project Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-foreground">Project Information</h3>
          <Button variant="outline" size="sm" iconName="Save" iconPosition="left">
            Save Changes
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Project Name"
            type="text"
            value={projectSettings.name}
            onChange={(e) => handleProjectSettingChange('name', e.target.value)}
            required
          />
          <Select
            label="Project Status"
            options={statusOptions}
            value={projectSettings.status}
            onChange={(value) => handleProjectSettingChange('status', value)}
          />
          <div className="md:col-span-2">
            <Input
              label="Description"
              type="text"
              value={projectSettings.description}
              onChange={(e) => handleProjectSettingChange('description', e.target.value)}
              description="Brief description of the project goals and objectives"
            />
          </div>
          <Select
            label="Visibility"
            options={visibilityOptions}
            value={projectSettings.visibility}
            onChange={(value) => handleProjectSettingChange('visibility', value)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={projectSettings.priority}
            onChange={(value) => handleProjectSettingChange('priority', value)}
          />
          <Input
            label="Start Date"
            type="date"
            value={projectSettings.startDate}
            onChange={(e) => handleProjectSettingChange('startDate', e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={projectSettings.endDate}
            onChange={(e) => handleProjectSettingChange('endDate', e.target.value)}
          />
          <Input
            label="Budget"
            type="number"
            value={projectSettings.budget}
            onChange={(e) => handleProjectSettingChange('budget', e.target.value)}
          />
          <Select
            label="Currency"
            options={currencyOptions}
            value={projectSettings.currency}
            onChange={(value) => handleProjectSettingChange('currency', value)}
          />
          <div className="md:col-span-2">
            <Select
              label="Timezone"
              options={timezoneOptions}
              value={projectSettings.timezone}
              onChange={(value) => handleProjectSettingChange('timezone', value)}
              searchable
            />
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-foreground">Team Members</h3>
          <Button variant="default" size="sm" iconName="UserPlus" iconPosition="left">
            Invite Member
          </Button>
        </div>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-foreground">{member.name}</h4>
                  <p className="text-sm text-text-secondary">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary">
                      Joined {new Date(member.joinedDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-text-secondary">•</span>
                    <span className="text-xs text-text-secondary">
                      {formatLastActive(member.lastActive)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                  {member.role}
                </span>
                <Select
                  options={roleOptions}
                  value={member.role}
                  onChange={(value) => handleRoleChange(member.id, value)}
                  className="w-40"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Trash2"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={member.role === 'owner'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Notification Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Email Notifications</h4>
            <Checkbox
              label="Task assignments and updates"
              checked={notifications.taskAssignments}
              onChange={(e) => handleNotificationChange('taskAssignments', e.target.checked)}
            />
            <Checkbox
              label="Deadline reminders"
              checked={notifications.deadlineReminders}
              onChange={(e) => handleNotificationChange('deadlineReminders', e.target.checked)}
            />
            <Checkbox
              label="Status changes"
              checked={notifications.statusChanges}
              onChange={(e) => handleNotificationChange('statusChanges', e.target.checked)}
            />
            <Checkbox
              label="Weekly progress reports"
              checked={notifications.weeklyReports}
              onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
            />
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Integration Notifications</h4>
            <Checkbox
              label="Slack notifications"
              checked={notifications.slackIntegration}
              onChange={(e) => handleNotificationChange('slackIntegration', e.target.checked)}
            />
            <Checkbox
              label="Microsoft Teams notifications"
              checked={notifications.teamsIntegration}
              onChange={(e) => handleNotificationChange('teamsIntegration', e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Workflow Settings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Workflow Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Checkbox
              label="Auto-assign tasks to available members"
              description="Automatically distribute new tasks based on workload"
              checked={workflowSettings.autoAssignTasks}
              onChange={(e) => handleWorkflowChange('autoAssignTasks', e.target.checked)}
            />
            <Checkbox
              label="Require approval for task completion"
              description="Tasks need admin approval before marking as done"
              checked={workflowSettings.requireApproval}
              onChange={(e) => handleWorkflowChange('requireApproval', e.target.checked)}
            />
            <Checkbox
              label="Enable time tracking"
              description="Allow team members to log time spent on tasks"
              checked={workflowSettings.enableTimeTracking}
              onChange={(e) => handleWorkflowChange('enableTimeTracking', e.target.checked)}
            />
          </div>
          <div className="space-y-4">
            <Checkbox
              label="Allow guest access"
              description="External users can view project with limited permissions"
              checked={workflowSettings.allowGuestAccess}
              onChange={(e) => handleWorkflowChange('allowGuestAccess', e.target.checked)}
            />
            <Checkbox
              label="Mandatory comments on status changes"
              description="Require explanation when changing task status"
              checked={workflowSettings.mandatoryComments}
              onChange={(e) => handleWorkflowChange('mandatoryComments', e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-foreground">Integrations</h3>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            Add Integration
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name={integration.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{integration.name}</h4>
                  <p className="text-sm text-text-secondary">{integration.description}</p>
                  {integration.connected && integration.lastSync && (
                    <p className="text-xs text-success">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  integration.connected ? 'text-success bg-success/10' : 'text-text-secondary bg-muted'
                }`}>
                  {integration.connected ? 'Connected' : 'Not Connected'}
                </span>
                <Button
                  variant={integration.connected ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleIntegrationToggle(integration.id)}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-lg border border-error/20 p-6">
        <h3 className="text-lg font-medium text-error mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-error/20 bg-error/5">
            <div>
              <h4 className="font-medium text-foreground">Archive Project</h4>
              <p className="text-sm text-text-secondary">
                Archive this project to hide it from active projects. You can restore it later.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Archive
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-error/20 bg-error/5">
            <div>
              <h4 className="font-medium text-foreground">Delete Project</h4>
              <p className="text-sm text-text-secondary">
                Permanently delete this project and all its data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;