import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum Display {
    CREDENTIALS = 'Credentials',
    MFA = 'Multi-Factor Authentication',
    NOTES = 'Notes',
}

const displaySlice = createSlice({
    name: 'display',

    initialState: Display.CREDENTIALS,
    reducers: {
        setDisplay(_state, action: PayloadAction<Display>) {
            return action.payload;
        },
    },
});

export const { setDisplay } = displaySlice.actions;
export default displaySlice.reducer;
