import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const locationSlice = createSlice({
    name: 'location',

    initialState: '',
    reducers: {
        saveNextLocation(state, action: PayloadAction<string>) {
            return action.payload;
        },

        clearNextLocation() {
            return '';
        },
    },
});

export const { saveNextLocation, clearNextLocation } = locationSlice.actions;
export default locationSlice.reducer;
