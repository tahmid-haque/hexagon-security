import MFAService from "hexagon-frontend/src/services/MFAService";
import { authenticationAPI } from "./authenticationAPI";
import { Account, client, cryptoService } from "./serviceUtils";

//mfa api module
export const mfaAPI = (function () {
    const module = {
        /**
         * Creates a new MFA key with the given information.
         * @param account
         * @param url
         * @param username
         * @param seed
         */
        createMFA: async (
            account: Account,
            url: string,
            username: string,
            seed: string
        ) => {
            try {
                const mfaService = new MFAService(
                    cryptoService,
                    account,
                    client
                );

                await mfaService.createMFA(url, username, seed);
            } catch (err) {
                if (err.status === 409)
                    throw "MFA key already exists for account.";
                if (err.status === 401) authenticationAPI.updateToken();
                throw "Unable to create MFA key. Try again later.";
            }
        },
    };
    return module;
})();
