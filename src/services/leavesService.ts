import type { Leave } from "../types";
import { rootService } from "./rootService";

export const leaveApi = rootService.injectEndpoints({
    endpoints: (builder) => ({
        fetchLeaveData: builder.query({
            query: (userId) => `leaves?userId=${userId}`,
            providesTags: ['Leaves']
        }),
        
        fetchLeaveByIdData: builder.query<Leave, string>({
            query: (leaveId) => `leaves/${leaveId}`,
            providesTags: ['Leaves']
        }),
       
        applyLeave: builder.mutation({
            query: (leaveRequest) => ({
                url: 'leaves',
                method: 'POST',
                body: leaveRequest,
            }),
            transformResponse: (response) => {
                return response; 
            },
        }),

        cancelLeaveRequest: builder.mutation({
            query: ({ id, userId }) => ({
                url: `leaves/${id}`,
                method: 'PATCH', 
                body: { status: "cancelled", userId }, 
            }),
            invalidatesTags: ['Leaves'], 
        }),

        fetchLeaveRequests: builder.query<Leave[], string>({
            query: (managerId) => `/leaves?managerId=${managerId}`,
            providesTags: ['Leaves'],
            transformResponse: (response: Leave[]) => {
                return response;
            },
        }),
        updateLeaveRequest: builder.mutation<Leave, { id: string; status: 'approved' | 'rejected'; processedAt: string }>({
            query: ({ id, status, processedAt }) => ({
                url: `/leaves/${id}`,
                method: 'PATCH',
                body: { status, processedAt },
            }),
            invalidatesTags: ['Leaves'],
        }),
        getTeamLeaveRequests: builder.query<Leave[], string>({
            query: (managerId) => `leaves?managerId=${managerId}`,
            providesTags: ['Leaves'],
            async transformResponse(response: Leave[], meta, arg) {
                const leaveRequests = await Promise.all(
                    response.map(async (leave) => {
                        try {
                            const user = { id: leave.userId, name: 'Unknown' };
                            return {
                                ...leave,
                                employee: {
                                    id: user.id,
                                    name: user.name,
                                },
                            };
                        } catch (error) {
                            console.error(`Failed to fetch user ${leave.userId}:`, error);
                            return {
                                ...leave,
                                employee: {
                                    id: leave.userId,
                                    name: 'Unknown',
                                },
                            };
                        }
                    })
                );
                return leaveRequests;
            },
        }),
        updateLeaveStatus: builder.mutation<Leave, { id: number; status: 'approved' | 'rejected'; managerComment?: string }>({
            query: ({ id, status, managerComment }) => ({
                url: `leaves/${id}`,
                method: 'PATCH',
                body: { status, managerComment },
            }),
            invalidatesTags: ['Leaves'],
        }),
    }),
});

// Export hooks for usage in functional components
export const { useFetchLeaveDataQuery, useFetchLeaveRequestsQuery, useGetTeamLeaveRequestsQuery, useUpdateLeaveStatusMutation, useUpdateLeaveRequestMutation, useFetchLeaveByIdDataQuery, useApplyLeaveMutation, useCancelLeaveRequestMutation } = leaveApi;

// Export the reducer to be included in the store
export default leaveApi.reducer;
