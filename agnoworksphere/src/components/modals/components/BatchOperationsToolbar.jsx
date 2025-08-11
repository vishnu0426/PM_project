import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Icon from '../../AppIcon';
import BulkEditPanel from './BulkEditPanel';

const BatchOperationsToolbar = ({
  selectedTasks,
  onBulkUpdate,
  onSelectAll,
  onSelectNone,
  groupBy,
  onGroupByChange,
  filterBy,
  onFilterByChange,
  searchQuery,
  onSearchChange,
  showDependencyView,
  onToggleDependencyView
}) => {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const groupByOptions = [
    { value: 'none', label: 'No Grouping', icon: 'List' },
    { value: 'phase', label: 'By Phase', icon: 'Layers' },
    { value: 'priority', label: 'By Priority', icon: 'Flag' },
    { value: 'assignee', label: 'By Assignee', icon: 'Users' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: 'List' },
    { value: 'high-priority', label: 'High Priority', icon: 'AlertTriangle' },
    { value: 'unassigned', label: 'Unassigned', icon: 'UserX' },
    { value: 'modified', label: 'Modified', icon: 'Edit' },
    { value: 'overdue', label: 'Overdue', icon: 'Clock' },
    { value: 'dependencies', label: 'Has Dependencies', icon: 'Link' }
  ];

  const selectionCriteria = [
    { value: 'high-priority', label: 'High Priority Tasks' },
    { value: 'unassigned', label: 'Unassigned Tasks' },
    { value: 'phase-1', label: 'Phase 1 Tasks' },
    { value: 'large-tasks', label: 'Large Tasks (8+ hours)' }
  ];

  const handleSelectByCriteria = (criteria) => {
    // This would be implemented to select tasks based on criteria
    // For now, just a placeholder
    console.log('Selecting by criteria:', criteria);
  };

  const handleExportTasks = () => {
    // Export selected tasks as CSV or JSON
    console.log('Exporting tasks...');
  };

  const handleImportTemplate = () => {
    // Import task template
    console.log('Importing template...');
  };

  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
      {/* Enhanced Main Toolbar */}
      <div className="flex items-center justify-between p-6">
        {/* Enhanced Left Section - Selection & Bulk Actions */}
        <div className="flex items-center gap-4">
          {/* Modern Selection Controls Card */}
          <div className="flex items-center gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={onSelectAll}
              iconName="CheckSquare"
              title="Select All"
              className="text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSelectNone}
              iconName="Square"
              title="Select None"
              className="text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            />

            {/* Enhanced Select by Criteria Dropdown */}
            <div className="relative">
              <Select
                value=""
                onChange={handleSelectByCriteria}
                options={[
                  { value: '', label: 'Smart Select...' },
                  ...selectionCriteria
                ]}
                className="min-w-[150px] bg-white/80 border-gray-200 rounded-lg"
                size="sm"
              />
            </div>
          </div>

          {/* Enhanced Selection Count Card */}
          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 animate-in slide-in-from-left duration-300">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm font-medium">
                {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
              </span>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-300">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBulkEdit(!showBulkEdit)}
                iconName="Edit"
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                Bulk Edit
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportTasks}
                iconName="Download"
                title="Export Selected"
              />
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            iconName="Search"
            className="w-full"
          />
        </div>

        {/* Right Section - View Controls */}
        <div className="flex items-center gap-2">
          {/* Filters Toggle */}
          <Button
            size="sm"
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            iconName="Filter"
            title="Toggle Filters"
          />

          {/* Group By */}
          <Select
            value={groupBy}
            onChange={onGroupByChange}
            options={groupByOptions}
            className="min-w-[130px]"
            size="sm"
          />

          {/* View Mode Toggle */}
          <Button
            size="sm"
            variant={showDependencyView ? "default" : "outline"}
            onClick={onToggleDependencyView}
            iconName="GitBranch"
            title="Toggle Dependency View"
          />

          {/* Import/Export */}
          <div className="flex items-center gap-1 pl-2 border-l border-gray-300">
            <Button
              size="sm"
              variant="outline"
              onClick={handleImportTemplate}
              iconName="Upload"
              title="Import Template"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportTasks}
              iconName="Download"
              title="Export All"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
              <div className="flex items-center gap-2">
                {filterOptions.map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={filterBy === option.value ? "default" : "outline"}
                    onClick={() => onFilterByChange(option.value)}
                    iconName={option.icon}
                    className={`text-xs ${
                      filterBy === option.value 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 ml-auto text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={12} />
                Total: 120h
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Users" size={12} />
                5 assignees
              </span>
              <span className="flex items-center gap-1">
                <Icon name="AlertTriangle" size={12} />
                3 high priority
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Panel */}
      {showBulkEdit && selectedTasks.size > 0 && (
        <BulkEditPanel
          selectedCount={selectedTasks.size}
          onUpdate={onBulkUpdate}
          onClose={() => setShowBulkEdit(false)}
        />
      )}

      {/* Quick Actions Bar */}
      <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Icon name="Lightbulb" size={14} />
              Quick Actions:
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSelectByCriteria('unassigned')}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Assign all unassigned
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSelectByCriteria('high-priority')}
              className="text-xs text-orange-600 hover:text-orange-800"
            >
              Review high priority
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => console.log('Auto-schedule')}
              className="text-xs text-green-600 hover:text-green-800"
            >
              Auto-schedule tasks
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Icon name="Keyboard" size={12} />
            <span>Ctrl+A: Select All • Ctrl+Shift+E: Bulk Edit • Ctrl+F: Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchOperationsToolbar;
