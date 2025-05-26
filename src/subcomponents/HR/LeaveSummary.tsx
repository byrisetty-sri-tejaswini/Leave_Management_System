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

const LeaveSummary: React.FC<Props> = ({ employee }) => {
  return (
    <div className="leave-summary">
      <h2>{employee.name}'s Leave Summary</h2>
      <p><strong>Role:</strong> {employee.role}</p>
      <p><strong>Leaves Taken:</strong> {employee.leaves}</p>
      {/* Add more details if needed */}
    </div>
  );
};

export default LeaveSummary;
