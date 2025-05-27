import React from 'react';
import { useFetchUserByIdQuery } from '../../services/userService';
import type { User } from '../../types';
interface EmployeeFetcherProps {
    employeeId: string;
    children: (props: {
        employee?: User;
        isLoading: boolean;
        isError: boolean;
    }) => React.ReactElement;
}
/**
* @description EmployeeFetcher component for fetching employee data by ID.
* It uses RTK Query to fetch the employee's data and provides it to its children as a render prop.
* @component
* @param {EmployeeFetcherProps} props - The properties for the EmployeeFetcher component.
* @property {string} props.employeeId - The ID of the employee to fetch.
* @property {Function} props.children - A render prop function that receives the employee data, loading state, and error state.
* @returns {JSX.Element} The rendered EmployeeFetcher component.
*/
const EmployeeFetcher: React.FC<EmployeeFetcherProps> = ({ employeeId, children }) => {
    const { data: employee, isLoading, isError } = useFetchUserByIdQuery(employeeId, { skip: !employeeId });
    return children({ employee, isLoading, isError });
};
export default EmployeeFetcher;
