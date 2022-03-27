import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DashboardEvent = {
    type: DashboardEventType;
    param?: string;
};

export enum DashboardEventType {
    CREATE_CLICK,
    DELETE_CLICK,
    EDIT_CLICK,
    SHARE_CLICK,
    NO_EVENT,
}

const initState = {
    type: DashboardEventType.NO_EVENT,
    param: '',
};

const dashboardSlice = createSlice({
    name: 'dashboard',

    initialState: { ...initState },
    reducers: {
        createEvent(state, action: PayloadAction<DashboardEvent>) {
            return { ...state, ...action.payload };
        },
        clearEvent(_state) {
            return { ...initState };
        },
    },
});

export const { createEvent, clearEvent } = dashboardSlice.actions;
export default dashboardSlice.reducer;
