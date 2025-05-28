import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import ApplyLeave from '../subcomponents/Employee/applyLeave';
import LeaveStatus from '../subcomponents/Employee/leaveStatus';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/EmpDashboard.css';
import DynamicCalendar from './dynamicCalender';
import LeaveHistory from '../subcomponents/Employee/leaveHistory';
import ProfileMenu from './profileMenu';
import { useFetchUserByIdQuery } from '../services/userService';
import { useFetchLeaveRequestsQuery } from '../services/leavesService';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
* @description EmployeeDashboard component displays the employee's dashboard with leave balance, calendar, and options to apply for leave, check leave status, and view leave history.
* It fetches employee data and leave requests using RTK Query, and allows employees to manage their leave requests.
* @returns {JSX.Element} - The rendered EmployeeDashboard component.
*/

const EmployeeDashboard: React.FC = () => {
    const userId = sessionStorage.getItem('id');
    const navigate = useNavigate();
    // Fetch employee data using RTK Query
    const { data: employee, isLoading, isError } = useFetchUserByIdQuery(userId || '', { skip: !userId });
    // Fetch leave requests for managers to check pending leaves
    const { data: leaves = [] } = useFetchLeaveRequestsQuery(userId ?? '', {
        skip: !userId || employee?.role !== 'manager',
    });
    const [showApplyLeave, setShowApplyLeave] = useState(false);
    const [showLeaveStatus, setShowLeaveStatus] = useState(false);
    const [showLeaveHistory, setShowLeaveHistory] = useState(false);
    const [paidLeaveBalance, setPaidLeaveBalance] = useState<number>(0);
    const [unpaidLeaveBalance, setUnpaidLeaveBalance] = useState<number>(0);
    useEffect(() => {
        if (employee) {
            setPaidLeaveBalance(employee.paidLeaveBalance ?? 0);
            setUnpaidLeaveBalance(employee.unpaidLeaveBalance ?? 0);
        }
    }, [employee]);
    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [navigate, userId]);
    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }
    if (isError || !employee) {
        return <div className="error">Failed to fetch user data.</div>;
    }
    if (employee.paidLeaveBalance == null || employee.unpaidLeaveBalance == null) {
        return <div className="error">Leave balance data is unavailable.</div>;
    }
    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };
    const handleBalanceUpdate = (newPaidBalance: number, newUnpaidBalance: number) => {
        setPaidLeaveBalance(newPaidBalance);
        setUnpaidLeaveBalance(newUnpaidBalance);
    };
    const chartData = {
        labels: ['Paid Leave', 'Unpaid Leave'],
        datasets: [
            {
                data: [employee.paidLeaveBalance, employee.unpaidLeaveBalance],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#2d8cd6', '#e0556f'],
                borderWidth: 1,
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.label}: ${context.raw} days`,
                },
            },
        },
        cutout: '60%',
    };
    const isHR = employee.role === 'hr';
    const isManager = employee.role === 'manager';
    // Check for pending leave requests for managers
    const hasPendingLeaves = leaves.some(leave => leave.status === 'pending');

    return (
        <div className="emp-dashboard">
            <header className="dashboard-header">
                {(isHR || isManager) ? (<nav className="dashboard-nav">
                    <NavLink to="/employee-dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        My Dashboard
                    </NavLink>
                    {isHR && (<NavLink to="/hr-dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        Employee Data
                    </NavLink>)}
                    {isManager && (<>
                        <NavLink to="/manager-dashboard?tab=team" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            My Team
                        </NavLink>
                        <NavLink to="/manager-dashboard?tab=leave-requests" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Leave Requests
                            {hasPendingLeaves && <span className="pending-indicator"></span>}
                        </NavLink>
                    </>)}
                </nav>) : (<h2>My Dashboard</h2>)}
                <div className="profile-menu-container">
                    <ProfileMenu onLogout={handleLogout} />
                </div>
            </header>

            <div className="dashboard-container">
                <div className="emp-leave-balance">
                    <h3>My Leave Balance</h3>
                    <div className="leave-chart">
                        <h3>Leaves Taken</h3>
                        <div className="chart-container" style={{ height: '200px', alignItems: 'center' }}>
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>
                    <p>Paid Leave: {paidLeaveBalance} days remaining</p>
                    <p>Unpaid Leave: {unpaidLeaveBalance} days remaining</p>
                </div>

                <div className='calendar-section'>
                    <h3>Calendar</h3>
                    <div className="calendar-container">
                        <DynamicCalendar />
                    </div>
                </div>
                <div className='button-container'>
                    <div className="action-buttons">
                        <button onClick={() => {
                            setShowApplyLeave(true);
                            setShowLeaveStatus(false);
                            setShowLeaveHistory(false);
                        }} className="leave-button">
                            Apply Leave
                        </button>

                        <button onClick={() => {
                            setShowLeaveStatus(true);
                            setShowApplyLeave(false);
                            setShowLeaveHistory(false);
                        }} className="leave-button">
                            Leave Status
                        </button>

                        <button onClick={() => {
                            setShowLeaveHistory(true);
                            setShowApplyLeave(false);
                            setShowLeaveStatus(false);
                        }} className="leave-button">
                            Leave History
                        </button>
                    </div>
                </div>
            </div>

            {showApplyLeave && (<div className="modal-backdrop">
                <ApplyLeave onClose={() => setShowApplyLeave(false)} userId={userId} onBalanceUpdate={handleBalanceUpdate} />
            </div>)}
            {showLeaveStatus && (<div className="modal-backdrop">

                <LeaveStatus onClose={() => setShowLeaveStatus(false)} />

            </div>)}
            {showLeaveHistory && (<div className="modal-backdrop">

                <LeaveHistory onClose={() => setShowLeaveHistory(false)} />

            </div>)}
        </div>);
};
export default EmployeeDashboard;
