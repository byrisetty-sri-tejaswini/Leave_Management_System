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

const RoleAssignment: React.FC<RoleAssignmentProps> = ({ employee, onClose, onAssign }) => {
    const { data: allUsers = [], isLoading, isError } = useFetchUsersQuery(); // Fetch users using RTK Query
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

    // Filter managers from the fetched users
    const managers = allUsers.filter(user => user.role === 'manager');

    const handleAssign = () => {
        if (selectedManagerId) {
            onAssign(employee.id, selectedManagerId);
            onClose();
        } else {
            alert('Please select a manager to assign.');
        }
    };

    if (isLoading) {
        return <div>Loading managers...</div>;
    }

    if (isError) {
        return <div>Error loading managers.</div>;
    }

    return (
        <div className="role-assignment">
            <h2>Assign Manager to {employee.name}</h2>
            <label>
                Select Manager:
                <select value={selectedManagerId || ''} onChange={(e) => setSelectedManagerId(e.target.value)}>
                    <option value="">Select a manager</option>
                    {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                            {manager.name}
                        </option>
                    ))}
                </select>
            </label>
            <button onClick={handleAssign}>Assign Manager</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

export default RoleAssignment;
