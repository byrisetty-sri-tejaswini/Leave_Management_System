// src/apiSlice.ts
import type { User } from '../types';
import { rootService } from './rootService';

export const apiSlice = rootService.injectEndpoints({
    endpoints: (builder) => ({
        fetchUsers: builder.query<User[], void>({
            query: () => '/users', 
            
        }),
        validateUser: builder.query<User | null, { email: string; password: string }>({
            query: ({ email, password }) => ({
                url: '/users',
                method: 'GET',
                params: { email, password },
            }),
            transformResponse: (response: User[], meta, arg) => {
                return response.find(user => user.email === arg.email && user.password === arg.password) || null;
            },
        }),
        fetchLeaveData: builder.query<{ paidLeaveBalance: number; unpaidLeaveBalance: number }, string>({
            query: (userId) => `/users${userId}`,
        }),
        // apiSlice.ts
        updateLeaveBalance: builder.mutation<User, { userId: string; type: 'paid' | 'unpaid'; days: number; currentBalance: number }>({
            query: ({ userId, type, days, currentBalance }) => {
        
                const newBalance = currentBalance;
                return {
                    url: `/users/${userId}`,
                    method: 'PATCH',
                    body: {
                        [type === 'paid' ? 'paidLeaveBalance' : 'unpaidLeaveBalance']: newBalance
                    },
                };
            },
        }),
        addUser: builder.mutation<User, Partial<User>>({
            query: (user) => ({
                url: '/users',
                method: 'POST',
                body: user,
            }),
        }),
        updateUser: builder.mutation<User, { id: string; user: Partial<User> }>({
            query: ({ id, user }) => ({
                url: `/users/${id}`,
                method: 'PATCH',
                body: user,
            }),
        }),
        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
        }),
        fetchUserById: builder.query<User, string>({
            query: (id) => `/users/${id}`,
        }),
        
    }),
});

// Export hooks for usage in functional components
export const {
    useFetchUsersQuery,
    useValidateUserQuery,
    useFetchLeaveDataQuery,
    useUpdateLeaveBalanceMutation,
    useAddUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useFetchUserByIdQuery,
} = apiSlice;

// Export the API slice reducer
export default apiSlice.reducer;
