import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import realApiService from '../../../utils/realApiService';

const PersonalInfoTab = ({ userData, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: userData.fullName || '',
    email: userData.email || '',
    jobTitle: userData.jobTitle || '',
    bio: userData.bio || '',
    avatar: userData.avatar || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Update form data when userData changes
  useEffect(() => {
    setFormData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      jobTitle: userData.jobTitle || '',
      bio: userData.bio || '',
      avatar: userData.avatar || ''
    });
    setAvatarPreview(userData.avatar || '');
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleAvatarUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleAvatarUpload(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Parse full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Prepare update data for backend
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        job_title: formData.jobTitle,
        bio: formData.bio,
        // Note: Avatar upload would need separate endpoint in real implementation
        ...(formData.avatar && formData.avatar !== userData.avatar && { profile_picture: formData.avatar })
      };

      // Call the parent save function with the formatted data
      await onSave(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Handle error (could show toast notification)
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      jobTitle: userData.jobTitle || '',
      bio: userData.bio || '',
      avatar: userData.avatar || ''
    });
    setAvatarPreview(userData.avatar || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Icon name="User" size={32} className="text-secondary-foreground" />
                </div>
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-elevation-2 hover:bg-primary/90 transition-smooth"
              >
                <Icon name="Camera" size={16} className="text-primary-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">Profile Photo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a professional photo that represents you well. This will be visible to your team members.
          </p>
          
          {isEditing && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth ${
                isDragOver 
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Icon name="Upload" size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your photo here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG up to 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={!isEditing}
          required
          className="col-span-1"
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={!isEditing}
          description="This email is used for login and notifications"
          required
          className="col-span-1"
        />

        <Input
          label="Job Title"
          name="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="e.g., Senior Developer, Project Manager"
          className="col-span-1 md:col-span-2"
        />
      </div>

      {/* Bio Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Tell your team a bit about yourself, your role, and what you're working on..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Last updated: July 28, 2025
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                iconName={saving ? "Loader" : "Save"}
                iconPosition="left"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              onClick={() => setIsEditing(true)}
              iconName="Edit"
              iconPosition="left"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;