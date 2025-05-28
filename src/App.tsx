import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import EmployeeDashboard from './components/employeeDashboard';
import HRDashboard from './components/hrDashboard';
import ManagerDashboard from './components/managerDashboard';
import './App.css';
/**
* @description ProtectedRoute component to restrict access based on user role.
* It checks if the user is logged in and has the required role to access certain routes.
* If the user is not logged in, it redirects to the login page.
* If the user does not have the required role, it redirects to the employee dashboard.
* 
* @param {{ children, requireRole }} - The properties for the ProtectedRoute component.
* @property {React.JSX.Element} children - The child components to render if access is allowed.
* @property {string} [requireRole] - The required role to access the route (e.g., 'hr' or 'manager').
* @returns {React.JSX.Element} The rendered ProtectedRoute component or a redirect to the login or employee dashboard.
*/
const ProtectedRoute: React.FC<{
    children: React.JSX.Element;
    requireRole?: 'hr' | 'manager';
}> = ({ children, requireRole }) => {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!userStr) {
        return <Navigate to="/login" replace/>;
    }
    if (requireRole && user?.role !== requireRole) {
        return <Navigate to="/employee-dashboard" replace/>;
    }
    return children;
};
/**
* @description Press Your { Function App } Description
* @returns {void}
*/
const App = () => {
    return (<div className="root">
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />}/>
                    <Route path="/employee-dashboard" element={<ProtectedRoute>
                                <EmployeeDashboard />
                            </ProtectedRoute>}/>
                    <Route path="/hr-dashboard" element={<ProtectedRoute requireRole="hr">
                                <HRDashboard />
                            </ProtectedRoute>}/>
                    <Route path="/manager-dashboard" element={<ProtectedRoute requireRole="manager">
                                <ManagerDashboard />
                            </ProtectedRoute>}/>
                    <Route path="*" element={<Navigate to="/login" replace/>}/>
                </Routes>
            </Router>
        </div>);
};
export default App;
