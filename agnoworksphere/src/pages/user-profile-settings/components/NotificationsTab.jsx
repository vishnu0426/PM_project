import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const NotificationsTab = ({ onSave }) => {
  const [emailNotifications, setEmailNotifications] = useState({
    projectUpdates: true,
    taskAssignments: true,
    mentions: true,
    dueDates: true,
    comments: false,
    weeklyDigest: true,
    securityAlerts: true
  });

  const [inAppNotifications, setInAppNotifications] = useState({
    projectUpdates: true,
    taskAssignments: true,
    mentions: true,
    dueDates: true,
    comments: true,
    teamActivity: false
  });

  const [projectSpecific, setProjectSpecific] = useState({
    'project-1': {
      name: 'Website Redesign',
      enabled: true,
      mentions: true,
      updates: true,
      deadlines: true
    },
    'project-2': {
      name: 'Mobile App Development',
      enabled: false,
      mentions: false,
      updates: false,
      deadlines: true
    },
    'project-3': {
      name: 'Marketing Campaign',
      enabled: true,
      mentions: true,
      updates: false,
      deadlines: true
    }
  });

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    startTime: '22:00',
    endTime: '08:00',
    timezone: 'America/New_York'
  });

  const handleEmailNotificationChange = (key, checked) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleInAppNotificationChange = (key, checked) => {
    setInAppNotifications(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleProjectNotificationChange = (projectId, key, checked) => {
    setProjectSpecific(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [key]: checked
      }
    }));
  };

  const handleQuietHoursChange = (key, value) => {
    setQuietHours(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    const notificationSettings = {
      email: emailNotifications,
      inApp: inAppNotifications,
      projects: projectSpecific,
      quietHours: quietHours
    };
    onSave(notificationSettings);
  };

  const handleTestNotification = () => {
    // Mock test notification
    console.log('Sending test notification...');
  };

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Icon name="Mail" size={20} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Choose what updates you want to receive via email
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestNotification}
            iconName="Send"
            iconPosition="left"
          >
            Test Email
          </Button>
        </div>

        <div className="space-y-4">
          <Checkbox
            label="Project Updates"
            description="Get notified when projects you're involved in have updates"
            checked={emailNotifications.projectUpdates}
            onChange={(e) => handleEmailNotificationChange('projectUpdates', e.target.checked)}
          />
          
          <Checkbox
            label="Task Assignments"
            description="Receive emails when you're assigned to new tasks"
            checked={emailNotifications.taskAssignments}
            onChange={(e) => handleEmailNotificationChange('taskAssignments', e.target.checked)}
          />
          
          <Checkbox
            label="Mentions"
            description="Get notified when someone mentions you in comments"
            checked={emailNotifications.mentions}
            onChange={(e) => handleEmailNotificationChange('mentions', e.target.checked)}
          />
          
          <Checkbox
            label="Due Dates"
            description="Reminders for upcoming task deadlines"
            checked={emailNotifications.dueDates}
            onChange={(e) => handleEmailNotificationChange('dueDates', e.target.checked)}
          />
          
          <Checkbox
            label="Comments"
            description="New comments on tasks you're watching"
            checked={emailNotifications.comments}
            onChange={(e) => handleEmailNotificationChange('comments', e.target.checked)}
          />
          
          <Checkbox
            label="Weekly Digest"
            description="Summary of your week's activity and upcoming tasks"
            checked={emailNotifications.weeklyDigest}
            onChange={(e) => handleEmailNotificationChange('weeklyDigest', e.target.checked)}
          />
          
          <Checkbox
            label="Security Alerts"
            description="Important security notifications (always enabled)"
            checked={emailNotifications.securityAlerts}
            onChange={(e) => handleEmailNotificationChange('securityAlerts', e.target.checked)}
            disabled
          />
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Bell" size={20} className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">In-App Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Control what notifications appear in the application
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Checkbox
            label="Project Updates"
            description="Show notifications for project changes"
            checked={inAppNotifications.projectUpdates}
            onChange={(e) => handleInAppNotificationChange('projectUpdates', e.target.checked)}
          />
          
          <Checkbox
            label="Task Assignments"
            description="Notify when you're assigned to tasks"
            checked={inAppNotifications.taskAssignments}
            onChange={(e) => handleInAppNotificationChange('taskAssignments', e.target.checked)}
          />
          
          <Checkbox
            label="Mentions"
            description="Show when you're mentioned in comments"
            checked={inAppNotifications.mentions}
            onChange={(e) => handleInAppNotificationChange('mentions', e.target.checked)}
          />
          
          <Checkbox
            label="Due Dates"
            description="Reminders for task deadlines"
            checked={inAppNotifications.dueDates}
            onChange={(e) => handleInAppNotificationChange('dueDates', e.target.checked)}
          />
          
          <Checkbox
            label="Comments"
            description="New comments on your tasks"
            checked={inAppNotifications.comments}
            onChange={(e) => handleInAppNotificationChange('comments', e.target.checked)}
          />
          
          <Checkbox
            label="Team Activity"
            description="General team activity updates"
            checked={inAppNotifications.teamActivity}
            onChange={(e) => handleInAppNotificationChange('teamActivity', e.target.checked)}
          />
        </div>
      </div>

      {/* Project-Specific Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="FolderOpen" size={20} className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Project-Specific Settings</h3>
            <p className="text-sm text-muted-foreground">
              Customize notifications for individual projects
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(projectSpecific).map(([projectId, project]) => (
            <div key={projectId} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="Folder" size={16} className="text-primary-foreground" />
                  </div>
                  <h4 className="font-medium text-foreground">{project.name}</h4>
                </div>
                <Checkbox
                  label="Enable notifications"
                  checked={project.enabled}
                  onChange={(e) => handleProjectNotificationChange(projectId, 'enabled', e.target.checked)}
                />
              </div>

              {project.enabled && (
                <div className="ml-11 space-y-3">
                  <Checkbox
                    label="Mentions"
                    checked={project.mentions}
                    onChange={(e) => handleProjectNotificationChange(projectId, 'mentions', e.target.checked)}
                    size="sm"
                  />
                  <Checkbox
                    label="Project Updates"
                    checked={project.updates}
                    onChange={(e) => handleProjectNotificationChange(projectId, 'updates', e.target.checked)}
                    size="sm"
                  />
                  <Checkbox
                    label="Deadlines"
                    checked={project.deadlines}
                    onChange={(e) => handleProjectNotificationChange(projectId, 'deadlines', e.target.checked)}
                    size="sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Moon" size={20} className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quiet Hours</h3>
            <p className="text-sm text-muted-foreground">
              Set times when you don't want to receive notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Checkbox
            label="Enable quiet hours"
            description="Pause non-urgent notifications during specified times"
            checked={quietHours.enabled}
            onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
          />

          {quietHours.enabled && (
            <div className="ml-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.startTime}
                    onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.endTime}
                    onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Timezone
                </label>
                <select
                  value={quietHours.timezone}
                  onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Changes are saved automatically
        </div>
        
        <Button
          variant="default"
          onClick={handleSave}
          iconName="Save"
          iconPosition="left"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationsTab;