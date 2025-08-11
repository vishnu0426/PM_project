import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddColumnModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'todo',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
    { value: 'custom', label: 'Custom Status' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Column title is required';
    }
    
    if (formData.title.length > 50) {
      newErrors.title = 'Title must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newColumn = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      status: formData.status,
      description: formData.description.trim(),
      order: Date.now(),
      createdAt: new Date().toISOString()
    };

    onSave(newColumn);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      status: 'todo',
      description: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-surface rounded-lg shadow-focused w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Add New Column</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Column Title"
            type="text"
            placeholder="Enter column title..."
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            required
          />

          <Select
            label="Status Type"
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            description="Choose the workflow status this column represents"
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe what cards in this column represent..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
            >
              Create Column
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnModal;