import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum DashboardEvent {
    CREATE_CLICK,
    NO_EVENT,
}

const dashboardSlice = createSlice({
    name: 'dashboard',

    initialState: DashboardEvent.NO_EVENT,
    reducers: {
        createEvent(_state, action: PayloadAction<DashboardEvent>) {
            return action.payload;
        },
        clearEvent(_state) {
            return DashboardEvent.NO_EVENT;
        },
    },
});

export const { createEvent, clearEvent } = dashboardSlice.actions;
export default dashboardSlice.reducer;
