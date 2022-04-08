import CredentialService from "hexagon-frontend/src/services/CredentialService";
import { authenticationAPI } from "./authenticationAPI";
import { Credential } from "../contentScript/contentScript";
import { Account, client, cryptoService } from "./serviceUtils";

//credentials api module
export const credentialsAPI = (function () {
    /**
     * Creates and returns a Credentials object with the given information.
     * @param id
     * @param username
     * @param password
     * @param url
     * @param key
     * @returns a Credentials object
     */
    const newCredential = (id, username, password, url, key): Credential => {
        return {
            id: id,
            username: username,
            password: password,
            url: url,
            key: key,
        };
    };

    const module = {
        /**
         * Creates a new credential.
         * @param account
         * @param url
         * @param username
         * @param password
         */
        createCredential: async (account: Account, url, username, password) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                await credentialService.createCredential(
                    url,
                    username,
                    password
                );
            } catch (err) {
                if (err.status === 401) authenticationAPI.updateToken();
                throw "Unable to create credential. Try again later.";
            }
        },

        /**
         * Deletes a credential.
         * @param account
         * @param id
         */
        deleteCredential: async (account: Account, id) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                await credentialService.deleteCredential(id);
            } catch (err) {
                if (err.status === 401) authenticationAPI.updateToken();
                throw "Unable to delete credential. Try again later.";
            }
        },

        /**
         * Updates a credential.
         * @param account
         * @param id
         * @param url
         * @param username
         * @param password
         * @param key
         */
        updateCredential: async (
            account: Account,
            id,
            url,
            username,
            password,
            key
        ) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                await credentialService.updateCredential(
                    id,
                    url,
                    username,
                    password,
                    key
                );
            } catch (err) {
                if (err.status === 401) authenticationAPI.updateToken();
                throw "Unable to update credential. Try again later.";
            }
        },

        /**
         * Checks if a credential already exists.
         * @param account
         * @param url
         * @param username
         * @returns the credential if it it exists
         */
        checkCredentialExists: async (account: Account, url, username) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                return await credentialService.checkCredentialExists(
                    url,
                    username
                );
            } catch (err) {
                if (err.status === 401) authenticationAPI.updateToken();
                throw "Unable to check credential right now. Try again later.";
            }
        },

        /**
         * Retrieves user's saved credentials for a specified website.
         * @param account
         * @param url
         * @returns the credentials for the website
         */
        getWebsiteCredentials: async (account: Account, url) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );

                let creds = await credentialService.getWebsiteCredentials(url);
                return creds.map((cred) =>
                    newCredential(
                        cred.id,
                        cred.user,
                        cred.password,
                        cred.name,
                        cred.key
                    )
                );
            } catch (err) {
                if (err.status === 401) authenticationAPI.updateToken();
                throw "Unable to fetch credentials right now. Try again later.";
            }
        },
    };
    return module;
})();
