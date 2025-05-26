import React, { useState } from 'react';
import { useGetTeamLeaveRequestsQuery, useUpdateLeaveStatusMutation } from '../../services/leavesService';
import { useUpdateLeaveBalanceMutation } from '../../services/userService';
import '../../styles/ManagerLeaveRequests.css';
import EmployeeFetcher from './EmployeeFetcher';

interface Employee {
    id: string;
    name: string;
}

interface LeaveRequest {
    id: number;
    employee: Employee;
    leaveCategory: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    leavePaymentType: 'paid' | 'unpaid';
    submittedAt: string;
}

const ManagerLeaveRequests: React.FC = () => {
    const managerId = sessionStorage.getItem('id') || '';
    const { data: leaveRequests, isLoading, error, refetch } = useGetTeamLeaveRequestsQuery(managerId);
    const [updateStatus] = useUpdateLeaveStatusMutation();
    const [updateLeaveBalance] = useUpdateLeaveBalanceMutation();
    const [comment, setComment] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApproveReject = async (requestId: number, status: 'approved' | 'rejected', employee?: any) => {
        setIsProcessing(true);
        try {
            if (!selectedRequest) {
                throw new Error('No leave request selected');
            }

            // Update the leave request status
            await updateStatus({
                id: requestId,
                status,
                managerComment: comment,
            }).unwrap();
            
            // If rejected, restore leave days to the user's balance
            if (status === 'rejected' && employee) {
                const type = selectedRequest.leavePaymentType as 'paid' | 'unpaid';
                const currentBalance = type === 'paid' ? employee.paidLeaveBalance : employee.unpaidLeaveBalance;
                const updatedBalance = currentBalance + selectedRequest.days;
                console.log('Updated Balance:', updatedBalance);

                await updateLeaveBalance({
                    userId: selectedRequest.employee.id,
                    type,
                    days: selectedRequest.days,
                    currentBalance: updatedBalance,
                }).unwrap();
            } else if (status === 'rejected' && !employee) {
                console.warn(`Employee with ID ${selectedRequest.employee.id} not found. Skipping leave balance update.`);
                alert('Leave request processed, but employee data not found. Leave balance not updated.');
            }

            await refetch();
            setComment('');
            setSelectedRequest(null);
        } catch (err: any) {
            console.error('Failed to update status:', err);
            alert(err?.data?.message || err.message || 'Failed to update leave status');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div>Loading team leave requests...</div>;
    if (error) return <div>Error loading requests</div>;

    return (
        <div className="manager-leave-requests">
            <h2>Team Leave Requests</h2>

            <div className="requests-list">
                {Array.isArray(leaveRequests) && leaveRequests.length === 0 ? (
                    <p>No pending leave requests</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Leave Type</th>
                                <th>Dates</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(leaveRequests as LeaveRequest[] | undefined)?.map((request: LeaveRequest) => (
                                <EmployeeFetcher key={request.id} employeeId={request.employee.id}>
                                    {({ employee, isLoading: isEmployeeLoading, isError: isEmployeeError }) => (
                                        <tr>
                                            <td>
                                                {isEmployeeLoading ? 'Loading...' : isEmployeeError ? 'Error' : request.employee.name}
                                            </td>
                                            <td>{request.leaveCategory} ({request.leavePaymentType})</td>
                                            <td>
                                                {new Date(request.startDate).toLocaleDateString()} -
                                                {new Date(request.endDate).toLocaleDateString()}
                                            </td>
                                            <td>{request.days}</td>
                                            <td>{request.reason}</td>
                                            <td className={`status-${request.status}`}>
                                                {request.status}
                                            </td>
                                            <td>
                                                {request.status === 'pending' && (
                                                    <button
                                                        className="approve-btn"
                                                        onClick={() => setSelectedRequest(request)}
                                                        disabled={isProcessing || isEmployeeLoading || isEmployeeError}
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </EmployeeFetcher>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedRequest && (
                <div className="review-modal">
                    <div className="modal-content">
                        <h3>Review Leave Request</h3>
                        <p><strong>Employee:</strong> {selectedRequest.employee.name}</p>
                        <p><strong>Leave Type:</strong> {selectedRequest.leaveCategory} ({selectedRequest.leavePaymentType})</p>
                        <p><strong>Dates:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                        <p><strong>Days:</strong> {selectedRequest.days}</p>
                        <p><strong>Reason:</strong> {selectedRequest.reason}</p>

                        <div className="comment-section">
                            <label>
                                Comment (Optional):
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Enter comments for the employee..."
                                    disabled={isProcessing}
                                />
                            </label>
                        </div>

                        <div className="action-buttons">
                            <EmployeeFetcher employeeId={selectedRequest.employee.id}>
                                {({ employee, isLoading: isEmployeeLoading, isError: isEmployeeError }) => (
                                    <>
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleApproveReject(selectedRequest.id, 'approved', employee)}
                                            disabled={isProcessing || isEmployeeLoading || isEmployeeError}
                                        >
                                            {isProcessing ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleApproveReject(selectedRequest.id, 'rejected', employee)}
                                            disabled={isProcessing || isEmployeeLoading || isEmployeeError}
                                        >
                                            {isProcessing ? 'Processing...' : 'Reject'}
                                        </button>
                                    </>
                                )}
                            </EmployeeFetcher>
                            <button
                                className="cancel-btn"
                                onClick={() => setSelectedRequest(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerLeaveRequests;