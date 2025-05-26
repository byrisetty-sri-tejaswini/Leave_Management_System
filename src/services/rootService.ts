import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const rootService = createApi({
    reducerPath: "rootService",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000" }),
    tagTypes: ['Leaves', 'Users'],
    endpoints: () => ({})
})