import React, { useState } from 'react';
import axios from 'axios';
import { useLeave } from './LeaveContext';
import '../styles/ApplyLeave.css';

interface ApplyLeaveProps {
  onClose: () => void;
}

const ApplyLeave: React.FC<ApplyLeaveProps> = ({ onClose }) => {
    const { applyLeave } = useLeave();
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [leaveCategory, setLeaveCategory] = useState<string>('Sick');
    const [leavePaymentType, setLeavePaymentType] = useState<'paid' | 'unpaid'>('paid');
    const [reason, setReason] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const calculateLeaveDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const daysRequested = calculateLeaveDays();
        if (daysRequested <= 0) {
            setError('Please select valid dates');
            return;
        }

        try {
            // First update the local state
            applyLeave(leavePaymentType, daysRequested);
            
            // Then try to submit to backend
            try {
                const response = await axios.post('/api/leaves', {
                    userId: 'user123',
                    startDate,
                    endDate,
                    leaveCategory,
                    leavePaymentType,
                    reason,
                    days: daysRequested
                }, {
                    baseURL: 'http://localhost:5000',
                    timeout: 5000
                });
                
                console.log('Leave application submitted:', response.data);
                setSuccessMessage(`Leave application submitted successfully! ${daysRequested} days deducted from ${leavePaymentType} leave.`);
                
                // Clear form
                setStartDate('');
                setEndDate('');
                setReason('');
                setError('');
            } catch (backendError) {
                console.warn('Backend submission failed, but leave was applied locally', backendError);
                setSuccessMessage(`Leave applied locally (${daysRequested} ${leavePaymentType} days). Note: Could not reach server.`);
                setError('');
            }
        } catch (err) {
            let errorMessage = 'Failed to apply leave';
            if (err instanceof Error) {
                errorMessage = err.message.includes('Insufficient') 
                    ? err.message 
                    : 'An error occurred while processing your leave request';
            }
            setError(errorMessage);
            setSuccessMessage('');
            console.error('Error applying leave:', err);
        }
    };

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
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            required 
                            min={new Date().toISOString().split('T')[0]} // Prevent past dates
                        />
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        End Date
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            required 
                            min={startDate || new Date().toISOString().split('T')[0]} // Must be after start date
                        />
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        Leave Category
                        <select 
                            value={leaveCategory} 
                            onChange={(e) => setLeaveCategory(e.target.value)}
                            className="leave-select"
                        >
                            <option value="Sick">Sick Leave</option>
                            <option value="Vacation">Vacation</option>
                            <option value="Casual">Casual Leave</option>
                        </select>
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        Leave Type
                        <select 
                            value={leavePaymentType} 
                            onChange={(e) => setLeavePaymentType(e.target.value as 'paid' | 'unpaid')}
                            className="leave-select"
                        >
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        Reason
                        <textarea 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)} 
                            required 
                            rows={4}
                            placeholder="Please provide a reason for your leave"
                        />
                    </label>
                </div>
                
                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        Submit Application
                    </button>
                </div>
            </form>
            
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    {error.includes('Insufficient') && (
                        <p>Please select a different payment type or adjust your dates</p>
                    )}
                </div>
            )}
            {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
    );
};

export default ApplyLeave;