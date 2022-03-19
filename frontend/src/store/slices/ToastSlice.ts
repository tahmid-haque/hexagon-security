import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Toast = {
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
};

const toastSlice = createSlice({
    name: 'toast',

    initialState: {
        toast: {
            message: '',
            severity: 'error',
        } as Toast,
    },
    reducers: {
        sendToast(state, action: PayloadAction<Toast>) {
            state.toast = action.payload;
        },
    },
});

export const { sendToast } = toastSlice.actions;
export default toastSlice.reducer;
