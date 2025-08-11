import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DashboardHeader = ({ userRole, onFilterChange, onSearchChange, searchValue }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'archived', label: 'Archived' }
  ];

  const handleFilterChange = (value) => {
    setActiveFilter(value);
    onFilterChange(value);
  };

  const getRoleBasedActions = () => {
    switch (userRole) {
      case 'Owner': case'Admin':
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" iconName="Settings" iconPosition="left">
              Settings
            </Button>
            <Button variant="default" iconName="Plus" iconPosition="left">
              New Project
            </Button>
          </div>
        );
      case 'Member':
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" iconName="FileText" iconPosition="left">
              Create Task
            </Button>
            <Button variant="default" iconName="Plus" iconPosition="left">
              New Board
            </Button>
          </div>
        );
      case 'Viewer':
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" iconName="Download" iconPosition="left">
              Export
            </Button>
            <Button variant="outline" iconName="Share" iconPosition="left">
              Share
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search projects, tasks..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-80 pl-10 h-11 bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white focus:border-blue-200 transition-all duration-200"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="w-44">
                <Select
                  options={filterOptions}
                  value={activeFilter}
                  onChange={handleFilterChange}
                  placeholder="Filter by"
                  className="h-11 bg-white/60 backdrop-blur-sm border-white/30"
                />
              </div>
            </div>

            {getRoleBasedActions()}
          </div>
        </div>

        {/* Enhanced Quick Stats Bar */}
        <div className="flex flex-wrap items-center gap-8 mt-8 pt-6 border-t border-slate-200/50">
          <div className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">12 Active Projects</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-full">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-medium text-amber-700">3 Overdue Tasks</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">8 Team Members</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-purple-700">95% Completion Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;