import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ProjectCard = ({ project, userRole }) => {
  const navigate = useNavigate();

  // Safety check for undefined project
  if (!project) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 p-6">
        <div className="text-center text-slate-500">
          <p>Project data not available</p>
        </div>
      </div>
    );
  }

  const handleProjectClick = () => {
    console.log('Navigating to project management for:', project);
    // Store current project in localStorage for project management page
    localStorage.setItem('currentProjectId', project.id);
    localStorage.setItem('currentProject', JSON.stringify(project));

    navigate(`/project-management?id=${project.id}`, {
      state: {
        projectId: project.id,
        project: project
      }
    });
  };

  const handleGoToBoard = () => {
    console.log('Navigating to kanban board for:', project);
    // Store current project in localStorage for kanban board page
    localStorage.setItem('currentProjectId', project.id);
    localStorage.setItem('currentProject', JSON.stringify(project));

    navigate('/kanban-board', {
      state: {
        projectId: project.id,
        project: project
      }
    });
  };
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700 border-green-200',
      'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
      'On Hold': 'bg-amber-100 text-amber-700 border-amber-200',
      'Overdue': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-600',
      'Medium': 'text-amber-600',
      'Low': 'text-green-600'
    };
    return colors[priority] || 'text-slate-500';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (progress >= 25) return 'bg-gradient-to-r from-amber-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const canEdit = userRole === 'Owner' || userRole === 'Admin' || userRole === 'Member';

  const handleMoreOptions = (e) => {
    e.stopPropagation();
    // TODO: Implement more options menu (edit, delete, archive, etc.)
    console.log('More options for:', project.name);
    // For now, just show an alert with available actions
    if (canEdit) {
      alert(`More options for ${project.name}:\n- Edit Project\n- Archive Project\n- View Analytics\n- Export Data`);
    } else {
      alert(`Limited options for ${project.name}:\n- View Analytics\n- Export Data`);
    }
  };

  return (
    <div
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 p-6 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={handleProjectClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-purple-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">
              {project?.name || 'Untitled Project'}
            </h3>
            <p className="text-slate-600 line-clamp-2 leading-relaxed">
              {project?.description || 'No description available'}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project?.status || 'active')}`}>
              {project?.status || 'Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-5">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={16} />
            </div>
            <span className="text-sm font-medium">
              Due {project?.dueDate || 'No due date'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Icon name="Flag" size={16} className={getPriorityColor(project?.priority || 'medium')} />
            </div>
            <span className={`text-sm font-medium ${getPriorityColor(project?.priority || 'medium')}`}>
              {project?.priority || 'Medium'} Priority
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-lg font-bold text-slate-800">
              {project?.progress || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(project?.progress || 0)}`}
              style={{ width: `${project?.progress || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {project.team && project.team.length > 0 ? (
                <>
                  {project.team?.slice(0, 3).map((member, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={member.avatar || '/assets/images/avatar.jpg'}
                        alt={member.name || 'Team Member'}
                        className="w-10 h-10 rounded-full border-3 border-white shadow-md"
                      />
                    </div>
                  ))}
                  {project.team?.length > 3 && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-3 border-white shadow-md flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-700">
                        +{project.team.length - 3}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-3 border-white shadow-md flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700">0</span>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">{project.team?.length || 0}</span> members
            </div>
          </div>

          <div className="flex items-center gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                iconName="Edit"
                className="hover:bg-blue-50 hover:text-blue-600 rounded-lg w-9 h-9 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Edit project:', project.name);
                }}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              iconName="Kanban"
              className="hover:bg-purple-50 hover:text-purple-600 rounded-lg w-9 h-9 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleGoToBoard();
              }}
              title="Go to Board"
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="Eye"
              className="hover:bg-green-50 hover:text-green-600 rounded-lg w-9 h-9 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleProjectClick();
              }}
              title="View Project"
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="MoreHorizontal"
              className="hover:bg-slate-100 hover:text-slate-700 rounded-lg w-9 h-9 p-0"
              onClick={handleMoreOptions}
              title="More Options"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;