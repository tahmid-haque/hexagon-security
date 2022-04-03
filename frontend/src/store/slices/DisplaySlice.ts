import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum Display {
    CREDENTIALS = 'Credentials',
    MFA = 'Multi-Factor Authentication',
    NOTES = 'Notes',
    NONE = 'Hexagon',
}

const displaySlice = createSlice({
    name: 'display',

    initialState: Display.NONE,
    reducers: {
        setDisplay(_state, action: PayloadAction<Display>) {
            return action.payload;
        },
    },
});

export const { setDisplay } = displaySlice.actions;
export default displaySlice.reducer;
