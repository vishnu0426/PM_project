import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';
import { Checkbox } from '../ui/Checkbox';
import Icon from '../AppIcon';

const ProjectConfirmationSummary = ({ 
  onFinalize, 
  onBack, 
  projectData = {}, 
  className 
}) => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    slack: false,
    teams: false
  });

  const [launchOptions, setLaunchOptions] = useState({
    createRepository: true,
    setupCI: false,
    deployStaging: false,
    inviteTeam: true,
    generateDocumentation: true
  });

  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    dataProcessing: false,
    teamNotification: false
  });

  const [isValidated, setIsValidated] = useState(false);

  const {
    configuration = {},
    overview = {},
    techStack = {},
    workflow = {},
    tasks = []
  } = projectData;

  React.useEffect(() => {
    const allAgreementsAccepted = Object.values(agreements).every(Boolean);
    setIsValidated(allAgreementsAccepted);
  }, [agreements]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDuration = (weeks) => {
    if (!weeks) return 'Not specified';
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    const months = Math.round(weeks / 4.33);
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const getTotalSelectedTech = () => {
    return Object.values(techStack).reduce((total, category) => {
      return total + (Array.isArray(category) ? category.length : 0);
    }, 0);
  };

  const getTotalTasks = () => {
    if (Array.isArray(tasks)) return tasks.length;
    if (workflow.phases) {
      return workflow.phases.reduce((total, phase) => total + (phase.tasks?.length || 0), 0);
    }
    return 0;
  };

  const getProjectComplexity = () => {
    const techCount = getTotalSelectedTech();
    const taskCount = getTotalTasks();
    const teamSize = Object.values(configuration.resources || {}).reduce((sum, count) => sum + count, 0);
    
    const complexityScore = (techCount * 0.3) + (taskCount * 0.4) + (teamSize * 0.3);
    
    if (complexityScore < 10) return { level: 'Simple', color: 'text-green-600', description: 'Straightforward project with minimal complexity' };
    if (complexityScore < 20) return { level: 'Moderate', color: 'text-yellow-600', description: 'Balanced project with moderate complexity' };
    if (complexityScore < 30) return { level: 'Complex', color: 'text-orange-600', description: 'Advanced project requiring careful coordination' };
    return { level: 'Enterprise', color: 'text-red-600', description: 'Large-scale project with high complexity' };
  };

  const complexity = getProjectComplexity();

  const handleFinalize = () => {
    if (isValidated) {
      onFinalize?.({
        ...projectData,
        notifications,
        launchOptions,
        finalizedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Project Summary</h2>
        <p className="text-muted-foreground">
          Review your project configuration and finalize setup
        </p>
      </div>

      {/* Project Overview Card */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{overview.title || 'Untitled Project'}</h3>
            <p className="text-muted-foreground mt-1">{overview.description || 'No description provided'}</p>
          </div>
          <div className={cn("px-3 py-1 rounded-full text-sm font-medium", complexity.color, "bg-background border")}>
            {complexity.level}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(configuration.budget)}</div>
            <div className="text-sm text-muted-foreground">Budget</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{formatDuration(configuration.duration)}</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{getTotalSelectedTech()}</div>
            <div className="text-sm text-muted-foreground">Technologies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{getTotalTasks()}</div>
            <div className="text-sm text-muted-foreground">Tasks</div>
          </div>
        </div>
      </div>

      {/* Detailed Summary Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Summary */}
        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="Settings" className="h-5 w-5" />
            Configuration
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Methodology:</span>
              <span className="font-medium">{configuration.methodology || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority:</span>
              <span className="font-medium capitalize">{configuration.priority || 'Medium'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Team Size:</span>
              <span className="font-medium">
                {Object.values(configuration.resources || {}).reduce((sum, count) => sum + count, 0)} members
              </span>
            </div>
          </div>
          
          {configuration.resources && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Team Composition:</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(configuration.resources).map(([role, count]) => 
                  count > 0 && (
                    <div key={role} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{role.replace(/([A-Z])/g, ' $1')}:</span>
                      <span>{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Technology Stack Summary */}
        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="Code" className="h-5 w-5" />
            Technology Stack
          </h3>
          
          <div className="space-y-3">
            {Object.entries(techStack).map(([category, technologies]) => {
              if (!Array.isArray(technologies) || technologies.length === 0) return null;
              
              return (
                <div key={category}>
                  <h4 className="font-medium text-foreground capitalize mb-1">
                    {category.replace(/([A-Z])/g, ' $1')}:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {technologies.map((tech) => (
                      <span 
                        key={tech}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Objectives */}
        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="Target" className="h-5 w-5" />
            Objectives & Deliverables
          </h3>
          
          {overview.objectives && overview.objectives.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Objectives:</h4>
              <ul className="space-y-1">
                {overview.objectives.filter(obj => obj.trim()).map((objective, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {overview.deliverables && overview.deliverables.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Deliverables:</h4>
              <ul className="space-y-1">
                {overview.deliverables.filter(del => del.trim()).map((deliverable, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Icon name="Package" className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Timeline & Milestones */}
        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="Calendar" className="h-5 w-5" />
            Timeline & Milestones
          </h3>
          
          <div className="space-y-3">
            {overview.timeline?.startDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">
                  {new Date(overview.timeline.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {overview.timeline?.endDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">
                  {new Date(overview.timeline.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          {overview.timeline?.milestones && overview.timeline.milestones.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Key Milestones:</h4>
              <div className="space-y-2">
                {overview.timeline.milestones.filter(m => m.name.trim()).map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Icon name="Flag" className="h-3 w-3 text-orange-600" />
                    <span className="font-medium">{milestone.name}</span>
                    {milestone.date && (
                      <span className="text-muted-foreground">
                        - {new Date(milestone.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Bell" className="h-5 w-5" />
          Notification Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Email Notifications"
            description="Receive project updates via email"
            checked={notifications.email}
            onChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
          />

          <Toggle
            label="Push Notifications"
            description="Browser push notifications for urgent updates"
            checked={notifications.push}
            onChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
          />

          <Toggle
            label="Slack Integration"
            description="Send updates to Slack channels"
            checked={notifications.slack}
            onChange={(checked) => setNotifications(prev => ({ ...prev, slack: checked }))}
          />

          <Toggle
            label="Microsoft Teams"
            description="Integrate with Teams for notifications"
            checked={notifications.teams}
            onChange={(checked) => setNotifications(prev => ({ ...prev, teams: checked }))}
          />
        </div>
      </div>

      {/* Launch Options */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Rocket" className="h-5 w-5" />
          Project Launch Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Create Git Repository"
            description="Set up version control repository"
            checked={launchOptions.createRepository}
            onChange={(checked) => setLaunchOptions(prev => ({ ...prev, createRepository: checked }))}
          />

          <Toggle
            label="Setup CI/CD Pipeline"
            description="Configure automated testing and deployment"
            checked={launchOptions.setupCI}
            onChange={(checked) => setLaunchOptions(prev => ({ ...prev, setupCI: checked }))}
          />

          <Toggle
            label="Deploy Staging Environment"
            description="Create staging environment for testing"
            checked={launchOptions.deployStaging}
            onChange={(checked) => setLaunchOptions(prev => ({ ...prev, deployStaging: checked }))}
          />

          <Toggle
            label="Invite Team Members"
            description="Send invitations to project team"
            checked={launchOptions.inviteTeam}
            onChange={(checked) => setLaunchOptions(prev => ({ ...prev, inviteTeam: checked }))}
          />

          <Toggle
            label="Generate Documentation"
            description="Create initial project documentation"
            checked={launchOptions.generateDocumentation}
            onChange={(checked) => setLaunchOptions(prev => ({ ...prev, generateDocumentation: checked }))}
          />
        </div>
      </div>

      {/* Risk Assessment & Recommendations */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="AlertTriangle" className="h-5 w-5" />
          Project Assessment
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/30">
            <h4 className="font-medium text-foreground mb-2">Complexity Analysis</h4>
            <p className="text-sm text-muted-foreground mb-2">{complexity.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Complexity Level:</span>
              <span className={cn("font-bold", complexity.color)}>{complexity.level}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Well-defined objectives and deliverables</li>
                <li>• Appropriate technology stack selection</li>
                <li>• Clear timeline and milestones</li>
                <li>• Balanced team composition</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <Icon name="AlertTriangle" className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Regular progress reviews and checkpoints</li>
                <li>• Risk mitigation planning</li>
                <li>• Stakeholder communication plan</li>
                <li>• Quality assurance processes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Agreements */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="FileText" className="h-5 w-5" />
          Terms and Agreements
        </h3>

        <div className="space-y-3">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={agreements.termsAccepted}
              onChange={(checked) => setAgreements(prev => ({ ...prev, termsAccepted: checked }))}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-foreground">Terms of Service</div>
              <div className="text-sm text-muted-foreground">
                I agree to the terms of service and project management guidelines
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <Checkbox
              checked={agreements.dataProcessing}
              onChange={(checked) => setAgreements(prev => ({ ...prev, dataProcessing: checked }))}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-foreground">Data Processing Agreement</div>
              <div className="text-sm text-muted-foreground">
                I consent to the processing of project data for management and analytics purposes
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <Checkbox
              checked={agreements.teamNotification}
              onChange={(checked) => setAgreements(prev => ({ ...prev, teamNotification: checked }))}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-foreground">Team Notification</div>
              <div className="text-sm text-muted-foreground">
                I authorize sending project invitations and notifications to team members
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Final Actions */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-border">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Ready to Launch Your Project?</h3>
          <p className="text-muted-foreground">
            Review all settings above and click "Launch Project" to begin your journey.
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Icon
                name={isValidated ? "CheckCircle" : "AlertCircle"}
                className={cn("h-4 w-4", isValidated ? "text-green-600" : "text-red-600")}
              />
              <span className={isValidated ? "text-green-600" : "text-red-600"}>
                {isValidated ? "All requirements met" : "Please accept all agreements"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Tasks
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Step 6 of 6
          </div>
          <Button
            onClick={handleFinalize}
            disabled={!isValidated}
            iconName="Rocket"
            iconPosition="right"
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Launch Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectConfirmationSummary;
