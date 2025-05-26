// src/types.ts
export interface User {
    email: string;
    password: string;
    role: 'employee' | 'manager' | 'hr';
    id: string;
    name: string;
    reports: string;
    paidLeaveBalance: number;
    unpaidLeaveBalance: number;
}

export interface Leave {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    leaveCategory: string;
    leavePaymentType: 'paid' | 'unpaid';
    userId: string;
    days: number;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}
