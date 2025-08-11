// OpenAI API service for AI project generation
import { debounce } from 'lodash';

class OpenAIService {
  constructor() {
    // In a real implementation, this would come from environment variables
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || 'demo-key';
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-3.5-turbo';
    
    // Rate limiting
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.maxRequestsPerMinute = 10;
    
    // Debounced function for auto-generation
    this.debouncedGenerate = debounce(this.generateProjectSuggestions.bind(this), 2500);
  }

  // Check rate limits
  checkRateLimit() {
    const now = Date.now();
    const timeDiff = now - this.lastRequestTime;
    
    if (timeDiff > 60000) {
      // Reset counter every minute
      this.requestCount = 0;
    }
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
  }

  // Generate project suggestions based on project name and type
  async generateProjectSuggestions(projectName, projectType = 'general', teamSize = 5, teamExperience = 'intermediate') {
    try {
      this.checkRateLimit();

      // For demo purposes, return mock data instead of making actual API calls
      // In production, uncomment the API call below
      return this.getMockProjectSuggestions(projectName, projectType, teamSize, teamExperience);

      /* 
      // Real OpenAI API implementation:
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: this.getUserPrompt(projectName, projectType, teamSize, teamExperience)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseAIResponse(content);
      */
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate AI suggestions: ${error.message}`);
    }
  }

  // System prompt for OpenAI
  getSystemPrompt() {
    return `You are an expert project manager and software architect. Generate comprehensive project plans with the following structure:

    Return a JSON object with:
    {
      "description": "Detailed project description and objectives",
      "recommendedType": "most appropriate project type",
      "recommendedTeamSize": number,
      "recommendedExperience": "junior|intermediate|senior|expert",
      "estimatedDuration": number (in days),
      "estimatedTasks": number,
      "phases": ["Phase 1", "Phase 2", ...],
      "technologies": ["Tech 1", "Tech 2", ...],
      "tasks": [
        {
          "phase": "Phase name",
          "title": "Task title",
          "description": "Task description",
          "priority": "high|medium|low",
          "estimatedHours": number,
          "dependencies": ["Task title if any"]
        }
      ],
      "risks": ["Risk 1", "Risk 2", ...],
      "teamRecommendations": ["Recommendation 1", "Recommendation 2", ...]
    }

    Focus on practical, actionable content. Be specific and realistic.`;
  }

  // User prompt for OpenAI
  getUserPrompt(projectName, projectType, teamSize, teamExperience) {
    return `Generate a comprehensive project plan for:
    
    Project Name: ${projectName}
    Project Type: ${projectType}
    Team Size: ${teamSize} people
    Team Experience: ${teamExperience}
    
    Provide detailed phases, tasks, technology recommendations, and risk assessment.`;
  }

  // Parse AI response (for real API implementation)
  parseAIResponse(content) {
    try {
      // Remove any markdown formatting
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (error) {
      throw new Error('Failed to parse AI response');
    }
  }

  // Mock data for demo purposes
  getMockProjectSuggestions(projectName, projectType, teamSize, teamExperience) {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const mockData = this.generateMockData(projectName, projectType, teamSize, teamExperience);
        resolve(mockData);
      }, 1500 + Math.random() * 1000); // 1.5-2.5 second delay
    });
  }

  generateMockData(projectName, projectType, teamSize, teamExperience) {
    const typeData = this.getProjectTypeData(projectType);
    const experienceMultiplier = this.getExperienceMultiplier(teamExperience);
    
    const baseDuration = typeData.baseDuration * experienceMultiplier;
    const baseTasks = Math.ceil(typeData.baseTasks * (teamSize / 5));

    return {
      name: projectName,
      description: `${projectName} is a comprehensive ${typeData.label.toLowerCase()} designed to ${typeData.objective}. This project will leverage modern development practices and cutting-edge technologies to deliver a scalable, maintainable solution that meets current market demands and future growth requirements.`,
      recommendedType: projectType,
      recommendedTeamSize: Math.min(Math.max(teamSize, typeData.minTeam), typeData.maxTeam),
      recommendedExperience: teamExperience,
      estimatedDuration: Math.ceil(baseDuration),
      estimatedTasks: baseTasks,
      phases: typeData.phases,
      technologies: typeData.technologies,
      tasks: this.generateTasks(typeData.phases, projectType, teamExperience),
      risks: typeData.risks,
      teamRecommendations: typeData.teamRecommendations,
      type: {
        icon: typeData.icon,
        label: typeData.label,
        color: typeData.color
      }
    };
  }

  getProjectTypeData(projectType) {
    const typeMap = {
      general: {
        label: 'General Project',
        objective: 'deliver a flexible solution with customizable workflow',
        baseDuration: 30,
        baseTasks: 25,
        minTeam: 2,
        maxTeam: 8,
        icon: 'Folder',
        color: 'bg-gray-500',
        phases: ['Planning & Analysis', 'Design & Architecture', 'Development', 'Testing & QA', 'Deployment & Launch'],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        risks: ['Scope creep due to flexible requirements', 'Resource allocation challenges', 'Timeline estimation difficulties'],
        teamRecommendations: ['Assign dedicated project manager', 'Establish clear communication protocols', 'Implement agile methodology']
      },
      web_application: {
        label: 'Web Application',
        objective: 'create a robust, scalable web platform with modern user experience',
        baseDuration: 45,
        baseTasks: 35,
        minTeam: 3,
        maxTeam: 10,
        icon: 'Globe',
        color: 'bg-blue-500',
        phases: ['Requirements Gathering', 'UI/UX Design', 'Frontend Development', 'Backend Development', 'Integration & Testing', 'Deployment'],
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Redis', 'AWS/Azure'],
        risks: ['Browser compatibility issues', 'Performance bottlenecks', 'Security vulnerabilities', 'Third-party API dependencies'],
        teamRecommendations: ['Include dedicated UI/UX designer', 'Implement automated testing early', 'Plan for scalability from start']
      },
      mobile_app: {
        label: 'Mobile App',
        objective: 'develop a native or cross-platform mobile application with excellent user experience',
        baseDuration: 60,
        baseTasks: 40,
        minTeam: 3,
        maxTeam: 8,
        icon: 'Smartphone',
        color: 'bg-green-500',
        phases: ['Market Research', 'App Design', 'Development', 'Testing on Devices', 'App Store Submission', 'Launch & Marketing'],
        technologies: ['React Native', 'Flutter', 'Firebase', 'Redux', 'Push Notifications', 'Analytics'],
        risks: ['App store approval delays', 'Device fragmentation', 'Performance on older devices', 'Platform-specific issues'],
        teamRecommendations: ['Include mobile UX specialist', 'Test on multiple devices early', 'Plan app store optimization strategy']
      },
      ecommerce_platform: {
        label: 'E-commerce Platform',
        objective: 'build a comprehensive online marketplace with secure payment processing',
        baseDuration: 75,
        baseTasks: 50,
        minTeam: 5,
        maxTeam: 12,
        icon: 'ShoppingCart',
        color: 'bg-purple-500',
        phases: ['Market Analysis', 'Platform Architecture', 'Core Development', 'Payment Integration', 'Security Implementation', 'Launch & Optimization'],
        technologies: ['React', 'Node.js', 'Stripe/PayPal', 'PostgreSQL', 'Redis', 'Elasticsearch', 'CDN'],
        risks: ['Payment security compliance', 'High traffic handling', 'Inventory management complexity', 'Multi-vendor coordination'],
        teamRecommendations: ['Include security specialist', 'Implement robust testing for payments', 'Plan for peak traffic scenarios']
      },
      saas_application: {
        label: 'SaaS Application',
        objective: 'create a multi-tenant cloud-based software solution with subscription model',
        baseDuration: 90,
        baseTasks: 60,
        minTeam: 6,
        maxTeam: 15,
        icon: 'Cloud',
        color: 'bg-indigo-500',
        phases: ['Product Strategy', 'Multi-tenant Architecture', 'Core Platform Development', 'Billing Integration', 'Analytics & Monitoring', 'Go-to-Market'],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'Stripe', 'Analytics', 'Monitoring'],
        risks: ['Multi-tenancy complexity', 'Data isolation challenges', 'Scalability requirements', 'Subscription billing complexity'],
        teamRecommendations: ['Include DevOps engineer', 'Plan comprehensive monitoring', 'Implement automated scaling']
      },
      devops_infrastructure: {
        label: 'DevOps/Infrastructure',
        objective: 'establish robust CI/CD pipelines and infrastructure automation',
        baseDuration: 40,
        baseTasks: 30,
        minTeam: 2,
        maxTeam: 6,
        icon: 'Server',
        color: 'bg-orange-500',
        phases: ['Infrastructure Assessment', 'CI/CD Pipeline Design', 'Automation Implementation', 'Monitoring Setup', 'Security Hardening', 'Documentation'],
        technologies: ['Docker', 'Kubernetes', 'Jenkins/GitHub Actions', 'Terraform', 'Prometheus', 'Grafana', 'AWS/Azure'],
        risks: ['Infrastructure downtime', 'Security misconfigurations', 'Automation complexity', 'Tool integration challenges'],
        teamRecommendations: ['Include security expert', 'Implement comprehensive monitoring', 'Plan disaster recovery procedures']
      }
    };

    return typeMap[projectType] || typeMap.general;
  }

  getExperienceMultiplier(experience) {
    const multipliers = {
      junior: 1.5,
      intermediate: 1.0,
      senior: 0.8,
      expert: 0.6
    };
    return multipliers[experience] || 1.0;
  }

  generateTasks(phases, projectType, teamExperience) {
    const tasks = [];
    const taskTemplates = this.getTaskTemplates(projectType);
    
    phases.forEach((phase, phaseIndex) => {
      const phaseTasks = taskTemplates[phaseIndex] || taskTemplates[0];
      phaseTasks.forEach(taskTemplate => {
        tasks.push({
          phase,
          title: taskTemplate.title,
          description: taskTemplate.description,
          priority: taskTemplate.priority,
          estimatedHours: this.adjustHoursForExperience(taskTemplate.estimatedHours, teamExperience),
          dependencies: taskTemplate.dependencies || []
        });
      });
    });

    return tasks;
  }

  getTaskTemplates(projectType) {
    // Return task templates based on project type
    // This is a simplified version - in reality, this would be much more comprehensive
    return [
      [
        { title: 'Project Kickoff Meeting', description: 'Align team on project goals and timeline', priority: 'high', estimatedHours: 4 },
        { title: 'Requirements Analysis', description: 'Gather and document detailed requirements', priority: 'high', estimatedHours: 16 },
        { title: 'Technical Architecture Planning', description: 'Design system architecture and technology stack', priority: 'high', estimatedHours: 12 }
      ],
      [
        { title: 'UI/UX Design', description: 'Create user interface designs and user experience flows', priority: 'high', estimatedHours: 24 },
        { title: 'Database Schema Design', description: 'Design database structure and relationships', priority: 'high', estimatedHours: 8 },
        { title: 'API Design', description: 'Define API endpoints and data structures', priority: 'medium', estimatedHours: 12 }
      ],
      [
        { title: 'Core Feature Development', description: 'Implement main application features', priority: 'high', estimatedHours: 40 },
        { title: 'Authentication System', description: 'Implement user authentication and authorization', priority: 'high', estimatedHours: 16 },
        { title: 'Data Integration', description: 'Connect frontend with backend services', priority: 'medium', estimatedHours: 20 }
      ]
    ];
  }

  adjustHoursForExperience(baseHours, experience) {
    const multiplier = this.getExperienceMultiplier(experience);
    return Math.ceil(baseHours * multiplier);
  }

  // Debounced auto-generation trigger
  autoGenerateFromName(projectName, projectType, teamSize, teamExperience) {
    if (projectName && projectName.length > 3) {
      return this.debouncedGenerate(projectName, projectType, teamSize, teamExperience);
    }
    return Promise.resolve(null);
  }

  // Cancel pending auto-generation
  cancelAutoGeneration() {
    this.debouncedGenerate.cancel();
  }
}

export default new OpenAIService();
