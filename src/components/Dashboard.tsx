import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HRDashboard from './HRDashboard';

interface DashboardProps {
    userId: string | null; // Pass userId as a prop 
}

const Dashboard: React.FC<DashboardProps> = ({userId}) => {
    const navigate = useNavigate();

    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null; 

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



