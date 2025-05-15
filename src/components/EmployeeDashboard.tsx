// src/components/Dashboard.tsx
import React, { useState } from 'react';
import { useLeave } from '../subcomponents/LeaveContext';
import ApplyLeave from '../subcomponents/ApplyLeave';
import LeaveStatus from '../subcomponents/LeaveStatus';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/EmpDashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeeDashboard = () => {
    const { paidLeaveBalance, unpaidLeaveBalance } = useLeave();
    const [showApplyLeave, setShowApplyLeave] = useState(false);
    const [showLeaveStatus, setShowLeaveStatus] = useState(false);

    // Sample data - replace with your actual data
    const paidLeavesTaken = paidLeaveBalance; // Example: 3 paid leaves taken
    const unpaidLeavesTaken = unpaidLeaveBalance; // Example: 2 unpaid leaves taken

    // Chart data configuration
    const chartData = {
        labels: ['Paid Leaves Taken', 'Unpaid Leaves Taken'],
        datasets: [
            {
                data: [paidLeavesTaken, unpaidLeavesTaken],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#2d8cd6', '#e0556f'],
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.label}: ${context.raw} days`;
                    }
                }
            }
        },
        cutout: '70%',
    };

    return (
        <div className='emp-dashboard'>
            <h2>Employee Dashboard</h2>
            <div className='dashboard-container'>
                    <div className='emp-leave-balance'>
                        <h3>My Leave Balance</h3>
                        <div className="leave-chart">
                            <h3>Leaves Taken</h3>
                            <div className="chart-container">
                                <Doughnut data={chartData} options={chartOptions} />
                            </div>
                        </div>
                        <p>Paid Leave: {paidLeaveBalance} days remaining</p>
                        <p>Unpaid Leave: {unpaidLeaveBalance} days remaining</p>
                    </div>

                <div className="action-buttons">
                    <button
                        onClick={() => {
                            setShowApplyLeave(true);
                            setShowLeaveStatus(false);
                        }}
                        className="leave-button"
                    >
                        Apply Leave
                    </button>

                    <button
                        onClick={() => {
                            setShowLeaveStatus(true);
                            setShowApplyLeave(false);
                        }}
                        className="leave-button"
                    >
                        Leave Status
                    </button>
                    <button
                        onClick={() => {
                            setShowLeaveStatus(true);
                            setShowApplyLeave(false);
                        }}
                        className="leave-button"
                    >
                        Leave History
                    </button>
                </div>
            </div>

            {showApplyLeave && <ApplyLeave onClose={() => setShowApplyLeave(false)} />}
            {showLeaveStatus && <LeaveStatus onClose={() => setShowLeaveStatus(false)} />}
        </div>
    );
};

export default EmployeeDashboard;