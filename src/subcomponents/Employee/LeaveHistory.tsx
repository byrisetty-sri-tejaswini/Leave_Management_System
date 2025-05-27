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
/**
* @description LeaveHistory component for displaying user's leave history.
* It fetches and displays all leave requests made by the user, excluding pending requests.
* @component
* @example
* return (
*   <LeaveHistory onClose={() => console.log('Closed leave history')} />
* );
* @property {Function} onClose - Function to handle closing the leave history modal.
* @param {LeaveHistoryProps} props - The properties for the LeaveHistory component.
* @property {string} userId - The ID of the user whose leave history is being displayed.
* @property {Array<LeaveRequest>} allLeaveRequests - Array of all leave requests fetched from the server.
* @property {Array<LeaveRequest>} leaveHistory - Filtered array of leave requests excluding pending requests.
* @property {boolean} isLoading - Indicates if the leave requests are currently being loaded.
* @property {boolean} error - Indicates if there was an error fetching leave requests.
* @property {Function} useFetchLeaveDataQuery - Hook to fetch leave data for the user.
* @property {JSX.Element} loading - Loading state while fetching leave history.
* @property {JSX.Element} error - Error state if there was an issue fetching leave history.
* @property {JSX.Element} noHistory - Message displayed when no leave history is found.
* @property {JSX.Element} leaveHistoryTable - Table displaying the leave history with columns for leave type, dates, days, reason, status, and submission date.
* @property {JSX.Element} leaveHistoryRow - Row for each leave request displaying its details.
* @property {string} status - The status of the leave request (approved, rejected, cancelled, pending).
* @property {string} leaveCategory - The category of leave (e.g., sick, vacation).
* @param {any} {onClose}
* @returns {JSX.Element} The rendered LeaveHistory component.
*/

const LeaveHistory: React.FC<LeaveHistoryProps> = ({ onClose }) => {
    const userId = sessionStorage.getItem('id') || '';
    const { data: allLeaveRequests, error, isLoading } = useFetchLeaveDataQuery(userId);
    // Filter out pending requests - show all others (approved, rejected, cancelled)
    const leaveHistory = allLeaveRequests?.filter((request: LeaveRequest) => request.status && request.status !== 'pending') || [];
    if (isLoading)
        return <div className="loading">Loading leave history...</div>;
    if (error)
        return <div className="error">Error loading leave history.</div>;
    return (<div className="leave-history-container">
      <div className="leave-status-header">
        <h2>Leave Request</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      {leaveHistory.length === 0 ? (<p className="no-history">No leave history found.</p>) : (<table className="leave-history-table">
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
                return (<tr key={request.id}>
                  <td>{request.leaveCategory}</td>
                  <td>{new Date(request.startDate).toLocaleDateString()}</td>
                  <td>{new Date(request.endDate).toLocaleDateString()}</td>
                  <td>{request.days}</td>
                  <td>{request.reason}</td>
                  <td className={`status-${status}`}>
                    {request.status}
                  </td>
                  <td>{new Date(request.submittedAt).toLocaleDateString()}</td>
                </tr>);
            })}
          </tbody>
        </table>)}
    </div>);
};
export default LeaveHistory;
