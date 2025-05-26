import React from 'react';
import '../../styles/EmpList.css';

interface User {
    id: string;
    name: string;
    role: string;
}

export interface EmployeeListProps {
    users: any[];
    selectedUserId: any;
    onUserClick: (user: any) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
    users,
    onUserClick,
    selectedUserId,
}) => {

    const handleClick = (user: User) => {
        if (onUserClick) {
            onUserClick(user);
        }
    };

    return (
        <div className="employee-list">
            <h2>User List</h2>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Reports to</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                onClick={() => handleClick(user)}
                                className={selectedUserId === user.id ? 'selected' : ''}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{user.name}</td>
                                <td>{user.role}</td>
                                <td>{user.email}</td>
                                <td>{user.reports}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default EmployeeList;
