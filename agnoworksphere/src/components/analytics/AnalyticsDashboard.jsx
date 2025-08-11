import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  RefreshCwIcon,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsDashboard = ({ organizationId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [widgets, setWidgets] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchWidgets();
  }, [organizationId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/organizations/${organizationId}/analytics/overview?date_range=${dateRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWidgets = async () => {
    try {
      const response = await fetch(
        `/api/v1/organizations/${organizationId}/dashboard/widgets`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWidgets(data);
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
    }
  };

  const exportData = async (exportType, format) => {
    try {
      const response = await fetch(
        `/api/v1/organizations/${organizationId}/exports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            export_type: exportType,
            export_format: format,
          }),
        }
      );

      if (response.ok) {
        alert("Export started! You will be notified when it's ready.");
      }
    } catch (error) {
      console.error('Error starting export:', error);
    }
  };

  const MetricCard = ({
    title,
    value,
    unit,
    change,
    trend,
    icon: Icon,
    color = 'blue',
  }) => (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900'>
            {value}
            {unit && <span className='text-sm text-gray-500 ml-1'>{unit}</span>}
          </p>
          {change !== undefined && (
            <div className='flex items-center mt-2'>
              {trend === 'up' ? (
                <TrendingUpIcon className='h-4 w-4 text-green-500 mr-1' />
              ) : trend === 'down' ? (
                <TrendingDownIcon className='h-4 w-4 text-red-500 mr-1' />
              ) : null}
              <span
                className={`text-sm ${
                  trend === 'up'
                    ? 'text-green-600'
                    : trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ChartWidget = ({ title, type, data, options = {} }) => {
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: title,
        },
      },
      ...options,
    };

    const renderChart = () => {
      switch (type) {
        case 'line':
          return <Line data={data} options={defaultOptions} />;
        case 'bar':
          return <Bar data={data} options={defaultOptions} />;
        case 'pie':
          return <Pie data={data} options={defaultOptions} />;
        case 'doughnut':
          return <Doughnut data={data} options={defaultOptions} />;
        default:
          return <Line data={data} options={defaultOptions} />;
      }
    };

    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='h-64'>{renderChart()}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCwIcon className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const memberGrowthData = {
    labels: (analytics.member_growth || []).map((item) =>
      new Date(item.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'New Members',
        data: (analytics.member_growth || []).map((item) => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const taskCompletionData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [
          analytics.completed_tasks,
          analytics.total_tasks - analytics.completed_tasks,
          0, // Placeholder for pending tasks
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Analytics Dashboard
          </h1>
          <p className='text-gray-600'>Organization performance overview</p>
        </div>
        <div className='flex items-center space-x-4'>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className='border border-gray-300 rounded-md px-3 py-2 text-sm'
          >
            <option value='7d'>Last 7 days</option>
            <option value='30d'>Last 30 days</option>
            <option value='90d'>Last 90 days</option>
            <option value='1y'>Last year</option>
            <option value='all'>All time</option>
          </select>
          <button
            onClick={() => exportData('analytics', 'excel')}
            className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm'
          >
            <DownloadIcon className='h-4 w-4 mr-2' />
            Export
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <MetricCard
          title='Total Members'
          value={analytics.total_members}
          icon={UsersIcon}
          color='blue'
        />
        <MetricCard
          title='Active Projects'
          value={analytics.active_projects}
          unit={`/ ${analytics.total_projects}`}
          icon={FolderIcon}
          color='green'
        />
        <MetricCard
          title='Task Completion'
          value={analytics.completion_rate.toFixed(1)}
          unit='%'
          icon={CheckCircleIcon}
          color='purple'
        />
        <MetricCard
          title='Avg. Completion Time'
          value={
            analytics.average_task_completion_time
              ? `${analytics.average_task_completion_time.toFixed(1)}`
              : 'N/A'
          }
          unit={analytics.average_task_completion_time ? 'hours' : ''}
          icon={ClockIcon}
          color='orange'
        />
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ChartWidget
          title='Member Growth Over Time'
          type='line'
          data={memberGrowthData}
        />
        <ChartWidget
          title='Task Completion Status'
          type='doughnut'
          data={taskCompletionData}
        />
      </div>

      {/* Custom Widgets */}
      {widgets.length > 0 && (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
            >
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                {widget.widget_name}
              </h3>
              <div className='text-sm text-gray-600'>
                Widget Type: {widget.widget_type}
              </div>
              {/* Widget content would be rendered based on widget.configuration */}
            </div>
          ))}
        </div>
      )}

      {/* Additional Analytics */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Project Performance
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center'>
            <p className='text-2xl font-bold text-blue-600'>
              {analytics.project_completion_rate.toFixed(1)}%
            </p>
            <p className='text-sm text-gray-600'>Project Completion Rate</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-green-600'>
              {analytics.completed_tasks}
            </p>
            <p className='text-sm text-gray-600'>Tasks Completed</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-purple-600'>
              {analytics.total_tasks}
            </p>
            <p className='text-sm text-gray-600'>Total Tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
