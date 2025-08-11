import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import authService from '../utils/authService';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all projects for the current organization
  const loadProjects = async () => {
    try {
      // Check authentication before making API calls
      if (!isAuthenticated) {
        console.log('Cannot load projects - user not authenticated');
        return;
      }

      setLoading(true);
      setError(null);

      let organizationId = await authService.getOrganizationId();

      // If no organization ID in localStorage, fetch user info to get it
      if (!organizationId) {
        console.log('No organization ID found, fetching user info...');
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          );

          const userResponse = await Promise.race([
            authService.getCurrentUser(),
            timeoutPromise,
          ]);

          if (
            userResponse &&
            userResponse.data &&
            userResponse.data.organizations &&
            userResponse.data.organizations.length > 0
          ) {
            organizationId = userResponse.data.organizations[0].id;
            const userRole = userResponse.data.user.role;

            console.log('Organization info fetched from database:', {
              organizationId,
              userRole,
            });
          } else {
            throw new Error('No organization found for user');
          }
        } catch (userError) {
          console.error('Failed to fetch user info:', userError);
          // Set fallback to prevent hanging
          organizationId = 'fallback-org';
        }
      }

      // Add timeout for projects API call
      const projectsTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Projects request timeout')), 8000)
      );

      const response = await Promise.race([
        apiService.projects.getAll(organizationId),
        projectsTimeoutPromise,
      ]);

      const items = Array.isArray(response) ? response : response?.data || [];
      setProjects(items);

      // If no current project is set, set the first one as current
      if (!currentProject && items.length > 0) {
        setCurrentProject(items[0]);
        localStorage.setItem('currentProjectId', items[0].id);
        localStorage.setItem('currentProject', JSON.stringify(items[0]));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different project
  const switchProject = async (projectId) => {
    try {
      setLoading(true);
      setError(null);

      // Find project in current projects list
      let project = projects.find((p) => p.id === projectId);

      // If not found in current list, fetch from API
      if (!project) {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Project fetch timeout')), 5000)
          );

          project = await Promise.race([
            apiService.projects.getById(projectId),
            timeoutPromise,
          ]);
        } catch (fetchError) {
          console.warn(
            'Project not found or access denied (error thrown):',
            projectId,
            fetchError
          );
          project = null;
        }

        // If still not found (null or undefined), fallback gracefully
        if (!project) {
          // If there are other projects available, switch to the first one
          if (projects.length > 0) {
            console.log(
              'Switching to first available project:',
              projects[0].id
            );
            await switchProject(projects[0].id);
            return;
          } else {
            // No projects available, clear current project
            setCurrentProject(null);
            setError('Project not found or access denied');
            return;
          }
        }
      }

      if (project) {
        setCurrentProject(project);
        // Emit project change event for other components
        window.dispatchEvent(
          new CustomEvent('projectChanged', {
            detail: { project, projectId },
          })
        );
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Failed to switch project:', error);
      setError(error.message || 'Failed to switch project');

      setCurrentProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Update current project data
  const updateCurrentProject = (updatedProject) => {
    setCurrentProject(updatedProject);

    // Update in projects list as well
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );

    // Emit project update event
    window.dispatchEvent(
      new CustomEvent('projectUpdated', {
        detail: { project: updatedProject },
      })
    );
  };

  // Add a new project to the list
  const addProject = (newProject) => {
    setProjects((prev) => [...prev, newProject]);

    // Emit project added event
    window.dispatchEvent(
      new CustomEvent('projectAdded', {
        detail: { project: newProject },
      })
    );
  };

  // Remove a project from the list
  const removeProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    // If the removed project was the current one, switch to another
    if (currentProject && currentProject.id === projectId) {
      const remainingProjects = projects.filter((p) => p.id !== projectId);
      if (remainingProjects.length > 0) {
        switchProject(remainingProjects[0].id);
      } else {
        setCurrentProject(null);
        localStorage.removeItem('currentProjectId');
        localStorage.removeItem('currentProject');
      }
    }

    // Emit project removed event
    window.dispatchEvent(
      new CustomEvent('projectRemoved', {
        detail: { projectId },
      })
    );
  };

  // Initialize project context
  useEffect(() => {
    const initializeProject = async () => {
      // Don't load projects if user is not authenticated or auth is still loading
      if (authLoading || !isAuthenticated) {
        console.log('Skipping project initialization - user not authenticated');
        return;
      }

      // Load all projects first
      await loadProjects();

      // After loading projects, try to restore the stored project
      const storedProjectId = localStorage.getItem('currentProjectId');

      if (storedProjectId) {
        // Try to switch to the stored project (switchProject will handle validation)
        try {
          await switchProject(storedProjectId);
        } catch (error) {
          console.warn(
            'Failed to restore stored project:',
            storedProjectId,
            error
          );
          // switchProject already handles cleanup on error
        }
      }
    };

    initializeProject();
  }, [isAuthenticated, authLoading]); // Re-run when auth state changes

  // Listen for external project updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentProject' && e.newValue) {
        try {
          const project = JSON.parse(e.newValue);
          setCurrentProject(project);
        } catch (error) {
          console.warn('Failed to parse project from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    currentProject,
    projects,
    loading,
    error,
    switchProject,
    updateCurrentProject,
    addProject,
    removeProject,
    loadProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export default ProjectContext;
