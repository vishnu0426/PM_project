import React, { useState } from 'react';
import Button from './Button';
import Icon from '../AppIcon';

const ProjectExportButton = ({ projectData, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const exportFormats = [
    { 
      id: 'pdf', 
      label: 'PDF Report', 
      icon: 'FileText', 
      description: 'Comprehensive project report with all details' 
    },
    { 
      id: 'excel', 
      label: 'Excel Spreadsheet', 
      icon: 'FileSpreadsheet', 
      description: 'Task breakdown and timeline in spreadsheet format' 
    },
    { 
      id: 'json', 
      label: 'JSON Data', 
      icon: 'Code', 
      description: 'Raw project data for integration with other tools' 
    },
    { 
      id: 'csv', 
      label: 'CSV Tasks', 
      icon: 'Table', 
      description: 'Task list in CSV format for import into other systems' 
    }
  ];

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowOptions(false);

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(projectData);
          break;
        case 'excel':
          await exportToExcel(projectData);
          break;
        case 'json':
          await exportToJSON(projectData);
          break;
        case 'csv':
          await exportToCSV(projectData);
          break;
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (data) => {
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const content = generatePDFContent(data);
    const blob = new Blob([content], { type: 'text/plain' });
    downloadFile(blob, `${data.name || 'project'}_report.txt`);
  };

  const exportToExcel = async (data) => {
    // Simulate Excel generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `${data.name || 'project'}_tasks.csv`);
  };

  const exportToJSON = async (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    downloadFile(blob, `${data.name || 'project'}_data.json`);
  };

  const exportToCSV = async (data) => {
    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `${data.name || 'project'}_tasks.csv`);
  };

  const generatePDFContent = (data) => {
    return `
PROJECT REPORT
==============

Project Name: ${data.name || 'Untitled Project'}
Project Type: ${data.type?.label || 'General'}
Estimated Duration: ${data.estimatedDuration || 'N/A'} days
Estimated Tasks: ${data.estimatedTasks || 'N/A'}

PROJECT PHASES
==============
${data.phases?.map((phase, index) => `${index + 1}. ${phase}`).join('\n') || 'No phases defined'}

RECOMMENDED TECHNOLOGIES
========================
${data.technologies?.join(', ') || 'No technologies specified'}

TEAM RECOMMENDATIONS
====================
${data.teamRecommendations?.map(rec => `• ${rec}`).join('\n') || 'No recommendations available'}

Generated on: ${new Date().toLocaleString()}
    `.trim();
  };

  const generateCSVContent = (data) => {
    const headers = ['Phase', 'Task', 'Priority', 'Estimated Hours', 'Status'];
    const rows = [headers.join(',')];
    
    // Add sample task data (in real implementation, this would come from actual task data)
    data.phases?.forEach((phase, phaseIndex) => {
      for (let i = 1; i <= 3; i++) {
        rows.push([
          `"${phase}"`,
          `"Task ${i} for ${phase}"`,
          '"Medium"',
          '8',
          '"To Do"'
        ].join(','));
      }
    });
    
    return rows.join('\n');
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting || !projectData}
        iconName={isExporting ? "Loader2" : "Download"}
        iconPosition="left"
        className={isExporting ? "animate-spin" : ""}
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Export Options</h3>
            <p className="text-sm text-gray-500">Choose your preferred export format</p>
          </div>
          
          <div className="p-2">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={format.icon} size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{format.label}</div>
                  <div className="text-sm text-gray-500">{format.description}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setShowOptions(false)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close options */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default ProjectExportButton;
