import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Toast = {
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
    isOpen: boolean;
};

const toastSlice = createSlice({
    name: 'toast',

    initialState: {
        message: '',
        severity: 'error',
        isOpen: false,
    } as Toast,
    reducers: {
        sendToast(state, action: PayloadAction<Partial<Toast>>) {
            return {
                ...state,
                ...action.payload,
                isOpen: action.payload.isOpen ?? true,
            };
        },
    },
});

export const { sendToast } = toastSlice.actions;
export default toastSlice.reducer;
