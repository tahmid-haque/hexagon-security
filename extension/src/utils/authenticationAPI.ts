import parser from "hexagon-shared/utils/parser";
import AccountService from "hexagon-frontend/src/services/AccountService";
import { credentialsAPI } from "./credentialsAPI";

export const authenticationAPI = (function () {
    // from https://stackoverflow.com/questions/18371339/how-to-retrieve-name-from-email-address
    const extractName = (email: string) => {
        return email.match(/^.+(?=@)/)[0];
    };

    const accountService = new AccountService("http://localhost:3000");

    const module = {
        //api call to login and get token
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
    };

    return module;
})();
