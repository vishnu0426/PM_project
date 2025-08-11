import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Icon from '../AppIcon';

const TechStackDisplay = ({ 
  onNext, 
  onBack, 
  initialData = {}, 
  className 
}) => {
  const [selectedTechnologies, setSelectedTechnologies] = useState({
    frontend: [],
    backend: [],
    database: [],
    cloud: [],
    tools: [],
    ...initialData
  });

  const [selectedTech, setSelectedTech] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const techCategories = {
    frontend: {
      title: 'Frontend Technologies',
      icon: 'Monitor',
      description: 'User interface and client-side technologies',
      technologies: [
        {
          id: 'react',
          name: 'React',
          description: 'A JavaScript library for building user interfaces',
          icon: '⚛️',
          popularity: 95,
          learningCurve: 'Medium',
          documentation: 'https://reactjs.org/docs',
          pros: ['Component-based', 'Large ecosystem', 'Strong community'],
          cons: ['Steep learning curve', 'Frequent updates'],
          useCases: ['SPAs', 'Web applications', 'Mobile apps with React Native']
        },
        {
          id: 'vue',
          name: 'Vue.js',
          description: 'Progressive JavaScript framework for building UIs',
          icon: '🟢',
          popularity: 85,
          learningCurve: 'Easy',
          documentation: 'https://vuejs.org/guide/',
          pros: ['Easy to learn', 'Flexible', 'Good performance'],
          cons: ['Smaller ecosystem', 'Less job market'],
          useCases: ['Progressive enhancement', 'SPAs', 'Prototyping']
        },
        {
          id: 'angular',
          name: 'Angular',
          description: 'Platform for building mobile and desktop web applications',
          icon: '🅰️',
          popularity: 75,
          learningCurve: 'Hard',
          documentation: 'https://angular.io/docs',
          pros: ['Full framework', 'TypeScript support', 'Enterprise-ready'],
          cons: ['Complex', 'Heavy', 'Steep learning curve'],
          useCases: ['Enterprise applications', 'Large-scale projects']
        },
        {
          id: 'svelte',
          name: 'Svelte',
          description: 'Cybernetically enhanced web apps',
          icon: '🔥',
          popularity: 70,
          learningCurve: 'Easy',
          documentation: 'https://svelte.dev/docs',
          pros: ['No virtual DOM', 'Small bundle size', 'Easy to learn'],
          cons: ['Smaller ecosystem', 'Less tooling'],
          useCases: ['Performance-critical apps', 'Small to medium projects']
        }
      ]
    },
    backend: {
      title: 'Backend Technologies',
      icon: 'Server',
      description: 'Server-side technologies and frameworks',
      technologies: [
        {
          id: 'nodejs',
          name: 'Node.js',
          description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
          icon: '🟢',
          popularity: 90,
          learningCurve: 'Medium',
          documentation: 'https://nodejs.org/en/docs/',
          pros: ['JavaScript everywhere', 'Fast development', 'Large ecosystem'],
          cons: ['Single-threaded', 'Not ideal for CPU-intensive tasks'],
          useCases: ['APIs', 'Real-time applications', 'Microservices']
        },
        {
          id: 'python',
          name: 'Python/Django',
          description: 'High-level Python web framework',
          icon: '🐍',
          popularity: 85,
          learningCurve: 'Easy',
          documentation: 'https://docs.djangoproject.com/',
          pros: ['Rapid development', 'Batteries included', 'Great for AI/ML'],
          cons: ['Performance limitations', 'GIL limitations'],
          useCases: ['Web applications', 'APIs', 'Data science applications']
        },
        {
          id: 'java',
          name: 'Java/Spring',
          description: 'Enterprise Java application framework',
          icon: '☕',
          popularity: 80,
          learningCurve: 'Hard',
          documentation: 'https://spring.io/guides',
          pros: ['Enterprise-ready', 'Strong typing', 'Mature ecosystem'],
          cons: ['Verbose', 'Complex configuration', 'Slower development'],
          useCases: ['Enterprise applications', 'Microservices', 'Large systems']
        },
        {
          id: 'dotnet',
          name: '.NET Core',
          description: 'Cross-platform framework for building modern applications',
          icon: '🔷',
          popularity: 75,
          learningCurve: 'Medium',
          documentation: 'https://docs.microsoft.com/en-us/dotnet/',
          pros: ['Cross-platform', 'High performance', 'Strong typing'],
          cons: ['Microsoft ecosystem', 'Learning curve'],
          useCases: ['Enterprise applications', 'APIs', 'Desktop applications']
        }
      ]
    },
    database: {
      title: 'Database Technologies',
      icon: 'Database',
      description: 'Data storage and management solutions',
      technologies: [
        {
          id: 'postgresql',
          name: 'PostgreSQL',
          description: 'Advanced open source relational database',
          icon: '🐘',
          popularity: 90,
          learningCurve: 'Medium',
          documentation: 'https://www.postgresql.org/docs/',
          pros: ['ACID compliant', 'Extensible', 'JSON support'],
          cons: ['Complex for simple use cases', 'Memory usage'],
          useCases: ['Complex queries', 'Data integrity', 'Analytics']
        },
        {
          id: 'mongodb',
          name: 'MongoDB',
          description: 'Document-oriented NoSQL database',
          icon: '🍃',
          popularity: 85,
          learningCurve: 'Easy',
          documentation: 'https://docs.mongodb.com/',
          pros: ['Flexible schema', 'Horizontal scaling', 'JSON-like documents'],
          cons: ['No ACID transactions', 'Memory usage', 'Consistency issues'],
          useCases: ['Rapid prototyping', 'Content management', 'Real-time analytics']
        },
        {
          id: 'mysql',
          name: 'MySQL',
          description: 'Popular open source relational database',
          icon: '🐬',
          popularity: 80,
          learningCurve: 'Easy',
          documentation: 'https://dev.mysql.com/doc/',
          pros: ['Easy to use', 'Fast', 'Widely supported'],
          cons: ['Limited features', 'Licensing concerns'],
          useCases: ['Web applications', 'E-commerce', 'Content management']
        },
        {
          id: 'redis',
          name: 'Redis',
          description: 'In-memory data structure store',
          icon: '🔴',
          popularity: 85,
          learningCurve: 'Easy',
          documentation: 'https://redis.io/documentation',
          pros: ['Very fast', 'Multiple data types', 'Pub/Sub'],
          cons: ['Memory-based', 'Data persistence complexity'],
          useCases: ['Caching', 'Session storage', 'Real-time analytics']
        }
      ]
    },
    cloud: {
      title: 'Cloud & Infrastructure',
      icon: 'Cloud',
      description: 'Cloud platforms and infrastructure services',
      technologies: [
        {
          id: 'aws',
          name: 'Amazon AWS',
          description: 'Comprehensive cloud computing platform',
          icon: '☁️',
          popularity: 95,
          learningCurve: 'Hard',
          documentation: 'https://docs.aws.amazon.com/',
          pros: ['Comprehensive services', 'Global infrastructure', 'Market leader'],
          cons: ['Complex pricing', 'Steep learning curve', 'Vendor lock-in'],
          useCases: ['Enterprise applications', 'Scalable systems', 'Global deployment']
        },
        {
          id: 'gcp',
          name: 'Google Cloud',
          description: 'Google\'s cloud computing services',
          icon: '🌐',
          popularity: 80,
          learningCurve: 'Medium',
          documentation: 'https://cloud.google.com/docs',
          pros: ['AI/ML services', 'Competitive pricing', 'Kubernetes native'],
          cons: ['Smaller market share', 'Less enterprise features'],
          useCases: ['AI/ML applications', 'Data analytics', 'Modern applications']
        },
        {
          id: 'azure',
          name: 'Microsoft Azure',
          description: 'Microsoft\'s cloud computing platform',
          icon: '🔷',
          popularity: 85,
          learningCurve: 'Medium',
          documentation: 'https://docs.microsoft.com/en-us/azure/',
          pros: ['Enterprise integration', 'Hybrid cloud', '.NET ecosystem'],
          cons: ['Complex pricing', 'Windows-centric'],
          useCases: ['Enterprise applications', 'Hybrid cloud', '.NET applications']
        },
        {
          id: 'docker',
          name: 'Docker',
          description: 'Platform for developing, shipping, and running applications',
          icon: '🐳',
          popularity: 90,
          learningCurve: 'Medium',
          documentation: 'https://docs.docker.com/',
          pros: ['Consistent environments', 'Easy deployment', 'Microservices'],
          cons: ['Learning curve', 'Security considerations'],
          useCases: ['Containerization', 'Microservices', 'CI/CD']
        }
      ]
    },
    tools: {
      title: 'Development Tools',
      icon: 'Wrench',
      description: 'Development and productivity tools',
      technologies: [
        {
          id: 'git',
          name: 'Git',
          description: 'Distributed version control system',
          icon: '📝',
          popularity: 98,
          learningCurve: 'Medium',
          documentation: 'https://git-scm.com/doc',
          pros: ['Distributed', 'Branching', 'Industry standard'],
          cons: ['Learning curve', 'Complex for beginners'],
          useCases: ['Version control', 'Collaboration', 'Code history']
        },
        {
          id: 'webpack',
          name: 'Webpack',
          description: 'Static module bundler for modern JavaScript applications',
          icon: '📦',
          popularity: 85,
          learningCurve: 'Hard',
          documentation: 'https://webpack.js.org/concepts/',
          pros: ['Powerful bundling', 'Plugin ecosystem', 'Code splitting'],
          cons: ['Complex configuration', 'Learning curve'],
          useCases: ['Module bundling', 'Asset optimization', 'Build processes']
        },
        {
          id: 'jest',
          name: 'Jest',
          description: 'JavaScript testing framework',
          icon: '🧪',
          popularity: 90,
          learningCurve: 'Easy',
          documentation: 'https://jestjs.io/docs/getting-started',
          pros: ['Zero configuration', 'Snapshot testing', 'Mocking'],
          cons: ['JavaScript only', 'Large bundle size'],
          useCases: ['Unit testing', 'Integration testing', 'Snapshot testing']
        },
        {
          id: 'eslint',
          name: 'ESLint',
          description: 'Pluggable JavaScript linter',
          icon: '🔍',
          popularity: 95,
          learningCurve: 'Easy',
          documentation: 'https://eslint.org/docs/user-guide/',
          pros: ['Customizable', 'Plugin ecosystem', 'Auto-fixing'],
          cons: ['Configuration complexity', 'Performance impact'],
          useCases: ['Code quality', 'Style enforcement', 'Error prevention']
        }
      ]
    }
  };

  const toggleTechnology = (categoryId, techId) => {
    setSelectedTechnologies(prev => {
      const category = prev[categoryId] || [];
      const isSelected = category.includes(techId);
      
      return {
        ...prev,
        [categoryId]: isSelected 
          ? category.filter(id => id !== techId)
          : [...category, techId]
      };
    });
  };

  const openTechModal = (tech) => {
    setSelectedTech(tech);
    setIsModalOpen(true);
  };

  const getTotalSelected = () => {
    return Object.values(selectedTechnologies).reduce((total, category) => total + category.length, 0);
  };

  const handleNext = () => {
    onNext?.(selectedTechnologies);
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Technology Stack</h2>
        <p className="text-muted-foreground">
          Select the technologies and tools for your project
        </p>
        <div className="text-sm text-muted-foreground">
          {getTotalSelected()} technologies selected
        </div>
      </div>

      {/* Technology Categories */}
      <div className="space-y-8">
        {Object.entries(techCategories).map(([categoryId, category]) => (
          <div key={categoryId} className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Icon name={category.icon} className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                {selectedTechnologies[categoryId]?.length || 0} selected
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.technologies.map((tech) => {
                const isSelected = selectedTechnologies[categoryId]?.includes(tech.id);
                
                return (
                  <div
                    key={tech.id}
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:scale-105",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-md" 
                        : "border-border bg-background hover:border-primary/50"
                    )}
                    onClick={() => toggleTechnology(categoryId, tech.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{tech.icon}</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTechModal(tech);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Icon name="Info" className="h-3 w-3" />
                        </Button>
                        {isSelected && (
                          <Icon name="Check" className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-foreground mb-2">{tech.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {tech.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Icon name="TrendingUp" className="h-3 w-3" />
                        <span>{tech.popularity}%</span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        tech.learningCurve === 'Easy' && "bg-green-100 text-green-800",
                        tech.learningCurve === 'Medium' && "bg-yellow-100 text-yellow-800",
                        tech.learningCurve === 'Hard' && "bg-red-100 text-red-800"
                      )}>
                        {tech.learningCurve}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Technologies Summary */}
      {getTotalSelected() > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Package" className="h-5 w-5" />
            Selected Technology Stack
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(selectedTechnologies).map(([categoryId, techIds]) => {
              if (techIds.length === 0) return null;

              const category = techCategories[categoryId];
              return (
                <div key={categoryId} className="space-y-2">
                  <h4 className="font-medium text-foreground">{category.title}</h4>
                  <div className="space-y-1">
                    {techIds.map(techId => {
                      const tech = category.technologies.find(t => t.id === techId);
                      return (
                        <div key={techId} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{tech.icon}</span>
                          <span>{tech.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Overview
        </Button>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Step 3 of 6
          </div>
          <Button
            onClick={handleNext}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continue to Workflow
          </Button>
        </div>
      </div>

      {/* Technology Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTech?.name}
        size="lg"
      >
        {selectedTech && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{selectedTech.icon}</div>
              <div className="flex-1">
                <p className="text-muted-foreground mb-4">{selectedTech.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">Popularity</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedTech.popularity}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{selectedTech.popularity}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-foreground">Learning Curve</div>
                    <div className={cn(
                      "inline-block px-2 py-1 rounded text-xs font-medium",
                      selectedTech.learningCurve === 'Easy' && "bg-green-100 text-green-800",
                      selectedTech.learningCurve === 'Medium' && "bg-yellow-100 text-yellow-800",
                      selectedTech.learningCurve === 'Hard' && "bg-red-100 text-red-800"
                    )}>
                      {selectedTech.learningCurve}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Icon name="ThumbsUp" className="h-4 w-4 text-green-600" />
                  Pros
                </h4>
                <ul className="space-y-1">
                  {selectedTech.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Icon name="Check" className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Icon name="ThumbsDown" className="h-4 w-4 text-red-600" />
                  Cons
                </h4>
                <ul className="space-y-1">
                  {selectedTech.cons.map((con, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Icon name="X" className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Icon name="Target" className="h-4 w-4" />
                Common Use Cases
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTech.useCases.map((useCase, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(selectedTech.documentation, '_blank')}
                iconName="ExternalLink"
                iconPosition="right"
              >
                View Documentation
              </Button>
              <Button
                onClick={() => {
                  // Find the category this tech belongs to
                  const categoryId = Object.keys(techCategories).find(catId =>
                    techCategories[catId].technologies.some(t => t.id === selectedTech.id)
                  );
                  if (categoryId) {
                    toggleTechnology(categoryId, selectedTech.id);
                  }
                  setIsModalOpen(false);
                }}
                iconName={
                  Object.values(selectedTechnologies).some(category =>
                    category.includes(selectedTech.id)
                  ) ? "Minus" : "Plus"
                }
                iconPosition="left"
              >
                {Object.values(selectedTechnologies).some(category =>
                  category.includes(selectedTech.id)
                ) ? "Remove from Stack" : "Add to Stack"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TechStackDisplay;
