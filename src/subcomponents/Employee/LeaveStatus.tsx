import React, { useState } from 'react';
import { useFetchLeaveDataQuery, useCancelLeaveRequestMutation } from '../../services/leavesService';
import { useUpdateLeaveBalanceMutation, useFetchUserByIdQuery } from '../../services/userService';
import '../../styles/LeaveStatus.css';
import Table from '../../components/table';


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

// description: LeaveStatus component for displaying and managing pending leave requests.
// It allows users to view their pending leave requests and cancel them if needed.
// @component
// @example
// return (
//  <LeaveStatus onClose={() => console.log('Closed leave status')} />
// );
// @returns {JSX.Element} - The rendered LeaveStatus component.

const LeaveStatus: React.FC<LeaveStatusProps> = ({ onClose }) => {
  const userId = sessionStorage.getItem('id') || '';
  const { data: allLeaveRequests, error, isLoading, refetch } = useFetchLeaveDataQuery(userId);
  const [cancelLeaveRequest, { isLoading: isCancelling }] = useCancelLeaveRequestMutation();
  const [updateLeaveBalance] = useUpdateLeaveBalanceMutation();
  const { data: userData, refetch: refetchUser } = useFetchUserByIdQuery(userId || '', { skip: !userId });
  const [cancelError, setCancelError] = useState('');

  const pendingRequests = allLeaveRequests?.filter((request: LeaveRequest) => request.status === 'pending') || [];

  const handleCancel = async (leave: LeaveRequest) => {
    try {
      await cancelLeaveRequest({ id: leave.id, userId }).unwrap();
      if (!userData) {
        throw new Error('User data not found');
      }
      const currentBalance = leave.leavePaymentType === 'paid' ? userData.paidLeaveBalance : userData.unpaidLeaveBalance;
      const updatedBalance = currentBalance + leave.days;
      await updateLeaveBalance({
        userId,
        type: leave.leavePaymentType,
        days: leave.days,
        currentBalance: updatedBalance,
      }).unwrap();
      await refetch();
      await refetchUser();
      setCancelError('');
    } catch (error) {
      console.error('Failed to cancel leave:', error);
      setCancelError('Failed to cancel leave request. Please try again.');
    }
  };

  const columns = [
    { header: 'Leave Type', accessor: (row: LeaveRequest) => row.leaveCategory },
    {
      header: 'Start Date',
      accessor: (row: LeaveRequest) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      header: 'End Date',
      accessor: (row: LeaveRequest) => new Date(row.endDate).toLocaleDateString(),
    },
    { header: 'Days', accessor: (row: LeaveRequest) => row.days },
    { header: 'Reason', accessor: (row: LeaveRequest) => row.reason },
    {
      header: 'Status',
      accessor: (row: LeaveRequest) => row.status,
      className: (row: LeaveRequest) => `leave-request-status-${row.status}`,
    },
  ];

  const actions = [
    {
      label: isCancelling ? 'Cancelling...' : 'Cancel',
      onClick: (row: LeaveRequest) => handleCancel(row),
      disabled: () => isCancelling,
      className: 'cancel-btn',
    },
  ];

  if (isLoading) return <div className="loading">Loading leave requests...</div>;
  if (error) return <div className="error">Error loading leave requests.</div>;

  return (
    <div className="leave-status-container">
      <div className="leave-status-header">
        <h2>Pending Leave Requests</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      {cancelError && <div className="error-message">{cancelError}</div>}
      <Table
        rows={pendingRequests}
        columns={columns}
        actions={actions}
        emptyMessage="No pending leave requests found."
        className="leave-requests-table"
      />
    </div>
  );
};

export default LeaveStatus;