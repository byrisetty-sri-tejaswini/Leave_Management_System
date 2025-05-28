import React, { useState, useEffect } from 'react';
import { useApplyLeaveMutation, useFetchLeaveDataQuery } from '../../services/leavesService';
import { useUpdateLeaveBalanceMutation, useFetchUserByIdQuery } from '../../services/userService';
import '../../styles/ApplyLeave.css';
interface ApplyLeaveProps {
    onClose: () => void;
    userId: string | null;
    onBalanceUpdate: (paidBalance: number, unpaidBalance: number) => void;
}
/**
* @description ApplyLeave component for submitting leave applications.
* It allows users to select leave dates, category, type, and reason.
* It checks for balance and overlaps with existing leave requests.
* @component
* @example
* return (
*   <ApplyLeave onClose={handleClose} userId={userId} onBalanceUpdate={handleBalanceUpdate} />
* );
* @property {Function} onClose - Function to close the leave application form.
* @property {string | null} userId - The ID of the user applying for leave.
* @property {Function} onBalanceUpdate - Function to update the leave balance after application.
* @param {any} { onClose, userId, onBalanceUpdate }
* @returns {JSX.Element} - The rendered ApplyLeave component.
*/
const ApplyLeave: React.FC<ApplyLeaveProps> = ({ onClose, userId, onBalanceUpdate }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        leaveCategory: 'Sick',
        leavePaymentType: 'paid' as 'paid' | 'unpaid',
        reason: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [daysRequested, setDaysRequested] = useState(0);
    const [balanceError, setBalanceError] = useState(false);
    const [overlapError, setOverlapError] = useState(false);
    const [paidLeaveBalance, setPaidLeaveBalance] = useState<number>(0);
    const [unpaidLeaveBalance, setUnpaidLeaveBalance] = useState<number>(0);
    const [applyLeaveMutation] = useApplyLeaveMutation();
    const [updateLeaveBalance] = useUpdateLeaveBalanceMutation();
    const { data: userData, isLoading: isUserLoading } = useFetchUserByIdQuery(userId || '', { skip: !userId });
    const { data: leaveData = [] } = useFetchLeaveDataQuery(userId || '', { skip: !userId });
    useEffect(() => {
        if (userData) {
            setPaidLeaveBalance(userData.paidLeaveBalance ?? 0);
            setUnpaidLeaveBalance(userData.unpaidLeaveBalance ?? 0);
        }
    }, [userData]);
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            let days = 0;
            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dayOfWeek = date.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    days += 1;
                }
            }
            setDaysRequested(days > 0 ? days : 0);
            const newStartDate = new Date(formData.startDate).getTime();
            const newEndDate = new Date(formData.endDate).getTime();
            const hasOverlap = leaveData.some((leave: {
                startDate: string;
                endDate: string;
                status: string;
            }) => {
                const existingStart = new Date(leave.startDate).getTime();
                const existingEnd = new Date(leave.endDate).getTime();
                return (leave.status !== 'cancelled' &&
                    leave.status !== 'rejected' &&
                    (newStartDate <= existingEnd && newEndDate >= existingStart));
            });
            setOverlapError(hasOverlap);
        }
        else {
            setDaysRequested(0);
            setOverlapError(false);
        }
    }, [formData.startDate, formData.endDate, leaveData]);
    useEffect(() => {
        if (daysRequested > 0) {
            if (formData.leavePaymentType === 'paid' && daysRequested > paidLeaveBalance) {
                setBalanceError(true);
            }
            else if (formData.leavePaymentType === 'unpaid' && daysRequested > unpaidLeaveBalance) {
                setBalanceError(true);
            }
            else {
                setBalanceError(false);
            }
        }
    }, [daysRequested, formData.leavePaymentType, paidLeaveBalance, unpaidLeaveBalance]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!userId) {
            setError('User not authenticated');
            return;
        }
        if (!userData?.reports) {
            setError('No manager assigned');
            return;
        }
        if (daysRequested <= 0) {
            setError('Please select valid dates');
            return;
        }
        if (balanceError) {
            setError(`Insufficient ${formData.leavePaymentType} leave balance`);
            return;
        }
        if (overlapError) {
            setError('Selected dates overlap with an existing leave request');
            return;
        }
        try {
            const leaveRequest = {
                userId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                leaveCategory: formData.leaveCategory,
                leavePaymentType: formData.leavePaymentType,
                reason: formData.reason,
                days: daysRequested,
                status: 'pending',
                submittedAt: new Date().toISOString(),
            };
            await applyLeaveMutation(leaveRequest).unwrap();
            let updatedPaidBalance = paidLeaveBalance;
            let updatedUnpaidBalance = unpaidLeaveBalance;
            if (formData.leavePaymentType === 'paid') {
                updatedPaidBalance = paidLeaveBalance - daysRequested;
                await updateLeaveBalance({
                    userId,
                    type: 'paid',
                    days: daysRequested,
                    currentBalance: updatedPaidBalance,
                }).unwrap();
                setPaidLeaveBalance(updatedPaidBalance);
            }
            else {
                updatedUnpaidBalance = unpaidLeaveBalance - daysRequested;
                await updateLeaveBalance({
                    userId,
                    type: 'unpaid',
                    days: daysRequested,
                    currentBalance: updatedUnpaidBalance,
                }).unwrap();
                setUnpaidLeaveBalance(updatedUnpaidBalance);
            }
            onBalanceUpdate(updatedPaidBalance, updatedUnpaidBalance);
            setSuccessMessage(`Leave application submitted successfully! ${daysRequested} days deducted from ${formData.leavePaymentType} leave.`);
            setTimeout(() => {
                setFormData({
                    startDate: '',
                    endDate: '',
                    leaveCategory: 'Sick',
                    leavePaymentType: 'paid',
                    reason: '',
                });
                onClose();
            }, 1500);
        }
        catch (err) {
            console.error('Failed to submit leave application:', err);
            setError('Failed to submit leave application. Please try again.');
        }
    };
    if (isUserLoading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="apply-leave-container">
            <div className="apply-leave-header">
                <h2>Apply for Leave</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="leave-form">
                <div className="form-group">
                    <label>
                        Start Date
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                    </label>
                </div>

                <div className="form-group">
                    <label>
                        End Date
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required min={formData.startDate || new Date().toISOString().split('T')[0]} />
                    </label>
                    {daysRequested > 0 && (<p className="days-requested">Days requested: {daysRequested}</p>)}
                </div>

                <div className="form-group">
                    <label>
                        Leave Category
                        <select name="leaveCategory" value={formData.leaveCategory} onChange={handleChange} className="leave-select">
                            <option value="Sick">Sick Leave</option>
                            <option value="Vacation">Vacation</option>
                            <option value="Casual">Casual Leave</option>
                        </select>
                    </label>
                </div>

                <div className="form-group">
                    <label>
                        Leave Type
                        <select name="leavePaymentType" value={formData.leavePaymentType} onChange={handleChange} className="leave-select">
                            <option value="paid">Paid ({paidLeaveBalance} days remaining)</option>
                            <option value="unpaid">Unpaid ({unpaidLeaveBalance} days remaining)</option>
                        </select>
                    </label>
                    {balanceError && (<p className="balance-warning">
                        Warning: You're requesting more days than your available balance
                    </p>)}
                </div>

                <div className="form-group">
                    <label>
                        Reason
                        <textarea name="reason" value={formData.reason} onChange={handleChange} required rows={4} placeholder="Please provide a reason for your leave" />
                    </label>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={balanceError}>
                        Submit Leave Request
                    </button>
                </div>
            </form>

            {error && (<div className="error-message">
                <p>{error}</p>
            </div>)}

            {successMessage && (<div className="success-message">
                <p>{successMessage}</p>
            </div>)}
        </div>);
};
export default ApplyLeave;
