import React from 'react';
import { useFetchLeaveDataQuery } from '../../services/leavesService';
import Table from '../../components/table';
import '../../styles/leaveStatus.css';

interface LeaveRequest {
  id: number;
  leaveCategory: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'approved' | 'rejected' | 'cancelled' | 'pending';
  leavePaymentType: 'paid' | 'unpaid';
  days: number;
  submittedAt: string;
}

interface LeaveHistoryProps {
  onClose?: () => void;
}

const LeaveHistory: React.FC<LeaveHistoryProps> = ({ onClose }) => {
  const userId = sessionStorage.getItem('id') || '';
  const { data: allLeaveRequests, error, isLoading } = useFetchLeaveDataQuery(userId);
  const leaveHistory = allLeaveRequests?.filter((request: LeaveRequest) => request.status !== 'pending') || [];

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
      className: (row: LeaveRequest) => {
        switch (row.status) {
          case 'approved':
            return 'status-approved';
          case 'rejected':
            return 'status-rejected';
          case 'cancelled':
            return 'status-cancelled';
          default:
            return 'status-pending';
        }
      },
    },
    {
      header: 'Submitted On',
      accessor: (row: LeaveRequest) => new Date(row.submittedAt).toLocaleDateString(),
    },
  ];

  if (isLoading) return <div className="loading">Loading leave history...</div>;
  if (error) return <div className="error">Error loading leave history.</div>;

  return (
    <div className="leave-history-container">
      <div className="leave-status-header">
        <h2>Leave Request History</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <Table
        rows={leaveHistory}
        columns={columns}
        emptyMessage="No leave history found."
        className="leave-history-table"
      />
    </div>
  );
};

export default LeaveHistory;