import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Toast = {
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
};

const toastSlice = createSlice({
    name: 'toast',

    initialState: [] as Toast[],
    reducers: {
        sendToast(state: Toast[], action: PayloadAction<Toast>) {
            return [...state, action.payload];
        },
        consumeToast(state: Toast[]) {
            return state.slice(1);
        },
    },
});

export const { sendToast, consumeToast } = toastSlice.actions;
export default toastSlice.reducer;
