import React from 'react';
import { useFetchUserByIdQuery } from '../../services/userService';
import type { User } from '../../types';

interface EmployeeFetcherProps {
    employeeId: string;
    children: (props: { employee?: User; isLoading: boolean; isError: boolean }) => React.ReactElement;
}

const EmployeeFetcher: React.FC<EmployeeFetcherProps> = ({ employeeId, children }) => {
    const { data: employee, isLoading, isError } = useFetchUserByIdQuery(employeeId, { skip: !employeeId });

    return children({ employee, isLoading, isError });
};

export default EmployeeFetcher;