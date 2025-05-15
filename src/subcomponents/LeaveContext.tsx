// src/context/LeaveContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LeaveContextType {
    paidLeaveBalance: number;
    unpaidLeaveBalance: number;
    applyLeave: (type: 'paid' | 'unpaid', days: number) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [paidLeaveBalance, setPaidLeaveBalance] = useState<number>(20);
    const [unpaidLeaveBalance, setUnpaidLeaveBalance] = useState<number>(20);

    useEffect(() => {
        const storedPaidBalance = sessionStorage.getItem('paidLeaveBalance');
        const storedUnpaidBalance = sessionStorage.getItem('unpaidLeaveBalance');
        if (storedPaidBalance) setPaidLeaveBalance(Number(storedPaidBalance));
        if (storedUnpaidBalance) setUnpaidLeaveBalance(Number(storedUnpaidBalance));
    }, []);

    useEffect(() => {
        sessionStorage.setItem('paidLeaveBalance', paidLeaveBalance.toString());
        sessionStorage.setItem('unpaidLeaveBalance', unpaidLeaveBalance.toString());
    }, [paidLeaveBalance, unpaidLeaveBalance]);

    const applyLeave = (type: 'paid' | 'unpaid', days: number) => {
        if (type === 'paid' && days <= paidLeaveBalance) {
            setPaidLeaveBalance(prev => prev - days);
        } else if (type === 'unpaid' && days <= unpaidLeaveBalance) {
            setUnpaidLeaveBalance(prev => prev - days);
        } else {
            alert('Insufficient leave balance');
        }
    };

    return (
        <LeaveContext.Provider value={{ paidLeaveBalance, unpaidLeaveBalance, applyLeave }}>
            {children}
        </LeaveContext.Provider>
    );
};

export const useLeave = () => {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeave must be used within a LeaveProvider');
    }
    return context;
};

export default LeaveContext;
