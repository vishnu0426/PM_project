import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ReportCharts = ({ chartData, chartType, title, className = "" }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <Pie 
            data={chartData} 
            options={{
              ...defaultOptions,
              plugins: {
                ...defaultOptions.plugins,
                legend: {
                  ...defaultOptions.plugins.legend,
                  position: 'right'
                }
              }
            }} 
          />
        );
      
      case 'doughnut':
        return (
          <Doughnut 
            data={chartData} 
            options={{
              ...defaultOptions,
              plugins: {
                ...defaultOptions.plugins,
                legend: {
                  ...defaultOptions.plugins.legend,
                  position: 'right'
                }
              },
              cutout: '60%'
            }} 
          />
        );
      
      case 'bar':
        return (
          <Bar 
            data={chartData} 
            options={{
              ...defaultOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    font: {
                      size: 11
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      size: 11
                    }
                  }
                }
              }
            }} 
          />
        );
      
      case 'line':
        return (
          <Line 
            data={chartData} 
            options={{
              ...defaultOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    font: {
                      size: 11
                    }
                  }
                },
                x: {
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  },
                  ticks: {
                    font: {
                      size: 11
                    }
                  }
                }
              },
              elements: {
                point: {
                  radius: 4,
                  hoverRadius: 6
                },
                line: {
                  tension: 0.3
                }
              }
            }} 
          />
        );
      
      default:
        return <div className="text-gray-500">Unsupported chart type</div>;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="h-64 w-full">
        {renderChart()}
      </div>
    </div>
  );
};

// Specific chart components for different metrics
export const TaskCompletionChart = ({ data }) => {
  const chartData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [data.completed, data.inProgress, data.todo],
        backgroundColor: [
          '#10b981', // green for completed
          '#f59e0b', // yellow for in progress
          '#6b7280'  // gray for todo
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <ReportCharts 
      chartData={chartData} 
      chartType="doughnut" 
      title="Task Completion Status"
      className="col-span-1"
    />
  );
};

export const PriorityDistributionChart = ({ data }) => {
  const chartData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        label: 'Number of Tasks',
        data: [data.high, data.medium, data.low],
        backgroundColor: [
          '#ef4444', // red for high
          '#f59e0b', // yellow for medium
          '#10b981'  // green for low
        ],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <ReportCharts 
      chartData={chartData} 
      chartType="bar" 
      title="Priority Distribution"
      className="col-span-1"
    />
  );
};

export const TeamProductivityChart = ({ data }) => {
  const chartData = {
    labels: data.members.map(member => member.name),
    datasets: [
      {
        label: 'Tasks Completed',
        data: data.members.map(member => member.completed),
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1
      },
      {
        label: 'Tasks Assigned',
        data: data.members.map(member => member.assigned),
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
        borderWidth: 1
      }
    ]
  };

  return (
    <ReportCharts 
      chartData={chartData} 
      chartType="bar" 
      title="Team Productivity"
      className="col-span-2"
    />
  );
};

export const ProgressTimelineChart = ({ data }) => {
  const chartData = {
    labels: data.timeline.map(point => point.week),
    datasets: [
      {
        label: 'Actual Progress (%)',
        data: data.timeline.map(point => point.actual),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Target Progress (%)',
        data: data.timeline.map(point => point.target),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  return (
    <ReportCharts 
      chartData={chartData} 
      chartType="line" 
      title="Progress Over Time"
      className="col-span-2"
    />
  );
};

export const BudgetUtilizationChart = ({ data }) => {
  const chartData = {
    labels: ['Spent', 'Remaining'],
    datasets: [
      {
        data: [data.spent, data.remaining],
        backgroundColor: [
          '#f59e0b', // yellow for spent
          '#10b981'  // green for remaining
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <ReportCharts 
      chartData={chartData} 
      chartType="pie" 
      title="Budget Utilization"
      className="col-span-1"
    />
  );
};

export default ReportCharts;
