import React, { useState } from 'react';
import { useFetchLeaveDataQuery, useCancelLeaveRequestMutation } from '../../services/leavesService';
import { useUpdateLeaveBalanceMutation, useFetchUserByIdQuery } from '../../services/userService';
import '../../styles/LeaveStatus.css';
import type { Leave } from '../../types';

interface LeaveRequest {
  id: number;
  leaveCategory: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  leavePaymentType: 'paid' | 'unpaid';
  days: number;
  submittedAt: string;
}

interface LeaveStatusProps {
  onClose?: () => void;
}

const LeaveStatus: React.FC<LeaveStatusProps> = ({ onClose }) => {
  const userId = sessionStorage.getItem('id') || '';
  const { data: allLeaveRequests, error, isLoading, refetch } = useFetchLeaveDataQuery(userId);
  const [cancelLeaveRequest, { isLoading: isCancelling }] = useCancelLeaveRequestMutation();
  const [updateLeaveBalance] = useUpdateLeaveBalanceMutation();
  const { data: userData, refetch: refetchUser } = useFetchUserByIdQuery(userId || '', { skip: !userId });
  const [cancelError, setCancelError] = useState('');

  // Filter pending requests
  const pendingRequests = allLeaveRequests?.filter(
    (request: LeaveRequest) => request.status === 'pending'
  ) || [];

  const handleCancel = async (
    leaveId: number,
    leaveType: 'paid' | 'unpaid',
    days: number
  ) => {
    try {
      // First, cancel the leave request
      await cancelLeaveRequest({ id: leaveId, userId }).unwrap();

      // Then, update the leave balance
      if (!userData) {
        throw new Error('User data not found');
      }

      const currentBalance =
        leaveType === 'paid' ? userData.paidLeaveBalance : userData.unpaidLeaveBalance;
      const updatedBalance = currentBalance + days;

      await updateLeaveBalance({
        userId,
        type: leaveType,
        days: days,
        currentBalance: updatedBalance,
      }).unwrap();

      // Refetch leave requests and user data to update the UI
      await refetch(); // Refetch leave requests
      await refetchUser(); // Refetch user data to update balances

      setCancelError('');
    } catch (error) {
      console.error('Failed to cancel leave:', error);
      setCancelError('Failed to cancel leave request. Please try again.');
    }
  };

  if (isLoading) return <div className="loading">Loading leave requests...</div>;
  if (error) return <div className="error">Error loading leave requests.</div>;

  return (
    <div className="leave-status-container">
      <div className="leave-status-header">
        <h2>Pending Leave Requests</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      {cancelError && <div className="error-message">{cancelError}</div>}

      {pendingRequests.length === 0 ? (
        <p className="no-requests">No pending leave requests found.</p>
      ) : (
        <table className="leave-requests-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request: LeaveRequest) => (
              <tr key={request.id}>
                <td>{request.leaveCategory}</td>
                <td>{new Date(request.startDate).toLocaleDateString()}</td>
                <td>{new Date(request.endDate).toLocaleDateString()}</td>
                <td>{request.days}</td>
                <td>{request.reason}</td>
                <td className={`status-${request.status.toLowerCase()}`}>
                  {request.status}
                </td>
                <td>
                  <button
                    className="cancel-btn"
                    onClick={() =>
                      handleCancel(request.id, request.leavePaymentType as 'paid' | 'unpaid', request.days)
                    }
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveStatus;