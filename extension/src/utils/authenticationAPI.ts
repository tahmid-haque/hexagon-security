import parser from "hexagon-shared/utils/parser";
import AccountService from "hexagon-frontend/src/services/AccountService";
import { credentialsAPI } from "./credentialsAPI";

//authentication api module
export const authenticationAPI = (function () {
    // from https://stackoverflow.com/questions/18371339/how-to-retrieve-name-from-email-address
    /**
     * Extract a name from an email.
     * @param email
     * @returns the name from an email
     */
    const extractName = (email: string) => {
        return email.match(/^.+(?=@)/)[0];
    };

    const accountService = new AccountService("https://hexagon-web.xyz");

    const module = {
        /**
         * Sign user in to account using their username and password. Store user info and token in
         * storage to use when making other api calls.
         * @param email
         * @param password
         */
        signIn: async (email: string, password: string) => {
            try {
                const { masterKey, jwt } =
                    await accountService.authenticateUser(
                        email,
                        password,
                        false
                    );

                chrome.storage.local.set({
                    hexagonAccount: {
                        username: extractName(email),
                        email: email,
                        password: password,
                        token: jwt,
                        key: masterKey,
                    },
                });
            } catch {
                chrome.storage.local.clear();
            }
        },

        /**
         * Sign the user out of their account using their token. The token gets blacklisted.
         * @param token
         */
        signOut: async (token: string) => {
            try {
                await accountService.signOut(token);
            } catch {
                throw "Unable to sign you out right now";
            }
        },

        /**
         * Log the user back in with a new token once the old one expires.
         */
        updateToken: async () => {
            chrome.storage.local.get(
                ["hexagonAccount"],
                async function (result) {
                    if (result.hexagonAccount) {
                        module.signIn(
                            result.hexagonAccount.email,
                            result.hexagonAccount.password
                        );
                    } else chrome.storage.local.clear();
                }
            );
        },
    };

    return module;
})();
