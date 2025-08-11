import React, { useState, useEffect } from 'react';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import PersonalInfoTab from './components/PersonalInfoTab';
import SecurityTab from './components/SecurityTab';
import NotificationsTab from './components/NotificationsTab';
import authService from '../../utils/authService';
import sessionService from '../../utils/sessionService';
import { useUserProfile } from '../../hooks/useUserProfile';

const UserProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('personal');

  // Use centralized user profile hook
  const {
    userProfile,
    currentOrganization,
    loading: profileLoading,
    updateUserProfile,
  } = useUserProfile();

  // Legacy state for compatibility with existing components
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [loading, setLoading] = useState(true);

  // Real user data from backend
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    jobTitle: '',
    bio: '',
    avatar: '',
  });

  // Sync with hook data
  useEffect(() => {
    if (userProfile) {
      setCurrentUser(userProfile);
      setUserRole(
        userProfile.organizationRole ||
          userProfile.role ||
          sessionService.getUserRole() ||
          'member'
      );

      setUserData({
        fullName: userProfile.displayName || '',
        email: userProfile.email || '',
        jobTitle: userProfile.jobTitle || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatar || '',
      });
    }
    setLoading(profileLoading);
  }, [userProfile, profileLoading]);

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: 'User',
      description: 'Manage your profile information and avatar',
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'Shield',
      description: 'Password, two-factor authentication, and sessions',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      description: 'Email and in-app notification preferences',
    },
  ];

  const handlePersonalInfoSave = async (formData) => {
    try {
      // Import realApiService dynamically to avoid circular imports
      const realApiService = (await import('../../utils/realApiService'))
        .default;

      // Update user profile via API
      const result = await realApiService.auth.updateProfile(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update local state with the response data
      if (result.data) {
        const updatedUser = result.data;
        setUserData((prev) => ({
          ...prev,
          fullName: `${updatedUser.first_name || ''} ${
            updatedUser.last_name || ''
          }`.trim(),
          email: updatedUser.email || prev.email,
          jobTitle: updatedUser.job_title || '',
          bio: updatedUser.bio || '',
          avatar: updatedUser.profile_picture || prev.avatar,
        }));

        // Update current user state
        setCurrentUser((prev) => ({
          ...prev,
          ...updatedUser,
        }));
      }

      console.log('Personal info updated successfully:', result.data);
    } catch (error) {
      console.error('Failed to update personal info:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const handlePasswordChange = (passwordData) => {
    console.log('Password change requested:', passwordData);
    // Mock password change - in real app, this would call an API
  };

  const handleTwoFactorToggle = (enabled) => {
    console.log('Two-factor authentication:', enabled ? 'enabled' : 'disabled');
  };

  const handleNotificationsSave = (notificationSettings) => {
    console.log('Notification settings updated:', notificationSettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoTab
            userData={userData}
            onSave={handlePersonalInfoSave}
          />
        );
      case 'security':
        return (
          <SecurityTab
            onPasswordChange={handlePasswordChange}
            onTwoFactorToggle={handleTwoFactorToggle}
          />
        );
      case 'notifications':
        return <NotificationsTab onSave={handleNotificationsSave} />;
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <RoleBasedHeader
        userRole={userRole.toLowerCase()}
        currentUser={
          userProfile
            ? {
                name: userProfile.displayName,
                email: userProfile.email,
                avatar: userProfile.avatar,
                role: userProfile.role,
              }
            : {
                name: 'Loading...',
                email: '',
                avatar: '/assets/images/avatar.jpg',
                role: userRole,
              }
        }
        currentOrganization={currentOrganization}
      />

      <main className='pt-16'>
        <div className='max-w-6xl mx-auto px-6 py-8'>
          <Breadcrumb />

          {/* Page Header */}
          <div className='mb-8'>
            <div className='flex items-center space-x-3 mb-2'>
              <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
                <Icon
                  name='Settings'
                  size={20}
                  className='text-primary-foreground'
                />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-foreground'>
                  Profile Settings
                </h1>
                <p className='text-muted-foreground'>
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Sidebar Navigation */}
            <div className='lg:col-span-1'>
              <div className='bg-card border border-border rounded-lg p-1 sticky top-24'>
                <nav className='space-y-1'>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-smooth ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={tab.icon} size={18} />
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium'>{tab.label}</div>
                        <div
                          className={`text-xs mt-0.5 ${
                            activeTab === tab.id
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Mobile Tab Selector */}
              <div className='lg:hidden mb-6'>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className='w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Content */}
            <div className='lg:col-span-3'>
              <div className='bg-card border border-border rounded-lg p-8'>
                {/* Tab Header */}
                <div className='mb-8 pb-6 border-b border-border'>
                  <div className='flex items-center space-x-3'>
                    <Icon
                      name={
                        tabs.find((tab) => tab.id === activeTab)?.icon ||
                        'Settings'
                      }
                      size={24}
                      className='text-primary'
                    />
                    <div>
                      <h2 className='text-2xl font-semibold text-foreground'>
                        {tabs.find((tab) => tab.id === activeTab)?.label}
                      </h2>
                      <p className='text-muted-foreground'>
                        {tabs.find((tab) => tab.id === activeTab)?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfileSettings;
