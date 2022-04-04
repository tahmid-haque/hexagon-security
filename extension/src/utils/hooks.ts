import { useEffect, useState } from 'react';

export const useComponentState = <T>(initialState: T) => {
    const [state, setState] = useState({
        ...initialState,
    });
    const [isMounted, setIsMounted] = useState(true);

    const update = (update: Partial<T>) => {
        if (!isMounted) return;
        setState((state) => {
            return { ...state, ...update };
        });
    };

    useEffect(() => () => setIsMounted(false), []);

    return { state, update };
};
