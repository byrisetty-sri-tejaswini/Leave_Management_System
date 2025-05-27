import React, { useEffect, useState } from 'react';
import { useFetchUsersQuery } from '../../services/userService'; // Import RTK Query hook
import '../../styles/RoleAssignment.css';
interface User {
    id: string;
    name: string;
    role: string;
}
interface RoleAssignmentProps {
    employee: User;
    onClose: () => void;
    onAssign: (employeeId: string, managerId: string) => void;
}
/**
* @description RoleAssignment component for assigning a manager to an employee.
* It allows HR to select a manager from a list of users and assign them to an employee.
* @component
* @example
* return (
*   <RoleAssignment
*     employee={selectedEmployee}
*     onClose={handleClose}
*     onAssign={handleAssignManager}
*   />
* );
* @property {Function} useFetchUsersQuery - Hook to fetch users from the server.
* @property {boolean} isLoading - State indicating if the users are currently being loaded.
* @property {boolean} isError - State indicating if there was an error fetching users.
* @property {Function} setSelectedManagerId - Function to set the selected manager's ID.
* @property {string | null} selectedManagerId - State to hold the ID of the selected manager.
* @property {Array<User>} managers - Filtered array of users with the role of 'manager'.
* @property {JSX.Element} loading - Loading state while fetching users.
* @property {JSX.Element} error - Error state if there was an issue fetching users.
* @property {JSX.Element} roleAssignmentForm - Form for assigning a manager to the employee.
* @param {RoleAssignmentProps} props - The properties for the RoleAssignment component.
* @property {User} props.employee - The employee object to whom a manager is being assigned.
* @property {Function} props.onClose - Function to close the role assignment modal.
* @property {Function} props.onAssign - Function to handle the assignment of a manager to the employee.
* @property {Array<User>} props.allUsers - Array of all users fetched from the server.
* @returns {JSX.Element} The rendered RoleAssignment component.
*/

const RoleAssignment: React.FC<RoleAssignmentProps> = ({ employee, onClose, onAssign }) => {
    const { data: allUsers = [], isLoading, isError } = useFetchUsersQuery(); // Fetch users using RTK Query
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    // Filter managers from the fetched users
    const managers = allUsers.filter(user => user.role === 'manager');
    const handleAssign = () => {
        if (selectedManagerId) {
            onAssign(employee.id, selectedManagerId);
            onClose();
        }
        else {
            alert('Please select a manager to assign.');
        }
    };
    if (isLoading) {
        return <div>Loading managers...</div>;
    }
    if (isError) {
        return <div>Error loading managers.</div>;
    }
    return (<div className="role-assignment">
            <h2>Assign Manager to {employee.name}</h2>
            <label>
                Select Manager:
                <select value={selectedManagerId || ''} onChange={(e) => setSelectedManagerId(e.target.value)}>
                    <option value="">Select a manager</option>
                    {managers.map(manager => (<option key={manager.id} value={manager.id}>
                            {manager.name}
                        </option>))}
                </select>
            </label>
            <button onClick={handleAssign}>Assign Manager</button>
            <button onClick={onClose}>Cancel</button>
        </div>);
};
export default RoleAssignment;
