import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Account = {
    email: string;
    masterKey: string;
    jwt: string;
};

const accountSlice = createSlice({
    name: 'account',

    initialState: {
        email: '',
        masterKey: '',
        jwt: '',
    } as Account,
    reducers: {
        updateAccount(_state, action: PayloadAction<Account>) {
            return action.payload;
        },
        updateEmail(state, action: PayloadAction<{ email: string }>) {
            state.email = action.payload.email;
        },
    },
});

export const { updateAccount, updateEmail } = accountSlice.actions;
export default accountSlice.reducer;
