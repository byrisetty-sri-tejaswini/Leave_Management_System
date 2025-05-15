// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { LeaveProvider } from './subcomponents/LeaveContext';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const App = () => {
    return (
        <LeaveProvider>
            <div className="root">
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </div>
        </LeaveProvider>
    );
};

export default App;
