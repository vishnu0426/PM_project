import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import {
  validateTaskAssignment,
  handleError,
  displayError,
} from '../../utils/errorHandling';
import { getAssignableMembers } from '../../utils/rolePermissions';
import { generateAIChecklist } from '../../utils/aiChecklistService';
import authService from '../../utils/authService';
import apiService from '../../utils/apiService';
import notificationService from '../../utils/notificationService';

const CreateTaskModal = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
  project,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
    labels: [],
    checklist: [],
    columnId: '', // Will be set to first available column
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const [aiChecklistGenerated, setAiChecklistGenerated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [members, setMembers] = useState([]);
  const [columns, setColumns] = useState([]);

  // Load user data and project members
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current user
        const userResult = await authService.getCurrentUser();
        if (userResult.data?.user) {
          setCurrentUser(userResult.data.user);
          setUserRole(userResult.data.user.role || 'member');
        }

        // Load project members
        if (projectId) {
          // For now, use mock members - in real app, load from project API
          setMembers([
            {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin',
            },
            {
              id: 'user-2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'member',
            },
          ]);

          // Load project boards and columns
          const boards = await apiService.boards.getByProject(projectId);
          if (boards && boards.length > 0) {
            const boardColumns = await apiService.columns.getByBoard(
              boards[0].id
            );
            if (boardColumns && boardColumns.length > 0) {
              setColumns(boardColumns);
              // Set default column to first column (usually "To Do")
              setFormData((prev) => ({
                ...prev,
                columnId: boardColumns[0].id,
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, projectId]);

  const handleInputChange = (field, value) => {
    // Validate task assignments in real-time
    if (field === 'assignedTo' && currentUser) {
      const invalidAssignments = value.filter((userId) => {
        const validationError = validateTaskAssignment(
          userRole,
          userId,
          currentUser.id
        );
        return validationError !== null;
      });

      if (invalidAssignments.length > 0) {
        const error = validateTaskAssignment(
          userRole,
          invalidAssignments[0],
          currentUser.id
        );
        displayError(error);
        return; // Don't update the field if assignment is invalid
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAISuggestion = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title first.');
      return;
    }

    console.log('Starting AI suggestion generation for:', formData.title);
    setIsGeneratingChecklist(true);

    try {
      // Generate AI checklist
      const checklistResult = await generateAIChecklist(
        formData.title,
        formData.description,
        formData.priority,
        'general' // Could be determined from project context
      );

      console.log('AI checklist result:', checklistResult);

      if (checklistResult.success) {
        console.log('Generated checklist items:', checklistResult.items);
        setFormData((prev) => ({
          ...prev,
          checklist: checklistResult.items || [],
        }));
        setAiChecklistGenerated(true);
      } else {
        console.error('AI checklist generation failed:', checklistResult.error);
        alert('Failed to generate AI suggestions. Please try again.');
      }
    } catch (error) {
      console.error('AI checklist generation error:', error);
      alert('Failed to generate AI suggestions. Please try again.');
    } finally {
      setIsGeneratingChecklist(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.columnId) {
      newErrors.columnId = 'Please select a column';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        id: Date.now().toString(),
        columnId: formData.columnId,
        column_id: formData.columnId, // For backend API
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        position: 0, // Add position for backend
        assignedTo: formData.assignedTo,
        assigned_to: formData.assignedTo, // For backend API
        dueDate: formData.dueDate || null,
        due_date: formData.dueDate || null, // For backend API
        labels: formData.labels.map((labelValue) => {
          const labelData = [
            { value: 'bug', label: 'Bug', color: '#ef4444' },
            { value: 'feature', label: 'Feature', color: '#3b82f6' },
            { value: 'improvement', label: 'Improvement', color: '#10b981' },
            {
              value: 'documentation',
              label: 'Documentation',
              color: '#f59e0b',
            },
            { value: 'testing', label: 'Testing', color: '#8b5cf6' },
          ].find((l) => l.value === labelValue);
          return {
            id: labelValue,
            name: labelData?.label || labelValue,
            color: labelData?.color || '#6b7280',
          };
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checklist: formData.checklist || [],
        comments: [],
        attachments: [],
      };

      // Create task via API
      const result = await apiService.cards.create(
        taskData.column_id,
        taskData
      );
      console.log('Task created via API:', result);

      // Send notifications for task assignments
      if (taskData.assignedTo && taskData.assignedTo.length > 0) {
        try {
          for (const assigneeId of taskData.assignedTo) {
            if (assigneeId !== currentUser?.id) {
              // Don't notify self
              await notificationService.notifyTaskAssigned(
                taskData,
                assigneeId,
                currentUser?.id
              );
            }
          }
        } catch (notificationError) {
          console.error(
            'Failed to send task assignment notifications:',
            notificationError
          );
        }
      }

      // Call the callback to refresh the parent component
      if (onTaskCreated) {
        onTaskCreated(result.data || taskData);
      }

      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      handleError(error, 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: [],
      dueDate: '',
      labels: [],
      checklist: [],
      columnId: columns.length > 0 ? columns[0].id : '',
    });
    setErrors({});
    setAiChecklistGenerated(false);
    setIsGeneratingChecklist(false);
    onClose();
  };

  if (!isOpen) return null;

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const labelOptions = [
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'testing', label: 'Testing' },
  ];

  const assigneeOptions = getAssignableMembers(
    members,
    userRole,
    currentUser?.id
  ).map((member) => ({
    value: member.id,
    label: member.name,
  }));

  const columnOptions = columns.map((column) => ({
    value: column.id,
    label: column.title,
  }));

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Modal */}
      <div className='relative bg-surface rounded-lg shadow-focused w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-border'>
          <h2 className='text-lg font-semibold text-text-primary'>
            Create New Task
          </h2>
          <Button variant='ghost' size='icon' onClick={handleClose}>
            <Icon name='X' size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <Input
            label='Task Title'
            type='text'
            placeholder='Enter task title...'
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            required
          />

          {/* AI Suggestion Button */}
          <div className='flex justify-end -mt-2 mb-2'>
            <button
              type='button'
              onClick={handleAISuggestion}
              disabled={isGeneratingChecklist || !formData.title.trim()}
              className='flex items-center space-x-2 px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              {isGeneratingChecklist ? (
                <>
                  <Icon name='Loader2' size={12} className='animate-spin' />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Icon name='Sparkles' size={12} />
                  <span>✨ AI Suggestions</span>
                </>
              )}
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Select
              label='Priority'
              options={priorityOptions}
              value={formData.priority}
              onChange={(value) => handleInputChange('priority', value)}
            />

            <Select
              label='Column'
              options={columnOptions}
              value={formData.columnId}
              onChange={(value) => handleInputChange('columnId', value)}
              error={errors.columnId}
              required
            />
          </div>

          <Input
            label='Description'
            type='textarea'
            placeholder='Enter task description...'
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Due Date'
              type='date'
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />

            <Select
              label='Assignees'
              options={assigneeOptions}
              value={formData.assignedTo}
              onChange={(value) =>
                handleInputChange(
                  'assignedTo',
                  Array.isArray(value) ? value : [value]
                )
              }
              multiple
            />
          </div>

          <Select
            label='Labels'
            options={labelOptions}
            value={formData.labels}
            onChange={(value) =>
              handleInputChange(
                'labels',
                Array.isArray(value) ? value : [value]
              )
            }
            multiple
          />

          {/* AI Generated Checklist */}
          {aiChecklistGenerated && formData.checklist.length > 0 && (
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-text-primary'>
                ✨ AI Generated Checklist
              </label>
              <div className='space-y-2 p-3 bg-muted/50 rounded-md'>
                {formData.checklist.map((item, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      checked={item.completed || false}
                      onChange={(e) => {
                        const updatedChecklist = [...formData.checklist];
                        updatedChecklist[index] = {
                          ...item,
                          completed: e.target.checked,
                        };
                        handleInputChange('checklist', updatedChecklist);
                      }}
                      className='rounded border-border'
                    />
                    <span className='text-sm text-text-primary'>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className='flex items-center justify-end space-x-3 pt-4 border-t border-border'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Icon
                    name='Loader2'
                    size={16}
                    className='animate-spin mr-2'
                  />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
