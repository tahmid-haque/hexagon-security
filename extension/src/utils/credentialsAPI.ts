import CredentialService from "hexagon-frontend/src/services/CredentialService";
import { authenticationAPI } from "./authenticationAPI";
import { Credential } from "../contentScript/contentScript";
import { Account, client, cryptoService } from "./serviceUtils";

export const credentialsAPI = (function () {
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
                await credentialService
                    .updateCredential(id, url, username, password, key)
                    .then(() => console.log("credential updated"));
            } catch (err) {
                if (err.status === 401) authenticationAPI.updateToken();
                throw "Unable to update credential. Try again later.";
            }
        },

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
