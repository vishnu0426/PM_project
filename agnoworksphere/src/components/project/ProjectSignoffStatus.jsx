import React, { useState, useEffect } from 'react';
import apiService from '../../utils/apiService';

const ProjectSignoffStatus = ({
  projectId,
  userRole,
  onRequestSignoff,
  onApproveSignoff,
}) => {
  const [signoffStatus, setSignoffStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadSignoffStatus();
    }
  }, [projectId]);

  const loadSignoffStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.projectSignoff.getSignoffStatus(
        projectId
      );
      setSignoffStatus(result.data);
    } catch (error) {
      console.error('Failed to load sign-off status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!signoffStatus) return null;

    if (signoffStatus.sign_off_approved) {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
          <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
          Signed Off
        </span>
      );
    }

    if (signoffStatus.sign_off_requested) {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
          <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
              clipRule='evenodd'
            />
          </svg>
          Pending Approval
        </span>
      );
    }

    return (
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
        <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
            clipRule='evenodd'
          />
        </svg>
        Not Requested
      </span>
    );
  };

  const getDataProtectionBadge = () => {
    if (!signoffStatus?.data_protected) return null;

    return (
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
        <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
            clipRule='evenodd'
          />
        </svg>
        Data Protected
      </span>
    );
  };

  if (loading) {
    return (
      <div className='animate-pulse'>
        <div className='h-4 bg-gray-200 rounded w-32'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-sm text-red-600'>Failed to load sign-off status</div>
    );
  }

  if (!signoffStatus) return null;

  return (
    <div className='space-y-3'>
      {/* Status Badges */}
      <div className='flex items-center space-x-2'>
        {getStatusBadge()}
        {getDataProtectionBadge()}
      </div>

      {/* Sign-off Details */}
      {signoffStatus.sign_off_requested && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-blue-900'>
                Sign-off Request Details
              </h4>
              <div className='mt-2 space-y-1 text-xs text-blue-700'>
                <p>
                  <span className='font-medium'>Requested by:</span>{' '}
                  {signoffStatus.requester_name || 'Unknown'}
                </p>
                <p>
                  <span className='font-medium'>Requested on:</span>{' '}
                  {new Date(
                    signoffStatus.sign_off_requested_at
                  ).toLocaleDateString()}
                </p>
                {signoffStatus.protection_reason && (
                  <p>
                    <span className='font-medium'>Reason:</span>{' '}
                    {signoffStatus.protection_reason}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex space-x-2 ml-4'>
              {signoffStatus.can_approve &&
                !signoffStatus.sign_off_approved && (
                  <button
                    onClick={() => onApproveSignoff?.(signoffStatus)}
                    className='px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                  >
                    Review
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Approved Sign-off Details */}
      {signoffStatus.sign_off_approved && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
          <h4 className='text-sm font-medium text-green-900'>
            Project Signed Off
          </h4>
          <div className='mt-2 space-y-1 text-xs text-green-700'>
            <p>
              <span className='font-medium'>Approved by:</span>{' '}
              {signoffStatus.approver_name || 'Unknown'}
            </p>
            <p>
              <span className='font-medium'>Approved on:</span>{' '}
              {new Date(
                signoffStatus.sign_off_approved_at
              ).toLocaleDateString()}
            </p>
            {signoffStatus.sign_off_notes && (
              <p>
                <span className='font-medium'>Notes:</span>{' '}
                {signoffStatus.sign_off_notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Request Sign-off Button */}
      {!signoffStatus.sign_off_requested && userRole !== 'viewer' && (
        <button
          onClick={() => onRequestSignoff?.(signoffStatus)}
          className='inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <svg
            className='w-4 h-4 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          Request Sign-off
        </button>
      )}

      {/* Data Protection Warning */}
      {signoffStatus.data_protected && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-yellow-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-yellow-800'>
                Data Protection Active
              </h3>
              <div className='mt-2 text-sm text-yellow-700'>
                <p>
                  Project data (cards, boards, columns) is protected from
                  deletion.
                  {signoffStatus.protection_reason && (
                    <span className='block mt-1'>
                      <strong>Reason:</strong> {signoffStatus.protection_reason}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSignoffStatus;
