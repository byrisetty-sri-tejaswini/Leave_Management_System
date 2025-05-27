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
/**
* @description EmployeeList component for displaying a list of users.
* It allows HR to view and select users, displaying their details in a table format.
* @component
* @example
* return (
*   <EmployeeList
*     users={users}
*     onUserClick={handleUserClick}
*     selectedUserId={selectedUserId}
*   />
* );
* @property {Array} users - Array of user objects to display in the list.
* @property {Function} onUserClick - Callback function to handle user selection.
* @property {string} selectedUserId - ID of the currently selected user.
* @param {EmployeeListProps} props - The properties for the EmployeeList component.
* @property {Array<User>} users - Array of user objects with properties: id, name, role.
* @property {Function} onUserClick - Function to handle user click events.
* @property {string} selectedUserId - ID of the currently selected user for highlighting.   
* @param {any} {
    users,
    onUserClick,
    selectedUserId,
}
* @returns {JSX.Element} The rendered EmployeeList component.
*/
const EmployeeList: React.FC<EmployeeListProps> = ({ users, onUserClick, selectedUserId, }) => {
    const handleClick = (user: User) => {
        if (onUserClick) {
            onUserClick(user);
        }
    };
    return (<div className="employee-list">
            <h2>User List</h2>
            {users.length === 0 ? (<p>No users found.</p>) : (<table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Reports to</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (<tr key={user.id} onClick={() => handleClick(user)} className={selectedUserId === user.id ? 'selected' : ''} style={{ cursor: 'pointer' }}>
                                <td>{user.name}</td>
                                <td>{user.role}</td>
                                <td>{user.email}</td>
                                <td>{user.reports}</td>
                            </tr>))}
                    </tbody>
                </table>)}
        </div>);
};
export default EmployeeList;
