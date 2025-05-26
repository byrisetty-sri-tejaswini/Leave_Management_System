import React from 'react';
import { useFetchLeaveDataQuery } from '../../services/leavesService';
import '../../styles/LeaveStatus.css';

interface LeaveHistoryProps {
  onClose?: () => void;
}

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

const LeaveHistory: React.FC<LeaveHistoryProps> = ({onClose}) => {
  const userId = sessionStorage.getItem('id') || '';
  const { data: allLeaveRequests, error, isLoading } = useFetchLeaveDataQuery(userId);
  
  // Filter out pending requests - show all others (approved, rejected, cancelled)
  const leaveHistory = allLeaveRequests?.filter(
    (request: LeaveRequest) => request.status && request.status !== 'pending'
  ) || [];

  if (isLoading) return <div className="loading">Loading leave history...</div>;
  if (error) return <div className="error">Error loading leave history.</div>;

  return (
    <div className="leave-history-container">
      <div className="leave-status-header">
        <h2>Leave Request</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      {leaveHistory.length === 0 ? (
        <p className="no-history">No leave history found.</p>
      ) : (
        <table className="leave-history-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {leaveHistory.map((request: LeaveRequest) => {
              const status = request.status?.toLowerCase() || 'unknown';
              return (
                <tr key={request.id}>
                  <td>{request.leaveCategory}</td>
                  <td>{new Date(request.startDate).toLocaleDateString()}</td>
                  <td>{new Date(request.endDate).toLocaleDateString()}</td>
                  <td>{request.days}</td>
                  <td>{request.reason}</td>
                  <td className={`status-${status}`}>
                    {request.status}
                  </td>
                  <td>{new Date(request.submittedAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveHistory;