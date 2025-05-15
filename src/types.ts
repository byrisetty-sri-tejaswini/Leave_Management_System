// src/types.ts
export interface User {
    email: string;
    password: string;
    role: 'employee' | 'manager' | 'hr';
    id: string;
}
