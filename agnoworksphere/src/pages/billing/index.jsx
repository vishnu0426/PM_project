import React, { useState, useEffect } from 'react';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import apiService from '../../utils/apiService';
import { useUserProfile } from '../../hooks/useUserProfile';

const Billing = () => {
  const { userProfile, currentOrganization: profileOrg } = useUserProfile();
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({
    subscription: {},
    paymentHistory: [],
    usage: {},
    plans: [],
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'CreditCard' },
    { id: 'subscription', label: 'Subscription', icon: 'Package' },
    { id: 'usage', label: 'Usage', icon: 'BarChart3' },
    { id: 'history', label: 'Payment History', icon: 'Receipt' },
    { id: 'plans', label: 'Plans & Pricing', icon: 'Layers' },
  ];

  useEffect(() => {
    // derive user and role from unified profile
    if (userProfile) {
      setCurrentUser(userProfile);
      setUserRole((userProfile.role || 'member').toLowerCase());
    }
  }, [userProfile]);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      // Load billing data from API
      const [subscription, paymentHistory, usage, plans] = await Promise.all([
        apiService.getSubscriptionDetails(),
        apiService.getPaymentHistory(),
        apiService.getUsageBilling(),
        apiService.getAvailablePlans(),
      ]);

      setBillingData({
        subscription: subscription || generateMockSubscription(),
        paymentHistory: paymentHistory || generateMockPaymentHistory(),
        usage: usage || generateMockUsage(),
        plans: plans || generateMockPlans(),
      });
    } catch (error) {
      console.error('Failed to load billing data:', error);
      // Use mock data as fallback
      setBillingData({
        subscription: generateMockSubscription(),
        paymentHistory: generateMockPaymentHistory(),
        usage: generateMockUsage(),
        plans: generateMockPlans(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators
  const generateMockSubscription = () => ({
    plan: 'Professional',
    status: 'active',
    price: 29.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-15',
    seats: 25,
    usedSeats: 18,
    features: [
      'Unlimited Projects',
      'Advanced Analytics',
      'Priority Support',
      'Custom Integrations',
      'Advanced Security',
    ],
  });

  const generateMockPaymentHistory = () => [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 29.99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#',
    },
    {
      id: 'inv_002',
      date: '2023-12-15',
      amount: 29.99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#',
    },
    {
      id: 'inv_003',
      date: '2023-11-15',
      amount: 29.99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#',
    },
  ];

  const generateMockUsage = () => ({
    currentPeriod: {
      start: '2024-01-15',
      end: '2024-02-15',
    },
    metrics: [
      { name: 'Active Users', current: 18, limit: 25, unit: 'users' },
      { name: 'Projects', current: 12, limit: 'unlimited', unit: 'projects' },
      { name: 'Storage', current: 2.4, limit: 100, unit: 'GB' },
      { name: 'API Calls', current: 1250, limit: 10000, unit: 'calls' },
    ],
    overageCharges: 0,
  });

  const generateMockPlans = () => [
    {
      id: 'starter',
      name: 'Starter',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Up to 5 users',
        '10 projects',
        '5GB storage',
        'Basic support',
        'Standard integrations',
      ],
      current: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Up to 25 users',
        'Unlimited projects',
        '100GB storage',
        'Priority support',
        'Advanced integrations',
        'Analytics dashboard',
      ],
      current: true,
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Unlimited users',
        'Unlimited projects',
        '1TB storage',
        '24/7 dedicated support',
        'Custom integrations',
        'Advanced analytics',
        'SSO & SAML',
        'Custom branding',
      ],
      current: false,
    },
  ];

  // Check if user has access to billing
  if (userRole !== 'owner') {
    return (
      <div className='min-h-screen bg-background'>
        <RoleBasedHeader
          userRole={userRole.toLowerCase()}
          currentUser={currentUser}
          currentOrganization={profileOrg}
        />
        <main className='pt-16'>
          <div className='max-w-7xl mx-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <Icon
                  name='Lock'
                  size={32}
                  className='mx-auto mb-4 text-text-secondary'
                />
                <h3 className='text-lg font-medium text-text-primary mb-2'>
                  Access Restricted
                </h3>
                <p className='text-text-secondary mb-4'>
                  Billing management is only available to Organization Owners.
                </p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className='space-y-6'>
      {/* Current Subscription */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-text-primary'>
            Current Subscription
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              billingData.subscription.status === 'active'
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {billingData.subscription.status}
          </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <p className='text-sm text-text-secondary'>Plan</p>
            <p className='text-xl font-bold text-text-primary'>
              {billingData.subscription.plan}
            </p>
          </div>
          <div>
            <p className='text-sm text-text-secondary'>Price</p>
            <p className='text-xl font-bold text-text-primary'>
              ${billingData.subscription.price}/
              {billingData.subscription.billingCycle}
            </p>
          </div>
          <div>
            <p className='text-sm text-text-secondary'>Next Billing</p>
            <p className='text-xl font-bold text-text-primary'>
              {new Date(
                billingData.subscription.nextBillingDate
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className='mt-6 flex space-x-4'>
          <Button variant='outline' onClick={() => setActiveTab('plans')}>
            Change Plan
          </Button>
          <Button variant='outline'>Update Payment Method</Button>
        </div>
      </div>

      {/* Usage Overview */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <h3 className='text-lg font-semibold text-text-primary mb-4'>
          Usage Overview
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {billingData.usage.metrics.map((metric, index) => (
            <div key={index} className='p-4 bg-muted rounded-lg'>
              <p className='text-sm text-text-secondary'>{metric.name}</p>
              <div className='mt-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-lg font-bold text-text-primary'>
                    {metric.current} {metric.unit}
                  </span>
                  <span className='text-sm text-text-secondary'>
                    /{' '}
                    {metric.limit === 'unlimited'
                      ? '∞'
                      : `${metric.limit} ${metric.unit}`}
                  </span>
                </div>
                {metric.limit !== 'unlimited' && (
                  <div className='mt-2 w-full bg-background rounded-full h-2'>
                    <div
                      className='bg-primary h-2 rounded-full'
                      style={{
                        width: `${(metric.current / metric.limit) * 100}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-text-primary'>
            Recent Payments
          </h3>
          <Button variant='outline' onClick={() => setActiveTab('history')}>
            View All
          </Button>
        </div>

        <div className='space-y-3'>
          {billingData.paymentHistory.slice(0, 3).map((payment) => (
            <div
              key={payment.id}
              className='flex items-center justify-between p-3 bg-muted rounded-lg'
            >
              <div>
                <p className='font-medium text-text-primary'>
                  {payment.description}
                </p>
                <p className='text-sm text-text-secondary'>
                  {new Date(payment.date).toLocaleDateString()}
                </p>
              </div>
              <div className='text-right'>
                <p className='font-bold text-text-primary'>${payment.amount}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    payment.status === 'paid'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlansTab = () => (
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h3 className='text-2xl font-bold text-text-primary mb-2'>
          Choose Your Plan
        </h3>
        <p className='text-text-secondary'>
          Select the plan that best fits your organization's needs
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {billingData.plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-card rounded-lg border p-6 ${
              plan.current
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border'
            } ${plan.popular ? 'ring-2 ring-accent/20' : ''}`}
          >
            {plan.popular && (
              <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                <span className='bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium'>
                  Most Popular
                </span>
              </div>
            )}

            <div className='text-center mb-6'>
              <h4 className='text-xl font-bold text-text-primary'>
                {plan.name}
              </h4>
              <div className='mt-2'>
                <span className='text-3xl font-bold text-text-primary'>
                  ${plan.price}
                </span>
                <span className='text-text-secondary'>
                  /{plan.billingCycle}
                </span>
              </div>
            </div>

            <ul className='space-y-3 mb-6'>
              {plan.features.map((feature, index) => (
                <li key={index} className='flex items-center'>
                  <Icon name='Check' size={16} className='text-success mr-2' />
                  <span className='text-sm text-text-secondary'>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.current ? 'outline' : 'default'}
              className='w-full'
              disabled={plan.current}
            >
              {plan.current ? 'Current Plan' : 'Upgrade to ' + plan.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-background'>
      <RoleBasedHeader
        userRole={userRole.toLowerCase()}
        currentUser={
          currentUser
            ? {
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                email: currentUser.email,
                avatar: currentUser.avatar || '/assets/images/avatar.jpg',
                role: userRole,
              }
            : {
                name: 'Loading...',
                email: '',
                avatar: '/assets/images/avatar.jpg',
                role: userRole,
              }
        }
        currentOrganization={profileOrg}
      />

      <main className='pt-16'>
        <div className='max-w-7xl mx-auto p-6'>
          <Breadcrumb />

          {/* Page Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-text-primary'>
                Billing & Subscription
              </h1>
              <p className='text-text-secondary mt-2'>
                Manage your subscription, view usage, and payment history
              </p>
            </div>

            <Button variant='outline' iconName='Download'>
              Download Invoice
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className='border-b border-border mb-8'>
            <nav className='flex space-x-8'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                <p className='text-text-secondary'>Loading billing data...</p>
              </div>
            </div>
          ) : (
            <div>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'plans' && renderPlansTab()}
              {/* Other tabs would be implemented here */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Billing;
