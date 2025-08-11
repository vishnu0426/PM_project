import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Page imports
import Login from './pages/login';
import Register from './pages/register';
import KanbanBoard from './pages/kanban-board';
import CardDetails from './pages/card-details';
import TeamMembers from './pages/team-members';
import OrganizationSettings from './pages/organization-settings';
import OrganizationDashboard from './pages/organization-dashboard';
import UserProfileSettings from './pages/user-profile-settings';
import ProjectManagement from './pages/project-management';
import ProjectOverview from './pages/project-overview';
import DashboardRouter from './pages/dashboards/DashboardRouter';
import Analytics from './pages/analytics';
import Billing from './pages/billing';
import NotFound from './pages/NotFound';

const Routes = () => {
  return (
    <>
      <ScrollToTop />
      <RouterRoutes>
        {/* Default route redirects to login */}
        <Route path='/' element={<Navigate to='/login' replace />} />

        {/* Public routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Protected routes */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path='/organization-dashboard'
          element={
            <ProtectedRoute>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/role-based-dashboard'
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path='/kanban-board'
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/card-details'
          element={
            <ProtectedRoute>
              <CardDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path='/team-members'
          element={
            <ProtectedRoute>
              <TeamMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path='/organization-settings'
          element={
            <ProtectedRoute>
              <OrganizationSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path='/user-profile-settings'
          element={
            <ProtectedRoute>
              <UserProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path='/project-management'
          element={
            <ProtectedRoute>
              <ProjectManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path='/project-overview'
          element={
            <ProtectedRoute>
              <ProjectOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path='/project-overview/:projectId'
          element={
            <ProtectedRoute>
              <ProjectOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path='/analytics'
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path='/billing'
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path='*' element={<NotFound />} />
      </RouterRoutes>
    </>
  );
};

export default Routes;
