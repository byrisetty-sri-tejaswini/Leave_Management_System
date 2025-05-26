import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import HRDashboard from './components/HRDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.JSX.Element; requireRole?: 'hr' | 'manager' }> = ({ children, requireRole }) => {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }
    if (requireRole && user?.role !== requireRole) {
        return <Navigate to="/employee-dashboard" replace />;
    }
    return children;
};

const App = () => {
    return (
        <div className="root">
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/employee-dashboard"
                        element={
                            <ProtectedRoute>
                                <EmployeeDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/hr-dashboard"
                        element={
                            <ProtectedRoute requireRole="hr">
                                <HRDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manager-dashboard"
                        element={
                            <ProtectedRoute requireRole="manager">
                                <ManagerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </div>
    );
};

export default App;