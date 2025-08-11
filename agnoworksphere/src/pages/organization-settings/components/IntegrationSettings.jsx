import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const IntegrationSettings = ({
  userRole = 'owner',
  currentUser,
  currentOrganization,
}) => {
  const [apiSettings, setApiSettings] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [],
  });

  const [apiKey, setApiKey] = useState('');
  // Helper to get JWT token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch settings, integrations, webhooks from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const orgId = currentOrganization?.id;
        if (!orgId) throw new Error('No organization selected');
        const [settingsRes, integrationsRes, webhooksRes, apiKeyRes] =
          await Promise.all([
            axios.get(`/api/v1/organizations/${orgId}/settings`, {
              headers: getAuthHeaders(),
            }),
            axios.get(`/api/v1/organizations/${orgId}/integrations`, {
              headers: getAuthHeaders(),
            }),
            axios.get(`/api/v1/organizations/${orgId}/webhooks`, {
              headers: getAuthHeaders(),
            }),
            axios.get(`/api/v1/organizations/${orgId}/api-key`, {
              headers: getAuthHeaders(),
            }),
          ]);
        setApiSettings(settingsRes.data);
        setIntegrations(integrationsRes.data);
        setWebhooks(webhooksRes.data);
        setApiKey(apiKeyRes.data?.api_key || '');
      } catch (err) {
        setError(err.message || 'Failed to load organization settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentOrganization]);

  const handleApiSettingChange = (field, value) => {
    setApiSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIntegrationToggle = (integrationId) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
  };

  const handleWebhookToggle = (webhookId) => {
    setWebhooks((prev) =>
      prev.map((webhook) =>
        webhook.id === webhookId
          ? { ...webhook, active: !webhook.active }
          : webhook
      )
    );
  };

  const handleAddWebhook = async () => {
    if (newWebhook.name && newWebhook.url) {
      try {
        setSaving(true);
        const orgId = currentOrganization?.id;
        const res = await axios.post(
          `/api/v1/organizations/${orgId}/webhooks`,
          newWebhook,
          { headers: getAuthHeaders() }
        );
        setWebhooks((prev) => [...prev, res.data]);
        setNewWebhook({ name: '', url: '', events: [] });
        setShowWebhookForm(false);
      } catch (err) {
        setError(err.message || 'Failed to add webhook');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const orgId = currentOrganization?.id;
      await axios.put(`/api/v1/organizations/${orgId}/settings`, apiSettings, {
        headers: getAuthHeaders(),
      });
      await axios.put(
        `/api/v1/organizations/${orgId}/integrations`,
        integrations,
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div>Loading organization settings...</div>;
  if (error) return <div className='text-red-500'>Error: {error}</div>;

  return (
    <div className='space-y-8'>
      {/* API Configuration */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
            <Icon name='Code' size={20} color='white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              API Configuration
            </h3>
            <p className='text-sm text-muted-foreground'>
              Manage API access and authentication
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <Checkbox
                label='Enable API Access'
                description='Allow external applications to access your organization data'
                checked={apiSettings.apiEnabled}
                onChange={(e) =>
                  handleApiSettingChange('apiEnabled', e.target.checked)
                }
              />
            </div>
          </div>

          {apiSettings.apiEnabled && (
            <div className='space-y-4 pl-6 border-l-2 border-primary/20'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  API Key
                </label>
                <div className='flex items-center space-x-3'>
                  <div className='flex-1 relative'>
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className='pr-20'
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                    >
                      <Icon name={showApiKey ? 'EyeOff' : 'Eye'} size={16} />
                    </button>
                  </div>
                  <Button variant='outline' iconName='Copy'>
                    Copy
                  </Button>
                  <Button variant='destructive' iconName='RotateCcw'>
                    Regenerate
                  </Button>
                </div>
              </div>

              <Input
                label='Rate Limit (requests per hour)'
                type='number'
                value={apiSettings.rateLimitPerHour}
                onChange={(e) =>
                  handleApiSettingChange('rateLimitPerHour', e.target.value)
                }
                min='100'
                max='10000'
              />

              <Input
                label='Allowed Origins'
                type='text'
                value={apiSettings.allowedOrigins}
                onChange={(e) =>
                  handleApiSettingChange('allowedOrigins', e.target.value)
                }
                placeholder='https://example.com, https://app.example.com'
                description='Comma-separated list of allowed CORS origins'
              />
            </div>
          )}
        </div>
      </div>

      {/* Third-Party Integrations */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-accent rounded-lg flex items-center justify-center'>
              <Icon name='Puzzle' size={20} color='white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Third-Party Integrations
              </h3>
              <p className='text-sm text-muted-foreground'>
                Connect with external services and tools
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className='border border-border rounded-lg p-4'
            >
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-muted rounded-lg flex items-center justify-center'>
                    <Icon name={integration.icon} size={20} />
                  </div>
                  <div>
                    <h4 className='font-medium text-foreground'>
                      {integration.name}
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {integration.configured && (
                    <div
                      className='w-2 h-2 bg-success rounded-full'
                      title='Configured'
                    />
                  )}
                  <button
                    onClick={() => handleIntegrationToggle(integration.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      integration.enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        integration.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>Last sync: {formatDate(integration.lastSync)}</span>
                {integration.enabled && (
                  <Button variant='ghost' size='xs'>
                    Configure
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-secondary rounded-lg flex items-center justify-center'>
              <Icon name='Webhook' size={20} color='white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Webhooks
              </h3>
              <p className='text-sm text-muted-foreground'>
                Receive real-time notifications about events
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            iconName='Plus'
            onClick={() => setShowWebhookForm(true)}
          >
            Add Webhook
          </Button>
        </div>

        <div className='space-y-4'>
          <Checkbox
            label='Enable Webhooks'
            description='Allow sending HTTP requests to external endpoints'
            checked={apiSettings.webhooksEnabled}
            onChange={(e) =>
              handleApiSettingChange('webhooksEnabled', e.target.checked)
            }
          />

          {apiSettings.webhooksEnabled && (
            <div className='space-y-3 pl-6 border-l-2 border-secondary/20'>
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className='border border-border rounded-lg p-4'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h4 className='font-medium text-foreground'>
                        {webhook.name}
                      </h4>
                      <p className='text-sm text-muted-foreground font-mono'>
                        {webhook.url}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          webhook.active
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {webhook.active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleWebhookToggle(webhook.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          webhook.active ? 'bg-success' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            webhook.active ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
                    <span>Events: {webhook.events.join(', ')}</span>
                    <span>
                      Last triggered: {formatDate(webhook.lastTriggered)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Webhook Form */}
      {showWebhookForm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-foreground'>
                Add Webhook
              </h3>
              <button
                onClick={() => setShowWebhookForm(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <Icon name='X' size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <Input
                label='Webhook Name'
                type='text'
                value={newWebhook.name}
                onChange={(e) =>
                  setNewWebhook((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder='Enter webhook name'
              />

              <Input
                label='Endpoint URL'
                type='url'
                value={newWebhook.url}
                onChange={(e) =>
                  setNewWebhook((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder='https://api.example.com/webhook'
              />

              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  Events
                </label>
                <div className='space-y-2'>
                  {[
                    'card.created',
                    'card.updated',
                    'card.moved',
                    'member.added',
                  ].map((event) => (
                    <Checkbox
                      key={event}
                      label={event}
                      checked={newWebhook.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhook((prev) => ({
                            ...prev,
                            events: [...prev.events, event],
                          }));
                        } else {
                          setNewWebhook((prev) => ({
                            ...prev,
                            events: prev.events.filter((e) => e !== event),
                          }));
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className='flex space-x-3 mt-6'>
              <Button
                variant='outline'
                onClick={() => setShowWebhookForm(false)}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                variant='default'
                onClick={handleAddWebhook}
                className='flex-1'
              >
                Add Webhook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className='flex justify-end pt-6 border-t border-border'>
        <Button
          variant='default'
          onClick={handleSave}
          loading={saving}
          iconName='Save'
          iconPosition='left'
        >
          Save Integration Settings
        </Button>
      </div>
    </div>
  );
};

export default IntegrationSettings;
