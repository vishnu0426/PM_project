import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import {
  getAssignableMembers,
  getAssignmentRestrictionMessage,
  getRolePermissions,
} from '../../../utils/rolePermissions';
import { generateAIChecklist } from '../../../utils/aiChecklistService';
import {
  validateTaskAssignment,
  handleAIError,
  handleError,
  displayError,
} from '../../../utils/errorHandling';
import authService from '../../../utils/authService';
import sessionService from '../../../utils/sessionService';
import { useAuth } from '../../../contexts/AuthContext';

const AddCardModal = ({ isOpen, onClose, onSave, columnId, members }) => {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
    labels: [],
    checklist: [],
  });

  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const [aiChecklistGenerated, setAiChecklistGenerated] = useState(false);

  // Load user data for role-based permissions
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is authenticated first
        if (!isAuthenticated || !user) {
          console.log('User not authenticated, using default role');
          setUserRole('member');
          setCurrentUser(null);
          return;
        }

        // Use user from auth context if available
        if (user) {
          setCurrentUser(user);
          setUserRole(
            user.organizationRole ||
              user.role ||
              sessionService.getUserRole() ||
              'member'
          );
          return;
        }

        // Fallback to API call if user not in context
        const userResult = await authService.getCurrentUser();
        if (userResult?.data?.user) {
          setCurrentUser(userResult.data.user);
          setUserRole(
            userResult.data.user.organizationRole ||
              userResult.data.user.role ||
              sessionService.getUserRole() ||
              'member'
          );
        } else {
          setUserRole(sessionService.getUserRole() || 'member');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setUserRole('member');
        setCurrentUser(null);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, isAuthenticated, user]);

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  // Filter members based on role permissions
  const assignableMembers = currentUser
    ? getAssignableMembers(members, userRole, currentUser.id)
    : members;

  const memberOptions = assignableMembers.map((member) => ({
    value: member.id,
    label: member.name,
    description: member.role,
  }));

  const rolePermissions = getRolePermissions(userRole);
  const assignmentRestrictionMessage =
    getAssignmentRestrictionMessage(userRole);

  const labelOptions = [
    { value: 'bug', label: 'Bug', color: '#ef4444' },
    { value: 'feature', label: 'Feature', color: '#3b82f6' },
    { value: 'improvement', label: 'Improvement', color: '#10b981' },
    { value: 'documentation', label: 'Documentation', color: '#f59e0b' },
    { value: 'testing', label: 'Testing', color: '#8b5cf6' },
  ].map((label) => ({
    value: label.value,
    label: label.label,
  }));

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
      alert('Please enter a card title first.');
      return;
    }

    setIsGeneratingChecklist(true);

    try {
      // Generate AI checklist
      const checklistResult = await generateAIChecklist(
        formData.title,
        formData.description,
        formData.priority,
        'general' // Could be determined from project context
      );

      if (checklistResult.success) {
        // Enhanced AI suggestions with checklist
        const mockAI = {
          description:
            formData.description ||
            `This card is about: ${formData.title}. Please implement the feature, test it thoroughly, and document it.`,
          labels: ['feature', 'testing'],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            .toISOString()
            .split('T')[0],
          checklist: checklistResult.items,
        };

        setFormData((prev) => ({
          ...prev,
          description: mockAI.description,
          labels: mockAI.labels,
          dueDate: mockAI.dueDate,
          checklist: mockAI.checklist,
        }));

        setAiChecklistGenerated(true);
      } else {
        const aiError = handleAIError(
          new Error(checklistResult.error),
          'checklist generation'
        );
        displayError(aiError);

        // Fallback to basic AI suggestion
        const mockAI = {
          description:
            formData.description ||
            `This card is about: ${formData.title}. Please implement the feature, test it thoroughly, and document it.`,
          labels: ['feature', 'testing'],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        };

        setFormData((prev) => ({
          ...prev,
          description: mockAI.description,
          labels: mockAI.labels,
          dueDate: mockAI.dueDate,
        }));
      }
    } catch (error) {
      const aiError = handleAIError(error, 'AI suggestion');
      displayError(aiError);
    } finally {
      setIsGeneratingChecklist(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Card title is required';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Creating card with columnId:', columnId);

    const newCard = {
      id: Date.now().toString(),
      columnId, // For frontend use
      column_id: columnId, // For backend API
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
          { value: 'documentation', label: 'Documentation', color: '#f59e0b' },
          { value: 'testing', label: 'Testing', color: '#8b5cf6' },
        ].find((l) => l.value === labelValue);
        return {
          id: labelValue,
          name: labelData.label,
          color: labelData.color,
        };
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: formData.checklist || [],
      comments: [],
      attachments: [],
    };

    onSave(newCard);
    handleClose();
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
    });
    setErrors({});
    setAiChecklistGenerated(false);
    setIsGeneratingChecklist(false);
    onClose();
  };

  if (!isOpen) return null;

  // Show authentication required message if user is not logged in
  if (!isAuthenticated) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-background rounded-lg p-6 w-full max-w-md mx-4'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-foreground'>
              Authentication Required
            </h2>
            <button
              onClick={onClose}
              className='text-muted-foreground hover:text-foreground'
            >
              <Icon name='X' size={20} />
            </button>
          </div>
          <p className='text-muted-foreground mb-4'>
            You need to log in to create cards. Please log in and try again.
          </p>
          <div className='flex justify-end'>
            <Button onClick={onClose} variant='outline'>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Modal */}
      <div className='relative bg-surface rounded-lg shadow-focused w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-border'>
          <h2 className='text-lg font-semibold text-text-primary'>
            Add New Card
          </h2>
          <Button variant='ghost' size='icon' onClick={handleClose}>
            <Icon name='X' size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <Input
            label='Card Title'
            type='text'
            placeholder='Enter card title...'
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            required
          />

          {/* ✨ AI Suggestion Button */}
          <div className='flex justify-end -mt-2 mb-2'>
            <button
              type='button'
              onClick={handleAISuggestion}
              disabled={isGeneratingChecklist}
              className='text-sm text-primary underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1'
            >
              {isGeneratingChecklist ? (
                <>
                  <Icon name='Loader2' size={14} className='animate-spin' />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Icon name='Zap' size={14} />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>

          <div>
            <label className='block text-sm font-medium text-text-primary mb-2'>
              Description
            </label>
            <textarea
              placeholder='Enter card description...'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none'
              rows={3}
            />
            {errors.description && (
              <p className='mt-1 text-sm text-destructive'>
                {errors.description}
              </p>
            )}
          </div>

          <Select
            label='Priority'
            options={priorityOptions}
            value={formData.priority}
            onChange={(value) => handleInputChange('priority', value)}
          />

          <div>
            <Select
              label='Assign Members'
              options={memberOptions}
              value={formData.assignedTo}
              onChange={(value) => handleInputChange('assignedTo', value)}
              multiple
              searchable
              placeholder={
                rolePermissions.canAssignTasksToOthers
                  ? 'Select team members...'
                  : 'You can only assign to yourself'
              }
              disabled={
                !rolePermissions.canAssignTasksToSelf &&
                !rolePermissions.canAssignTasksToOthers
              }
            />
            {!rolePermissions.canAssignTasksToOthers && (
              <p className='mt-1 text-xs text-text-secondary'>
                <Icon name='Info' size={12} className='inline mr-1' />
                {assignmentRestrictionMessage}
              </p>
            )}
          </div>

          <Input
            label='Due Date'
            type='date'
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
          />

          <Select
            label='Labels'
            options={labelOptions}
            value={formData.labels}
            onChange={(value) => handleInputChange('labels', value)}
            multiple
            placeholder='Select labels...'
          />

          {/* AI Generated Checklist Preview */}
          {aiChecklistGenerated && formData.checklist.length > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='block text-sm font-medium text-text-primary'>
                  AI Generated Checklist
                </label>
                <div className='flex items-center space-x-1 text-xs text-text-secondary'>
                  <Icon name='Zap' size={12} className='text-primary' />
                  <span>{formData.checklist.length} items</span>
                </div>
              </div>
              <div className='bg-muted/30 rounded-md p-3 max-h-32 overflow-y-auto'>
                <div className='space-y-1'>
                  {formData.checklist.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id}
                      className='flex items-start space-x-2 text-sm'
                    >
                      <div className='w-3 h-3 border border-border rounded-sm mt-0.5 flex-shrink-0'></div>
                      <span className='text-text-secondary line-clamp-1'>
                        {item.text}
                      </span>
                    </div>
                  ))}
                  {formData.checklist.length > 5 && (
                    <div className='text-xs text-text-secondary pl-5'>
                      +{formData.checklist.length - 5} more items...
                    </div>
                  )}
                </div>
              </div>
              <p className='text-xs text-text-secondary'>
                <Icon name='Info' size={12} className='inline mr-1' />
                You can edit these checklist items after creating the card
              </p>
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center justify-end space-x-3 pt-4'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit' variant='default'>
              Create Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;
