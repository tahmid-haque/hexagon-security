import React, { useEffect, useState } from 'react';
import CredentialPassword from '../../credentials/password-field/CredentialPassword';
import totp from 'totp-generator';
import { useAppDispatch } from '../../../store/store';
import { sendToast } from '../../../store/slices/ToastSlice';

/**
 * MFACode component used to show OTPs
 * @param props contains a seed used to generate TOTP tokens and the url of the the MFA
 * @returns a MFACode component
 */
export default function MFACode(props: { seed: string; name: string }) {
    const [code, setCode] = useState(888888);
    const [isMounted, setIsMounted] = useState(true);
    const [isError, setIsError] = useState(false);
    const dispatch = useAppDispatch();

    // update the MFA code every 60 seconds
    const updateCode = () => {
        if (!isMounted || isError) return;
        try {
            setCode(totp(props.seed));
        } catch (error) {
            setIsError(true);
            dispatch(
                sendToast({
                    message: `There were errors in generating tokens for ${props.name}`,
                    severity: 'error',
                })
            );
            return;
        }
        const now = Date.now();
        setTimeout(updateCode, Math.floor((now + 60000) / 60000) * 60000 - now);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(updateCode, []);
    useEffect(() => () => setIsMounted(false), []);
    return (
        <CredentialPassword
            password={!isError ? `${code}` : 'ERROR'}
            shorten={2}
            sx={{ letterSpacing: 2, fontWeight: 'bold' }}
        />
    );
}
