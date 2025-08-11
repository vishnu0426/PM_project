import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import Icon from '../AppIcon';
import Button from './Button';

const ProjectSelector = ({ className = '' }) => {
  const { currentProject, projects, switchProject, loading } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectSelect = async (projectId) => {
    if (projectId !== currentProject?.id) {
      await switchProject(projectId);
    }
    setIsOpen(false);
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'on-hold':
        return 'bg-warning';
      case 'completed':
        return 'bg-primary';
      case 'cancelled':
        return 'bg-error';
      default:
        return 'bg-muted';
    }
  };

  const getProjectProgress = (project) => {
    if (project.progress !== undefined) {
      return project.progress;
    }
    
    // Calculate progress from tasks if available
    if (project.tasks) {
      try {
        const tasks = typeof project.tasks === 'string' ? JSON.parse(project.tasks) : project.tasks;
        if (tasks && tasks.length > 0) {
          const completedTasks = tasks.filter(task => task.status === 'completed').length;
          return Math.round((completedTasks / tasks.length) * 100);
        }
      } catch (error) {
        console.warn('Failed to parse project tasks:', error);
      }
    }
    
    return 0;
  };

  if (!currentProject && projects.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse"></div>
        <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 h-auto text-left justify-start hover:bg-muted/50"
        disabled={loading}
      >
        {currentProject ? (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="Folder" size={16} className="text-primary" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getProjectStatusColor(currentProject.status)}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">
                  {currentProject.name}
                </div>
                <div className="text-xs text-text-secondary">
                  {getProjectProgress(currentProject)}% complete
                </div>
              </div>
            </div>
            <Icon 
              name={isOpen ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-text-secondary flex-shrink-0" 
            />
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Icon name="Folder" size={16} className="text-text-secondary" />
            </div>
            <span className="text-text-secondary">Select Project</span>
            <Icon name="ChevronDown" size={16} className="text-text-secondary" />
          </>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-text-secondary px-3 py-2 mb-1">
              Select Project ({projects.length})
            </div>
            
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-muted/50 transition-colors ${
                  currentProject?.id === project.id ? 'bg-primary/10 text-primary' : 'text-foreground'
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Folder" size={16} className="text-primary" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getProjectStatusColor(project.status)}`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {project.name}
                  </div>
                  <div className="text-xs text-text-secondary truncate">
                    {project.description || 'No description'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: `${getProjectProgress(project)}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary">
                      {getProjectProgress(project)}%
                    </span>
                  </div>
                </div>

                {currentProject?.id === project.id && (
                  <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}

            {projects.length === 0 && (
              <div className="px-3 py-4 text-center text-text-secondary">
                <Icon name="FolderOpen" size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No projects available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
