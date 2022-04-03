import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DashboardEvent = {
    type: DashboardEventType;
    param?: any;
};

export enum DashboardEventType {
    CREATE_CLICK,
    DELETE_CLICK,
    EDIT_CLICK,
    SHARE_CLICK,
    RERENDER_DATA,
    SETTINGS_CLICK,
    SIGNOUT,
    NO_EVENT,
}

const initState = {
    type: DashboardEventType.NO_EVENT,
    param: null,
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
