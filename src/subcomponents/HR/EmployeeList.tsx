import React from 'react';
import '../../styles/EmpList.css';
import Table from '../../components/table'; 

interface User {
    id: string;
    name: string;
    role: string;
    email?: string;
    reports?: string;
}

export interface EmployeeListProps {
    users: User[];
    selectedUserId: string | null;
    onUserClick: (user: User) => void;
}

/**
* @description EmployeeList component for displaying a list of users.
* It allows managers to view their team members and select a user for further actions.
* @component
* @example
* return (
*  <EmployeeList
*   users={users}
*  selectedUserId={selectedUserId}
*  onUserClick={handleUserClick}
* />
* * @returns {JSX.Element} - The rendered EmployeeList component.
*/

const EmployeeList: React.FC<EmployeeListProps> = ({ users, onUserClick, selectedUserId }) => {
    const columns = [
        { header: 'Name', accessor: (row: unknown) => (row as User).name },
        { header: 'Role', accessor: (row: unknown) => (row as User).role },
        { header: 'Email', accessor: (row: unknown) => (row as User).email ?? '' },
        { header: 'Reports to', accessor: (row: unknown) => (row as User).reports ?? '' },
    ];

    return (
        <div className="employee-list">
            <h2>User List</h2>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <Table
                    columns={columns}
                    rows={users}
                    emptyMessage="No users found."
                    rowClassName={(row: User) => (row.id === selectedUserId ? 'selected-row' : '')}
                    onRowClick={onUserClick}
                />
            )}
        </div>
    );
};

export default EmployeeList;