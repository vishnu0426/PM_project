import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ projectName = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route mapping for breadcrumb generation
  const routeMap = {
    '/organization-dashboard': { label: 'Dashboard', parent: null },
    '/kanban-board': { label: 'Projects', parent: null },
    '/card-details': { label: 'Card Details', parent: '/kanban-board' },
    '/team-members': { label: 'Team Members', parent: null },
    '/user-profile-settings': { label: 'Profile Settings', parent: null },
    '/organization-settings': { label: 'Organization Settings', parent: null },
    '/project-management': { label: projectName || 'Project Management', parent: null },
    '/role-based-dashboard': { label: 'Dashboard', parent: null }
  };

  const generateBreadcrumbs = () => {
    const currentPath = location.pathname;
    const breadcrumbs = [];
    
    // Always start with Dashboard as home
    if (currentPath !== '/organization-dashboard') {
      breadcrumbs.push({
        label: 'Dashboard',
        path: '/organization-dashboard',
        isHome: true
      });
    }

    const currentRoute = routeMap[currentPath];
    if (currentRoute) {
      // Add parent if exists
      if (currentRoute.parent && currentRoute.parent !== '/organization-dashboard') {
        const parentRoute = routeMap[currentRoute.parent];
        if (parentRoute) {
          breadcrumbs.push({
            label: parentRoute.label,
            path: currentRoute.parent,
            isHome: false
          });
        }
      }

      // Add current page (not clickable)
      breadcrumbs.push({
        label: currentRoute.label,
        path: currentPath,
        isCurrent: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if only current page or on dashboard
  if (breadcrumbs.length <= 1 && location.pathname === '/organization-dashboard') {
    return null;
  }

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          )}
          
          {crumb.isCurrent ? (
            <span className="text-foreground font-medium" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <button
              onClick={() => handleBreadcrumbClick(crumb.path)}
              className="hover:text-foreground transition-smooth flex items-center space-x-1"
            >
              {crumb.isHome && <Icon name="Home" size={14} />}
              <span>{crumb.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;