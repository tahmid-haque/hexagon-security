import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import toastReducer from './slices/ToastSlice';
import accountReducer from './slices/AccountSlice';
export const store = configureStore({
    reducer: {
        toast: toastReducer,
        account: accountReducer,
    },
});

type AppDispatch = typeof store.dispatch;
type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
