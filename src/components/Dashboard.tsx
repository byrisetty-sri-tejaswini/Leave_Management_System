import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HRDashboard from './HRDashboard';

const Dashboard = () => {
    const navigate = useNavigate();

    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null; 

    switch (user.role) {
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



