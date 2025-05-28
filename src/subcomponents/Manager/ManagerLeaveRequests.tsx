import React, { useState } from 'react';
import { useGetTeamLeaveRequestsQuery, useUpdateLeaveStatusMutation } from '../../services/leavesService';
import { useUpdateLeaveBalanceMutation } from '../../services/userService';
import '../../styles/ManagerLeaveRequests.css';
import EmployeeFetcher from './employeeFetcher';
import Table from '../../components/table';
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
/**
* @description ManagerLeaveRequests component for managing team leave requests.
* It allows managers to view, approve, or reject leave requests from their team members.
* @component
* @returns {JSX.Element} The rendered ManagerLeaveRequests component.
*/
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
            }
            else if (status === 'rejected' && !employee) {
                console.warn(`Employee with ID ${selectedRequest.employee.id} not found. Skipping leave balance update.`);
                alert('Leave request processed, but employee data not found. Leave balance not updated.');
            }
            await refetch();
            setComment('');
            setSelectedRequest(null);
        }
        catch (err: any) {
            console.error('Failed to update status:', err);
            alert(err?.data?.message || err.message || 'Failed to update leave status');
        }
        finally {
            setIsProcessing(false);
        }
    };

    const columns: { header: string; accessor: (row: LeaveRequest) => React.ReactNode }[] = [
        {
            header: 'Employee',
            accessor: (row: LeaveRequest) => (
                <EmployeeFetcher employeeId={row.employee.id}>
                    {({ employee, isLoading: isEmployeeLoading, isError: isEmployeeError }) =>
                        isEmployeeLoading ? <span>Loading...</span> : isEmployeeError ? <span>Error</span> : <span>{row.employee.name}</span>
                    }
                </EmployeeFetcher>
            ),
        },
        {
            header: 'Leave Type',
            accessor: (row: LeaveRequest) => `${row.leaveCategory} (${row.leavePaymentType})`,
        },
        {
            header: 'Dates',
            accessor: (row: LeaveRequest) =>
                `${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}`,
        },
        {
            header: 'Days',
            accessor: (row: LeaveRequest) => row.days,
        },
        {
            header: 'Reason',
            accessor: (row: LeaveRequest) => row.reason,
        },
        {
            header: 'Status',
            accessor: (row: LeaveRequest) => (
                <span className={`status-${row.status}`}>{row.status}</span>
            ),
        },
        {
            header: 'Actions',
            accessor: (row: LeaveRequest) =>
                row.status === 'pending' ? (
                    <button
                        className="approve-btn"
                        onClick={() => setSelectedRequest(row)}
                        disabled={isProcessing}
                    >
                        Review
                    </button>
                ) : null,
        },
    ];

    if (isLoading)
        return <div>Loading team leave requests...</div>;
    if (error)
        return <div>Error loading requests</div>;
    return (<div className="manager-leave-requests">
            <h2>Team Leave Requests</h2>
            <div className="requests-list">
                {Array.isArray(leaveRequests) && leaveRequests.length === 0 ? (<p>No pending leave requests</p>) : ( 
                    <Table<LeaveRequest>
                        columns={columns}
                        rows={
                            Array.isArray(leaveRequests)
                                ? leaveRequests.map((leave: any) => ({
                                    ...leave,
                                    employee: leave.employee || { id: leave.employeeId || '', name: leave.employeeName || '' }
                                })) as LeaveRequest[]
                                : []
                        }
                    />)}
            </div>

            {selectedRequest && (<div className="review-modal">
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
                                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter comments for the employee..." disabled={isProcessing}/>
                            </label>
                        </div>

                        <div className="action-buttons">
                            <EmployeeFetcher employeeId={selectedRequest.employee.id}>
                                {({ employee, isLoading: isEmployeeLoading, isError: isEmployeeError }) => (<>
                                        <button className="approve-btn" onClick={() => handleApproveReject(selectedRequest.id, 'approved', employee)} disabled={isProcessing || isEmployeeLoading || isEmployeeError}>
                                            {isProcessing ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button className="reject-btn" onClick={() => handleApproveReject(selectedRequest.id, 'rejected', employee)} disabled={isProcessing || isEmployeeLoading || isEmployeeError}>
                                            {isProcessing ? 'Processing...' : 'Reject'}
                                        </button>
                                    </>)}
                            </EmployeeFetcher>
                            <button className="cancel-btn" onClick={() => setSelectedRequest(null)} disabled={isProcessing}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>)}
        </div>);
};
export default ManagerLeaveRequests;
