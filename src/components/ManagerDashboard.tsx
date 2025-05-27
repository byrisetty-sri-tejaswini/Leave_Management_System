import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useFetchLeaveRequestsQuery, useUpdateLeaveRequestMutation } from '../services/leavesService';
import { useFetchUsersQuery, useUpdateLeaveBalanceMutation, useFetchUserByIdQuery } from '../services/userService';
import '../styles/ManagerDashboard.css';
import type { User } from '../types';
import ProfileMenu from './ProfileMenu';
import EmployeeFetcher from '../subcomponents/Manager/EmployeeFetcher';

/**
* @description ManagerDashboard component for managing leave requests and team members.
* It allows managers to view their team members, handle leave requests, and update leave balances.
* @component
* @example
* return (  
*  <ManagerDashboard />
* );
* @returns {JSX.Element} - The rendered ManagerDashboard component.
*/

const ManagerDashboard: React.FC = () => {
    const managerId = sessionStorage.getItem('id');
    const navigate = useNavigate();
    // Fetch manager's data to check role
    const { data: manager, isLoading: isManagerLoading, isError: isManagerError } = useFetchUserByIdQuery(managerId || '', { skip: !managerId });
    const { data: users = [], isLoading: isUsersLoading } = useFetchUsersQuery();
    const [updateLeaveRequest] = useUpdateLeaveRequestMutation();
    const [updateLeaveBalance] = useUpdateLeaveBalanceMutation();
    const { data: allLeaves = [], isLoading: isLeavesLoading, refetch: refetchLeaves } = useFetchLeaveRequestsQuery('', { skip: !managerId });
    // Filter leave requests where employee's reports matches managerId
    const leaves = allLeaves.filter(leave => {
        const employee = users.find(user => user.id === leave.userId);
        return employee?.reports === managerId;
    });
    // State to manage active tab
    const [activeTab, setActiveTab] = useState<'team' | 'leave-requests'>('team');
    const [isProcessing, setIsProcessing] = useState(false);
    // Check if user is a manager
    const isManager = manager?.role === 'manager';
    // Get team members reporting to this manager
    const teamMembers = users.filter(user => user.reports === managerId);
    // Check for pending leave requests
    const hasPendingLeaves = leaves.some(leave => leave.status === 'pending');
    const handleTabChange = (tab: 'team' | 'leave-requests') => {
        setActiveTab(tab);
    };
    const handleLeaveDecision = async (requestId: string, decision: 'approved' | 'rejected', employee?: User) => {
        setIsProcessing(true);
        try {
            const leaveRequest = leaves.find(leave => leave.id === requestId);
            if (!leaveRequest) {
                throw new Error('Leave request not found');
            }
            // Update leave request status
            await updateLeaveRequest({
                id: requestId,
                status: decision,
                processedAt: new Date().toISOString(),
            }).unwrap();
            // If rejected, restore leave balance
            if (decision === 'rejected' && employee) {
                const leavePaymentType = leaveRequest.leavePaymentType;
                const days = leaveRequest.days;
                if (!leavePaymentType || !days) {
                    throw new Error('Invalid leave request data: leavePaymentType or days missing');
                }
                const currentBalance = leavePaymentType === 'paid' ? employee.paidLeaveBalance : employee.unpaidLeaveBalance;
                const newBalance = currentBalance + days;
                await updateLeaveBalance({
                    userId: employee.id,
                    type: leavePaymentType,
                    days: days,
                    currentBalance: newBalance,
                }).unwrap();
            }
            else if (decision === 'rejected' && !employee) {
                console.warn(`Employee with ID ${leaveRequest.userId} not found. Skipping leave balance update.`);
            }
            await refetchLeaves();
        }
        catch (err) {
            console.error('Failed to process leave request:', err);
            alert(`Failed to process leave request: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        finally {
            setIsProcessing(false);
        }
    };
    if (isManagerLoading || isUsersLoading || isLeavesLoading) {
        return <div className="loading">Loading...</div>;
    }
    if (isManagerError || !managerId || !manager) {
        return <div className="error">Failed to fetch manager data.</div>;
    }
    if (!isManager) {
        navigate('/employee-dashboard');
        return null;
    }
    return (<div className="manager-dashboard">
            <header className="dashboard-header">
                <nav className="dashboard-nav">
                    <NavLink to="/employee-dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        My Dashboard
                    </NavLink>
                    <button className={`nav-link ${activeTab === 'team' ? 'active' : ''}`} onClick={() => handleTabChange('team')}>
                        My Team
                    </button>
                    <button className={`nav-link ${activeTab === 'leave-requests' ? 'active' : ''}`} onClick={() => handleTabChange('leave-requests')}>
                        Leave Requests
                        {hasPendingLeaves && <span className="pending-indicator"></span>}
                    </button>
                </nav>
                <div className="profile-menu-container">
                    <ProfileMenu onLogout={() => {
            sessionStorage.clear();
            navigate('/login');
        }}/>
                </div>
            </header>

            {activeTab === 'team' && (<section className="team-section">
                    <h3>My Team</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.length === 0 ? (<tr>
                                    <td colSpan={3}>No team members assigned.</td>
                                </tr>) : (teamMembers.map(member => (<tr key={member.id}>
                                        <td>{member.id}</td>
                                        <td>{member.name}</td>
                                        <td>{member.email}</td>
                                    </tr>)))}
                        </tbody>
                    </table>
                </section>)}

            {activeTab === 'leave-requests' && (<section className="leave-requests">
                    <h3>Pending Leave Requests</h3>
                    {leaves.length === 0 ? (<p>No pending leave requests</p>) : (<table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Dates</th>
                                    <th>Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map(request => (<EmployeeFetcher key={request.id} employeeId={request.userId}>
                                        {({ employee, isLoading, isError }: {
                        employee?: User;
                        isLoading: boolean;
                        isError: boolean;
                    }) => (<tr>
                                                <td>
                                                    {isLoading ? 'Loading...' : isError ? 'Error' : employee?.name || 'Unknown'}
                                                </td>
                                                <td>{request.startDate} to {request.endDate}</td>
                                                <td>{request.reason}</td>
                                                <td>
                                                    {request.status === 'pending' && (<>
                                                            <button onClick={() => handleLeaveDecision(request.id, 'approved', employee)} disabled={isProcessing || isLoading || isError}>
                                                                {isProcessing ? 'Processing...' : 'Approve'}
                                                            </button>
                                                            <button onClick={() => handleLeaveDecision(request.id, 'rejected', employee)} disabled={isProcessing || isLoading || isError}>
                                                                {isProcessing ? 'Processing...' : 'Reject'}
                                                            </button>
                                                        </>)}
                                                    {request.status !== 'pending' && (<span className={`status-${request.status}`}>
                                                            {request.status}
                                                        </span>)}
                                                </td>
                                            </tr>)}
                                    </EmployeeFetcher>))}
                            </tbody>
                        </table>)}
                </section>)}
        </div>);
};
export default ManagerDashboard;
