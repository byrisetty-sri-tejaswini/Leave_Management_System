import React from 'react';
import '../../styles/LeaveSummary.css';
// Define the Employee type here or import it from the correct file
interface Employee {
    name: string;
    role: string;
    leaves: number;
}
interface Props {
    employee: Employee;
}
/**
* @description LeaveSummary component for displaying an employee's leave summary.
* It shows the employee's name, role, and number of leaves taken.
* @component
* @example
* return (
*   <LeaveSummary employee={{ name: 'John Doe', role: 'Software Engineer', leaves: 5 }} />
* );
* @property {Employee} employee - The employee object containing name, role, and leaves.
* @property {string} employee.name - The name of the employee.
* @property {string} employee.role - The role of the employee (e.g., 'Software Engineer').
* @property {number} employee.leaves - The number of leaves taken by the employee.
* @param {Props} props - The properties for the LeaveSummary component.
* @returns {JSX.Element} The rendered LeaveSummary component.
*/
const LeaveSummary: React.FC<Props> = ({ employee }) => {
    return (<div className="leave-summary">
      <h2>{employee.name}'s Leave Summary</h2>
      <p><strong>Role:</strong> {employee.role}</p>
      <p><strong>Leaves Taken:</strong> {employee.leaves}</p>
      {/* Add more details if needed */}
    </div>);
};
export default LeaveSummary;
