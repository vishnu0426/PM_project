import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { generateProjectReport } from '../../utils/aiReportService';
import {
  TaskCompletionChart,
  PriorityDistributionChart,
  TeamProductivityChart,
  ProgressTimelineChart,
  BudgetUtilizationChart
} from '../charts/ReportCharts';

const AIReportModal = ({ isOpen, onClose, project }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (isOpen && project) {
      generateReport();
    }
  }, [isOpen, project]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await generateProjectReport(project, {
        type: 'comprehensive',
        includeCharts: true,
        includePredictions: true
      });

      if (result.success) {
        setReport(result.report);
      } else {
        setError(result.error || 'Failed to generate report');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReport(null);
    setError(null);
    setActiveTab('summary');
    onClose();
  };

  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting report in ${format} format`);
    // In a real implementation, this would generate and download the file
    alert(`Report export in ${format} format is not yet implemented`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'needs attention': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      default: return 'Circle';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Icon name="BarChart3" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Project Report</h2>
              <p className="text-sm text-gray-500">{project?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {report && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  onClick={() => handleExport('pdf')}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="FileSpreadsheet"
                  onClick={() => handleExport('excel')}
                >
                  Export Excel
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { id: 'summary', label: 'Executive Summary', icon: 'FileText' },
                { id: 'charts', label: 'Visual Analytics', icon: 'PieChart' },
                { id: 'insights', label: 'AI Insights', icon: 'Brain' },
                { id: 'metrics', label: 'Key Metrics', icon: 'BarChart3' },
                { id: 'recommendations', label: 'Recommendations', icon: 'Lightbulb' },
                { id: 'risks', label: 'Risk Assessment', icon: 'AlertTriangle' },
                { id: 'predictions', label: 'Predictions', icon: 'TrendingUp' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating AI report...</p>
                  <p className="text-sm text-gray-500 mt-2">Analyzing project data and generating insights</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Generating Report</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={generateReport}>Try Again</Button>
                </div>
              </div>
            )}

            {report && !loading && !error && (
              <div className="space-y-6">
                {/* Executive Summary */}
                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
                      
                      {/* Status Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Project Status</p>
                              <p className={`text-lg font-semibold capitalize px-2 py-1 rounded-full text-xs ${getStatusColor(report.executiveSummary.status)}`}>
                                {report.executiveSummary.status}
                              </p>
                            </div>
                            <Icon name="Activity" size={24} className="text-gray-400" />
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Completion Rate</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {report.executiveSummary.completionRate.toFixed(1)}%
                              </p>
                            </div>
                            <Icon name="Target" size={24} className="text-gray-400" />
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Risk Level</p>
                              <p className={`text-lg font-semibold capitalize px-2 py-1 rounded-full text-xs ${getRiskColor(report.executiveSummary.riskLevel)}`}>
                                {report.executiveSummary.riskLevel}
                              </p>
                            </div>
                            <Icon name="Shield" size={24} className="text-gray-400" />
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Success Probability</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {report.executiveSummary.successProbability.toFixed(0)}%
                              </p>
                            </div>
                            <Icon name="TrendingUp" size={24} className="text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Key Insights</h4>
                        <div className="space-y-3">
                          {report.executiveSummary.keyInsights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Icon 
                                name={getInsightIcon(insight.type)} 
                                size={20} 
                                className={getInsightColor(insight.type)} 
                              />
                              <div>
                                <h5 className="font-medium text-gray-900">{insight.title}</h5>
                                <p className="text-sm text-gray-600">{insight.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Analytics Charts */}
                {activeTab === 'charts' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Visual Analytics</h3>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Task Completion Chart */}
                      <TaskCompletionChart
                        data={report.charts.taskCompletion.data}
                      />

                      {/* Priority Distribution Chart */}
                      <PriorityDistributionChart
                        data={report.charts.priorityDistribution.data}
                      />

                      {/* Budget Utilization Chart - Only for owners */}
                      {report.charts.budgetUtilization && (
                        <BudgetUtilizationChart
                          data={report.charts.budgetUtilization.data}
                        />
                      )}

                      {/* Team Productivity Chart */}
                      <TeamProductivityChart
                        data={report.charts.teamProductivity.data}
                      />
                    </div>

                    {/* Progress Timeline Chart */}
                    <div className="mt-6">
                      <ProgressTimelineChart
                        data={report.charts.progressOverTime.data}
                      />
                    </div>

                    {/* Chart Insights */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start space-x-3">
                        <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">Chart Insights</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Task completion rate is {report.executiveSummary.completionRate.toFixed(1)}% with {report.data.taskBreakdown.inProgress} tasks in progress</li>
                            <li>• High priority tasks represent {((report.data.metrics.highPriorityTasks / report.data.taskBreakdown.total) * 100).toFixed(1)}% of total workload</li>
                            <li>• Team productivity shows {report.data.teamMetrics.activeMembers} active members contributing to project goals</li>
                            <li>• Progress tracking indicates {report.analysis.predictions.velocityTrend} velocity trend</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {activeTab === 'insights' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h3>
                    {report.analysis.insights.map((insight, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Icon 
                            name={getInsightIcon(insight.type)} 
                            size={20} 
                            className={getInsightColor(insight.type)} 
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <p className="text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Metrics */}
                {activeTab === 'metrics' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
                    
                    {/* Task Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Task Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Tasks:</span>
                            <span className="font-medium">{report.data.taskBreakdown.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium text-green-600">{report.data.taskBreakdown.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">In Progress:</span>
                            <span className="font-medium text-yellow-600">{report.data.taskBreakdown.inProgress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To Do:</span>
                            <span className="font-medium text-gray-600">{report.data.taskBreakdown.todo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Overdue:</span>
                            <span className="font-medium text-red-600">{report.data.taskBreakdown.overdue}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Team Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Members:</span>
                            <span className="font-medium">{report.data.teamMetrics.totalMembers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active Members:</span>
                            <span className="font-medium text-green-600">{report.data.teamMetrics.activeMembers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Team Productivity:</span>
                            <span className="font-medium">{report.data.teamMetrics.productivity.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add other tabs content here... */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                    {report.analysis.recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            rec.priority === 'high' ? 'bg-red-500' : 
                            rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-700' : 
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {rec.priority} priority
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{rec.description}</p>
                            <p className="text-sm text-blue-600 font-medium">Action: {rec.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReportModal;
