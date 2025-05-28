import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './employeeDashboard';
import ManagerDashboard from './managerDashboard';
import HRDashboard from './hrDashboard';
interface DashboardProps {
    userId: string | null; // Pass userId as a prop 
}
/**
* @description Navigates to the User's dashboard based on their role.
* @param {DashboardProps} props - The properties for the Dashboard component.
* @returns Users dashboard component based on their role.
*/
const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
    const navigate = useNavigate();
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);
    if (!user)
        return null;
    switch ((user.role).toLowerCase()) {
        case 'employee':
            return <EmployeeDashboard />;
        case 'manager':
            return <ManagerDashboard />;
        case 'hr':
            return <HRDashboard />;
        default:
            navigate('/login');
            return null;
    }
};
export default Dashboard;
