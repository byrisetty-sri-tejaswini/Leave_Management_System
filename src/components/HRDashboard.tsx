import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmployeeList from '../subcomponents/HR/EmployeeList';
import EmployeeForm from '../subcomponents/HR/EmployeeForm';
import RoleAssignment from '../subcomponents/HR/RoleAssignment';
import ProfileMenu from './ProfileMenu';
import '../styles/HRDashboard.css';
import LeaveSummary from '../subcomponents/HR/LeaveSummary';
import { useFetchUsersQuery, useAddUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../services/userService';
/**
* @description HRDashboard component for managing employee data.
* It allows HR personnel to view, add, edit, and delete employee records,
* as well as assign managers and view leave summaries.
* @component
* @example
* return (
*   <HRDashboard />
* );
* @property {Function} handleLogout - Function to handle user logout.
* @property {Function} addNewUser - Function to add a new user.
* @property {Function} editUser - Function to edit an existing user.
* @property {Function} removeUser - Function to delete a user.
* @property {Function} handleAssignManager - Function to assign a manager to an employee.
* @property {Function} toggleForm - Function to toggle the visibility of the user form.
* @property {Function} handleUserClick - Function to handle user selection from the list.
* @property {boolean} showForm - State to control the visibility of the user form.
* @property {boolean} showLeaveSummary - State to control the visibility of the leave summary.
* @property {boolean} showRoleAssignment - State to control the visibility of the role assignment form.
* @property {any} selectedUser - State to hold the currently selected user for editing or viewing.
* @property {Array} users - Array of users fetched from the server.
* @property {Function} refetch - Function to refetch the user data.
* @property {boolean} isLoading - State indicating if the user data is currently being loaded.
* @property {boolean} isError - State indicating if there was an error fetching user data.
* @property {Function} useFetchUsersQuery - Hook to fetch users from the server.
* @property {Function} useAddUserMutation - Hook to add a new user.
* @property {Function} useUpdateUserMutation - Hook to update an existing user.
* @property {Function} useDeleteUserMutation - Hook to delete a user.
* @property {Function} useNavigate - Hook to navigate between routes.
* @property {Function} Link - Component to create links to other routes.
* @property {JSX.Element} ProfileMenu - Component for displaying the user profile menu.
* @property {JSX.Element} EmployeeList - Component for displaying the list of employees.
* @property {JSX.Element} EmployeeForm - Component for adding or editing employee details.
* @property {JSX.Element} RoleAssignment - Component for assigning a manager to an employee.
* @property {JSX.Element} LeaveSummary - Component for displaying the leave summary of an employee.
* @property {string} user.id - The ID of the user.
* @property {string} user.name - The name of the user.
* @property {string} user.role - The role of the user (e.g., 'employee', 'manager', 'hr').
* @property {string} user.reportsTo - The ID of the manager to whom the user reports.
* @property {string} user.reports - The ID of the user who is assigned as a manager.
* @property {string} user.email - The email of the user.
* @property {string} user.phone - The phone number of the user.
* @property {string} user.department - The department of the user.
* @property {string} user.joiningDate - The joining date of the user.
* @property {string} user.leaveBalance - The leave balance of the user.
* @property {string} user.leaveHistory - The leave history of the user.
* @property {string} user.profilePicture - The URL of the user's profile picture.
* @property {string} user.address - The address of the user.
* @returns {JSX.Element} - The rendered HRDashboard component.
*/
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
        }
        catch (err) {
            console.error('Failed to add user:', err);
            alert('Failed to add user. Please try again.');
        }
    };
    const editUser = async (userData: any) => {
        if (!selectedUser)
            return;
        try {
            await updateUser({ id: selectedUser.id, user: userData }).unwrap();
            refetch();
            setSelectedUser(null);
            setShowForm(false);
            setShowLeaveSummary(false);
        }
        catch (err) {
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
        }
        catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user. Please try again.');
        }
    };
    const handleAssignManager = async (employeeId: string, managerId: string) => {
        try {
            const currentUser = users.find(u => u.id === employeeId);
            if (!currentUser)
                return;
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
        }
        catch (err) {
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
    return (<div className="hr-dashboard">
            <header className="dashboard-header">
                <nav className="dashboard-nav">
                    <Link to="/employee-dashboard" className="nav-link">My Dashboard</Link>
                    <Link to="/hr-dashboard" className="nav-link active">Employee Data</Link>
                </nav>
                <div className="profile-menu-container">
                    <ProfileMenu onLogout={handleLogout}/>
                </div>
            </header>

            <div className="editing">
                <button id="btn" onClick={toggleForm} style={{ backgroundColor: "green" }}>
                    {showForm ? 'Cancel' : 'Add New User'}

                </button>

                <button id="btn" onClick={() => {
            if (selectedUser) {
                setShowForm(true);
            }
            else {
                alert('Please select a user to edit.');
            }
        }} style={{ backgroundColor: "#f5e834" }}>
                    Edit User
                </button>

                <button id="btn" onClick={() => {
            if (selectedUser) {
                if (window.confirm(`Are you sure you want to remove ${selectedUser.name}?`)) {
                    removeUser(selectedUser.id);
                }
            }
            else {
                alert('Please select a user to remove.');
            }
        }} style={{ backgroundColor: "red" }}>
                    Remove User
                </button>

                <button id="btn" onClick={() => {
            if (selectedUser) {
                setShowRoleAssignment(true);
            }
            else {
                alert('Please select a user to assign a manager.');
            }
        }}>
                    Assign Manager
                </button>
            </div>

            {showForm && (<div className="modal-backdrop">
                    <div className="modal-container">
                        <EmployeeForm onClose={() => setShowForm(false)} onSubmit={selectedUser ? editUser : addNewUser} userToEdit={selectedUser}/>
                    </div>
                </div>)}

            {showRoleAssignment && selectedUser && (<div className="modal-backdrop">
                    <div className="modal-container">
                        <RoleAssignment employee={selectedUser} onClose={() => setShowRoleAssignment(false)} onAssign={handleAssignManager}/>
                    </div>
                </div>)}
        
            <EmployeeList users={users} onUserClick={handleUserClick} selectedUserId={selectedUser ? selectedUser.id : null}/>

            {showLeaveSummary && selectedUser && (<LeaveSummary employee={selectedUser}/>)}
        </div>);
};
export default HRDashboard;
