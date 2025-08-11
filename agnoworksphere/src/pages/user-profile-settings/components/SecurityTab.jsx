import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SecurityTab = ({ onPasswordChange, onTwoFactorToggle }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [errors, setErrors] = useState({});

  // Real activity data would be loaded from backend
  const recentActivity = [];

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, NY",
      lastActive: "Active now",
      isCurrent: true
    },
    {
      id: 2,
      device: "Mobile App on iPhone",
      location: "New York, NY",
      lastActive: "2 hours ago",
      isCurrent: false
    }
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      onPasswordChange(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength(0);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowQRCode(true);
    } else {
      setTwoFactorEnabled(false);
      onTwoFactorToggle(false);
    }
  };

  const confirmTwoFactorSetup = () => {
    setTwoFactorEnabled(true);
    setShowQRCode(false);
    onTwoFactorToggle(true);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-error';
    if (passwordStrength < 50) return 'bg-warning';
    if (passwordStrength < 75) return 'bg-accent';
    return 'bg-success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleEndSession = (sessionId) => {
    console.log('Ending session:', sessionId);
  };

  return (
    <div className="space-y-8">
      {/* Password Change Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Lock" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={handlePasswordInputChange}
              error={errors.currentPassword}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPasswords.current ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={handlePasswordInputChange}
              error={errors.newPassword}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPasswords.new ? 'EyeOff' : 'Eye'} size={16} />
            </button>
            
            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Password strength</span>
                  <span className={`font-medium ${
                    passwordStrength < 50 ? 'text-error' : 'text-success'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordInputChange}
              error={errors.confirmPassword}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPasswords.confirm ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          <Button
            type="submit"
            variant="default"
            iconName="Save"
            iconPosition="left"
            className="mt-6"
          >
            Update Password
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Icon name="Shield" size={20} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <Button
            variant={twoFactorEnabled ? "destructive" : "default"}
            onClick={handleTwoFactorToggle}
            iconName={twoFactorEnabled ? "ShieldOff" : "ShieldCheck"}
            iconPosition="left"
          >
            {twoFactorEnabled ? "Disable" : "Enable"}
          </Button>
        </div>

        {showQRCode && (
          <div className="bg-muted rounded-lg p-6 mb-6">
            <h4 className="font-medium text-foreground mb-4">Set up Two-Factor Authentication</h4>
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="bg-white p-4 rounded-lg">
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="bg-background border border-border rounded p-3 mb-4">
                  <p className="text-xs font-mono">JBSWY3DPEHPK3PXP</p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="default"
                    onClick={confirmTwoFactorSetup}
                    iconName="Check"
                    iconPosition="left"
                  >
                    I've Added the Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowQRCode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {twoFactorEnabled && (
          <div className="flex items-center space-x-2 text-sm text-success">
            <Icon name="CheckCircle" size={16} />
            <span>Two-factor authentication is enabled</span>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Monitor" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Active Sessions</h3>
        </div>

        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="Monitor" size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {session.device}
                    {session.isCurrent && (
                      <span className="ml-2 px-2 py-1 bg-success text-success-foreground text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndSession(session.id)}
                  iconName="X"
                  iconPosition="left"
                >
                  End Session
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Security Activity</h3>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
              <Icon name="Info" size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.device} • {activity.location} • {activity.timestamp}
                </p>
                <p className="text-xs text-muted-foreground">IP: {activity.ip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;