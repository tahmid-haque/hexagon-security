import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Account = {
    email: string;
    masterKey: string;
    jwt: string;
};

const initialState = {
    email: '',
    masterKey: '',
    jwt: '',
} as Account;

const accountSlice = createSlice({
    name: 'account',

    initialState: { ...initialState },
    reducers: {
        updateAccount(_state, action: PayloadAction<Account>) {
            return action.payload;
        },
        clearAccount(_state) {
            return { ...initialState };
        },
        updateEmail(state, action: PayloadAction<{ email: string }>) {
            state.email = action.payload.email;
        },
    },
});

export const { updateAccount, updateEmail, clearAccount } =
    accountSlice.actions;
export default accountSlice.reducer;
