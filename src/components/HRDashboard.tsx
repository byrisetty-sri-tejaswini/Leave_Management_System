import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmployeeList from '../subcomponents/HR/EmployeeList';
import EmployeeForm from '../subcomponents/HR/EmployeeForm';
import RoleAssignment from '../subcomponents/HR/RoleAssignment';
import ProfileMenu from './ProfileMenu';
import '../styles/HRDashboard.css';
import LeaveSummary from '../subcomponents/HR/LeaveSummary';
import {
    useFetchUsersQuery,
    useAddUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation
} from '../services/userService';

const HRDashboard: React.FC = () => {
    const { data: users = [], refetch, isLoading, isError } = useFetchUsersQuery();
    const [addUser, { error: addError }] = useAddUserMutation();
    const [updateUser, { error: updateError }] = useUpdateUserMutation();
    const [deleteUser, { error: deleteError }] = useDeleteUserMutation();
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [showLeaveSummary, setShowLeaveSummary] = useState(false);
    const [showRoleAssignment, setShowRoleAssignment] = useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem('id');
        navigate('/login');
    };

    const addNewUser = async (userData: any) => {
        try {
            await addUser(userData).unwrap();
            refetch();
            setShowForm(false);
        } catch (err) {
            console.error('Failed to add user:', err);
            alert('Failed to add user. Please try again.');
        }
    };

    const editUser = async (userData: any) => {
        if (!selectedUser) return;

        try {
            await updateUser({ id: selectedUser.id, user: userData }).unwrap();
            refetch();
            setSelectedUser(null);
            setShowForm(false);
            setShowLeaveSummary(false);
        } catch (err) {
            console.error('Failed to update user:', err);
            alert('Failed to update user. Please try again.');
        }
    };

    const removeUser = async (userId: string) => {
        try {
            await deleteUser(userId).unwrap();
            refetch();
            if (selectedUser?.id === userId) {
                setSelectedUser(null);
                setShowLeaveSummary(false);
            }
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user. Please try again.');
        }
    };

    const handleAssignManager = async (employeeId: string, managerId: string) => {
        try {
            const currentUser = users.find(u => u.id === employeeId);
            if (!currentUser) return;

            const updatePayload = {
                reports: managerId
            };

            await updateUser({
                id: employeeId,
                user: updatePayload
            }).unwrap();

            refetch();
            setSelectedUser({
                ...currentUser,
                reportsTo: managerId
            });
            setShowRoleAssignment(false);
        } catch (err) {
            console.error('Failed to assign manager:', err);
            alert('Failed to assign manager. Please try again.');
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        setSelectedUser(null); // Reset selected user when toggling form
    };

    const handleUserClick = (user: any) => {
        setSelectedUser(user);
        setShowLeaveSummary(true);
        setShowForm(false);
        setShowRoleAssignment(false);
    };

    return (
        <div className="hr-dashboard">
            <header className="dashboard-header">
                <nav className="dashboard-nav">
                    <Link to="/employee-dashboard" className="nav-link">My Dashboard</Link>
                    <Link to="/hr-dashboard" className="nav-link active">Employee Data</Link>
                </nav>
                <div className="profile-menu-container">
                    <ProfileMenu onLogout={handleLogout} />
                </div>
            </header>

            <div className="editing">
                <button id="btn" onClick={toggleForm} style={{ backgroundColor: "green" }}>
                    {showForm ? 'Cancel' : 'Add New User'}

                </button>

                <button
                    id="btn"
                    onClick={() => {
                        if (selectedUser) {
                            setShowForm(true);
                        } else {
                            alert('Please select a user to edit.');
                        }
                    }}
                    style={{ backgroundColor: "#f5e834" }}
                >
                    Edit User
                </button>

                <button
                    id="btn"
                    onClick={() => {
                        if (selectedUser) {
                            if (window.confirm(`Are you sure you want to remove ${selectedUser.name}?`)) {
                                removeUser(selectedUser.id);
                            }
                        } else {
                            alert('Please select a user to remove.');
                        }
                    }}
                    style={{ backgroundColor: "red" }}
                >
                    Remove User
                </button>

                <button
                    id="btn"
                    onClick={() => {
                        if (selectedUser) {
                            setShowRoleAssignment(true);
                        } else {
                            alert('Please select a user to assign a manager.');
                        }
                    }}
                >
                    Assign Manager
                </button>
            </div>

            {showForm && (
                <div className="modal-backdrop">
                    <div className="modal-container">
                        <EmployeeForm
                            onClose={() => setShowForm(false)}
                            onSubmit={selectedUser ? editUser : addNewUser}
                            userToEdit={selectedUser}
                        />
                    </div>
                </div>
            )}

            {showRoleAssignment && selectedUser && (
                <div className="modal-backdrop">
                    <div className="modal-container">
                        <RoleAssignment
                            employee={selectedUser}
                            onClose={() => setShowRoleAssignment(false)}
                            onAssign={handleAssignManager}
                        />
                    </div>
                </div>
            )}
        
            <EmployeeList
                users={users}
                onUserClick={handleUserClick}
                selectedUserId={selectedUser ? selectedUser.id : null}
            />

            {showLeaveSummary && selectedUser && (
                <LeaveSummary employee={selectedUser} />
            )}
        </div>
    );
};

export default HRDashboard;