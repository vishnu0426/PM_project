import React, { useState, useEffect } from 'react';
import apiService from '../../utils/apiService';
import ProjectSignoffModal from '../modals/ProjectSignoffModal';

const PendingSignoffsPanel = ({ userRole }) => {
  const [pendingSignoffs, setPendingSignoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSignoff, setSelectedSignoff] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userRole === 'owner') {
      loadPendingSignoffs();
    }
  }, [userRole]);

  const loadPendingSignoffs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.projectSignoff.getPendingSignoffs();
      setPendingSignoffs(result.data || []);
    } catch (error) {
      console.error('Failed to load pending sign-offs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSignoff = (signoffData) => {
    setSelectedSignoff(signoffData);
    setShowModal(true);
  };

  const handleSignoffSuccess = (result) => {
    console.log('Sign-off processed:', result);
    // Refresh the pending sign-offs list
    loadPendingSignoffs();
    setShowModal(false);
    setSelectedSignoff(null);
  };

  // Don't show panel for non-owners
  if (userRole !== 'owner') {
    return null;
  }

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Pending Sign-offs
        </h3>
        <div className='animate-pulse space-y-3'>
          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          <div className='h-4 bg-gray-200 rounded w-2/3'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Pending Sign-offs
        </h3>
        <div className='text-center py-4'>
          <div className='text-red-600 mb-2'>
            <svg
              className='w-8 h-8 mx-auto'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <p className='text-sm text-red-600'>
            Failed to load pending sign-offs
          </p>
          <button
            onClick={loadPendingSignoffs}
            className='mt-2 text-sm text-blue-600 hover:text-blue-800'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Pending Sign-offs
            </h3>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
              {pendingSignoffs.length} pending
            </span>
          </div>
        </div>

        <div className='p-6'>
          {pendingSignoffs.length === 0 ? (
            <div className='text-center py-8'>
              <div className='text-gray-400 mb-3'>
                <svg
                  className='w-12 h-12 mx-auto'
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
              </div>
              <h4 className='text-lg font-medium text-gray-900 mb-2'>
                No Pending Sign-offs
              </h4>
              <p className='text-gray-500'>
                All projects are up to date. New sign-off requests will appear
                here.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {pendingSignoffs.map((signoff) => (
                <div
                  key={signoff.project_id}
                  className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4 className='text-base font-medium text-gray-900 mb-2'>
                        {signoff.project_name}
                      </h4>

                      <div className='space-y-1 text-sm text-gray-600'>
                        <p>
                          <span className='font-medium'>Requested by:</span>{' '}
                          {signoff.requester_name || 'Unknown'}
                        </p>
                        <p>
                          <span className='font-medium'>Requested on:</span>{' '}
                          {new Date(
                            signoff.sign_off_requested_at
                          ).toLocaleDateString()}
                        </p>
                        {signoff.protection_reason && (
                          <p>
                            <span className='font-medium'>Reason:</span>{' '}
                            {signoff.protection_reason}
                          </p>
                        )}
                      </div>

                      {signoff.data_protected && (
                        <div className='mt-2'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                            <svg
                              className='w-3 h-3 mr-1'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                            Data Protected
                          </span>
                        </div>
                      )}
                    </div>

                    <div className='flex space-x-2 ml-4'>
                      <button
                        onClick={() => handleApproveSignoff(signoff)}
                        className='inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <svg
                          className='w-4 h-4 mr-1'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12l2 2 4-4'
                          />
                        </svg>
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sign-off Modal */}
      <ProjectSignoffModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSignoff(null);
        }}
        projectId={selectedSignoff?.project_id}
        projectName={selectedSignoff?.project_name}
        mode='approve'
        signoffData={selectedSignoff}
        onSuccess={handleSignoffSuccess}
      />
    </>
  );
};

export default PendingSignoffsPanel;
