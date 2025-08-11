import React, { useState, useEffect } from 'react';
import realApiService from '../../utils/realApiService';

const ProjectSignoffModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName, 
  mode = 'request', // 'request' or 'approve'
  signoffData = null,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    notes: '',
    reason: '',
    approved: true,
    unprotect_data: false
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (mode === 'request') {
        setFormData({
          notes: '',
          reason: '',
          approved: true,
          unprotect_data: false
        });
      } else if (signoffData) {
        setFormData({
          notes: signoffData.sign_off_notes || '',
          reason: signoffData.protection_reason || '',
          approved: true,
          unprotect_data: false
        });
      }
    }
  }, [isOpen, mode, signoffData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (mode === 'request') {
        result = await realApiService.projectSignoff.requestSignoff(projectId, {
          notes: formData.notes,
          reason: formData.reason
        });
      } else {
        result = await realApiService.projectSignoff.approveSignoff(projectId, {
          approved: formData.approved,
          notes: formData.notes,
          unprotect_data: formData.unprotect_data
        });
      }

      if (result.success) {
        onSuccess?.(result);
        onClose();
      }
    } catch (error) {
      console.error('Sign-off operation failed:', error);
      setError(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await realApiService.projectSignoff.approveSignoff(projectId, {
        approved: false,
        notes: formData.notes,
        unprotect_data: false
      });

      if (result.success) {
        onSuccess?.(result);
        onClose();
      }
    } catch (error) {
      console.error('Sign-off rejection failed:', error);
      setError(error.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'request' ? 'Request Project Sign-off' : 'Review Project Sign-off'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Project: <span className="font-medium">{projectName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {mode === 'request' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Sign-off Request
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Project completed, ready for review"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information for the project owner..."
                />
              </div>

              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Data Protection:</strong> Once you request sign-off, all project data (cards, boards, columns) will be automatically protected from deletion until the owner approves or rejects the request.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === 'approve' && signoffData && (
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Sign-off Request Details</h4>
                <p className="text-sm text-blue-700">
                  <strong>Requested by:</strong> {signoffData.requester_name || 'Unknown'}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Requested on:</strong> {new Date(signoffData.sign_off_requested_at).toLocaleDateString()}
                </p>
                {signoffData.protection_reason && (
                  <p className="text-sm text-blue-700">
                    <strong>Reason:</strong> {signoffData.protection_reason}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about your decision..."
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.unprotect_data}
                    onChange={(e) => setFormData({ ...formData, unprotect_data: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Remove data protection after approval (allows deletion of cards/boards)
                  </span>
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>

            {mode === 'approve' && (
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Reject'}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'request' ? 'Request Sign-off' : 'Approve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSignoffModal;
