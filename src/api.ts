// src/api.ts
import axios from 'axios';
import type { User } from './types';

const API_URL = 'http://localhost:5000/users'; 

export const fetchUsers = async (): Promise<User[]> => {
    const response = await axios.get<User[]>(API_URL);
    return response.data;
};

// Function to validate user credentials
export const validateUser  = async (email: string, password: string): Promise<User | null> => {
    const users: User[] = await fetchUsers();
    return users.find((user) => user.email === email && user.password === password) || null;
};

