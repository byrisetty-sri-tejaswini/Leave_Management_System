// src/components/EmployeeForm.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/EmpForm.css';

interface User {
  id: string;
  name: string;
  role: 'employee' | 'manager';
  leaves: number;
  email: string;
  password: string;
  reportsTo?: string;
}

interface EmployeeFormProps {
  onClose: () => void;
  onSubmit: (user: any) => Promise<void>; 
  userToEdit?: any;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onClose,
  onSubmit,
  userToEdit = null,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'employee' | 'manager'>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reportsTo, setReportsTo] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setRole(userToEdit.role);
      setEmail(userToEdit.email || '');
      setPassword(userToEdit.password || '');
      setReportsTo(userToEdit.reportsto || '');
    } else {
      setName('');
      setRole('employee');
      setEmail('');
      setPassword('');
      setReportsTo('');
    }
  }, [userToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedEmployee: User = userToEdit
      ? { ...userToEdit, name: name.trim(), role, email, password }
      : {
          id: Date.now().toString(),
          name: name.trim(),
          role,
          leaves: 0,
          email,
          password,
          paidLeaveBalance: 10,
          unpaidLeaveBalance: 10,
        };

    onSubmit(updatedEmployee);
    onClose();
  };

  return (
    <div className="employee-form">
      <div className="editing">
        <h2>{userToEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Role:
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'employee' | 'manager')}
          >
            <option value="employee">Employee</option>
            <option value="hr">hr</option>
            <option value="manager">Manager</option> 
          </select>
        </label>
        <button type="submit">{userToEdit ? 'Update Employee' : 'Add Employee'}</button>
        <button
          type="button"
          onClick={onClose}
          style={{ marginLeft: '10px' }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;
