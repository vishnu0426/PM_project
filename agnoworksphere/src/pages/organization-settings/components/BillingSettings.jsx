import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BillingSettings = ({
  userRole = 'owner',
  currentUser,
  currentOrganization,
}) => {
  const [currentPlan] = useState({
    name: 'Professional',
    price: 29,
    billing: 'monthly',
    features: [
      'Up to 100 team members',
      'Unlimited projects and boards',
      'Advanced reporting and analytics',
      'Priority customer support',
      'API access and integrations',
      'Custom fields and workflows',
    ],
    usage: {
      members: 47,
      maxMembers: 100,
      projects: 23,
      storage: 15.7,
      maxStorage: 100,
    },
  });

  const [billingInfo, setBillingInfo] = useState({
    companyName: 'Agno WorkSphere Inc.',
    email: 'billing@agno.com',
    address: '123 Business Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'US',
    taxId: 'US123456789',
  });

  const [paymentMethod] = useState({
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2027,
  });

  const [invoices] = useState([
    {
      id: 'INV-2025-001',
      date: '2025-01-01',
      amount: 29.0,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-012',
      date: '2024-12-01',
      amount: 29.0,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-011',
      date: '2024-11-01',
      amount: 29.0,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-2024-010',
      date: '2024-10-01',
      amount: 29.0,
      status: 'paid',
      downloadUrl: '#',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      name: 'Starter',
      price: 9,
      features: [
        'Up to 10 team members',
        'Basic project management',
        'Email support',
      ],
      recommended: false,
    },
    {
      name: 'Professional',
      price: 29,
      features: [
        'Up to 100 team members',
        'Advanced features',
        'Priority support',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 99,
      features: [
        'Unlimited members',
        'Custom integrations',
        'Dedicated support',
      ],
      recommended: false,
    },
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AU', label: 'Australia' },
  ];

  const handleBillingInfoChange = (field, value) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveBillingInfo = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    console.log('Billing info saved:', billingInfo);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUsagePercentage = (used, max) => {
    return Math.round((used / max) * 100);
  };

  return (
    <div className='space-y-8'>
      {/* Current Plan */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
              <Icon name='CreditCard' size={20} color='white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Current Plan
              </h3>
              <p className='text-sm text-muted-foreground'>
                Manage your subscription and billing
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            iconName='ArrowUp'
            onClick={() => setShowUpgradeModal(true)}
          >
            Upgrade Plan
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div className='bg-primary/10 border border-primary/20 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='text-lg font-semibold text-foreground'>
                  {currentPlan.name}
                </h4>
                <div className='text-right'>
                  <div className='text-2xl font-bold text-foreground'>
                    ${currentPlan.price}
                  </div>
                  <div className='text-sm text-muted-foreground'>per month</div>
                </div>
              </div>
              <div className='text-sm text-muted-foreground mb-3'>
                Next billing date: February 1, 2025
              </div>
              <ul className='space-y-1'>
                {currentPlan.features.map((feature, index) => (
                  <li
                    key={index}
                    className='flex items-center space-x-2 text-sm'
                  >
                    <Icon name='Check' size={14} className='text-success' />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='space-y-4'>
            <h4 className='font-medium text-foreground'>Usage Overview</h4>

            <div className='space-y-3'>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Team Members</span>
                  <span>
                    {currentPlan.usage.members} / {currentPlan.usage.maxMembers}
                  </span>
                </div>
                <div className='w-full bg-muted rounded-full h-2'>
                  <div
                    className='bg-primary h-2 rounded-full'
                    style={{
                      width: `${getUsagePercentage(
                        currentPlan.usage.members,
                        currentPlan.usage.maxMembers
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Active Projects</span>
                  <span>{currentPlan.usage.projects}</span>
                </div>
                <div className='w-full bg-muted rounded-full h-2'>
                  <div
                    className='bg-accent h-2 rounded-full'
                    style={{ width: '23%' }}
                  />
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Storage Used</span>
                  <span>
                    {currentPlan.usage.storage} GB /{' '}
                    {currentPlan.usage.maxStorage} GB
                  </span>
                </div>
                <div className='w-full bg-muted rounded-full h-2'>
                  <div
                    className='bg-warning h-2 rounded-full'
                    style={{
                      width: `${getUsagePercentage(
                        currentPlan.usage.storage,
                        currentPlan.usage.maxStorage
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-success rounded-lg flex items-center justify-center'>
              <Icon name='Wallet' size={20} color='white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Payment Method
              </h3>
              <p className='text-sm text-muted-foreground'>
                Manage your payment information
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            iconName='Edit'
            onClick={() => setShowPaymentModal(true)}
          >
            Update Payment
          </Button>
        </div>

        <div className='flex items-center space-x-4 p-4 border border-border rounded-lg'>
          <div className='w-12 h-8 bg-primary rounded flex items-center justify-center'>
            <Icon name='CreditCard' size={16} color='white' />
          </div>
          <div className='flex-1'>
            <div className='font-medium text-foreground'>
              {paymentMethod.brand} ending in {paymentMethod.last4}
            </div>
            <div className='text-sm text-muted-foreground'>
              Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
            </div>
          </div>
          <div className='text-sm text-success font-medium'>Active</div>
        </div>
      </div>

      {/* Billing Information */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-accent rounded-lg flex items-center justify-center'>
            <Icon name='FileText' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Billing Information
            </h3>
            <p className='text-sm text-muted-foreground'>
              Update your billing details and tax information
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <Input
              label='Company Name'
              type='text'
              value={billingInfo.companyName}
              onChange={(e) =>
                handleBillingInfoChange('companyName', e.target.value)
              }
            />

            <Input
              label='Billing Email'
              type='email'
              value={billingInfo.email}
              onChange={(e) => handleBillingInfoChange('email', e.target.value)}
            />

            <Input
              label='Address'
              type='text'
              value={billingInfo.address}
              onChange={(e) =>
                handleBillingInfoChange('address', e.target.value)
              }
            />

            <div className='grid grid-cols-2 gap-3'>
              <Input
                label='City'
                type='text'
                value={billingInfo.city}
                onChange={(e) =>
                  handleBillingInfoChange('city', e.target.value)
                }
              />
              <Input
                label='State/Province'
                type='text'
                value={billingInfo.state}
                onChange={(e) =>
                  handleBillingInfoChange('state', e.target.value)
                }
              />
            </div>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <Input
                label='ZIP/Postal Code'
                type='text'
                value={billingInfo.zipCode}
                onChange={(e) =>
                  handleBillingInfoChange('zipCode', e.target.value)
                }
              />
              <Select
                label='Country'
                options={countryOptions}
                value={billingInfo.country}
                onChange={(value) => handleBillingInfoChange('country', value)}
              />
            </div>

            <Input
              label='Tax ID (Optional)'
              type='text'
              value={billingInfo.taxId}
              onChange={(e) => handleBillingInfoChange('taxId', e.target.value)}
              description='VAT number, GST number, or other tax identifier'
            />

            <Button
              variant='default'
              onClick={handleSaveBillingInfo}
              loading={saving}
              iconName='Save'
              iconPosition='left'
            >
              Save Billing Info
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-secondary rounded-lg flex items-center justify-center'>
            <Icon name='Receipt' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Invoice History
            </h3>
            <p className='text-sm text-muted-foreground'>
              Download and view past invoices
            </p>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border'>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Invoice
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Date
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Amount
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Status
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className='border-b border-border hover:bg-muted/50'
                >
                  <td className='py-3 px-4 font-medium text-foreground'>
                    {invoice.id}
                  </td>
                  <td className='py-3 px-4 text-muted-foreground'>
                    {formatDate(invoice.date)}
                  </td>
                  <td className='py-3 px-4 text-foreground'>
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className='py-3 px-4'>
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success'>
                      {invoice.status}
                    </span>
                  </td>
                  <td className='py-3 px-4'>
                    <Button variant='ghost' size='xs' iconName='Download'>
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-lg border border-border p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-foreground'>
                Choose Your Plan
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <Icon name='X' size={20} />
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`border rounded-lg p-6 relative ${
                    plan.recommended
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  {plan.recommended && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                      <span className='bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full'>
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className='text-center mb-6'>
                    <h4 className='text-lg font-semibold text-foreground mb-2'>
                      {plan.name}
                    </h4>
                    <div className='text-3xl font-bold text-foreground'>
                      ${plan.price}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      per month
                    </div>
                  </div>

                  <ul className='space-y-2 mb-6'>
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className='flex items-center space-x-2 text-sm'
                      >
                        <Icon name='Check' size={14} className='text-success' />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.recommended ? 'default' : 'outline'}
                    className='w-full'
                    disabled={plan.name === currentPlan.name}
                  >
                    {plan.name === currentPlan.name
                      ? 'Current Plan'
                      : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-foreground'>
                Update Payment Method
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <Icon name='X' size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <Input
                label='Card Number'
                type='text'
                placeholder='1234 5678 9012 3456'
              />

              <div className='grid grid-cols-2 gap-3'>
                <Input label='Expiry Date' type='text' placeholder='MM/YY' />
                <Input label='CVC' type='text' placeholder='123' />
              </div>

              <Input
                label='Cardholder Name'
                type='text'
                placeholder='John Doe'
              />
            </div>

            <div className='flex space-x-3 mt-6'>
              <Button
                variant='outline'
                onClick={() => setShowPaymentModal(false)}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button variant='default' className='flex-1'>
                Update Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSettings;
