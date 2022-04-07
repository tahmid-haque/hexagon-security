import CredentialService from "hexagon-frontend/src/services/CredentialService";
import CryptoService from "hexagon-shared/services/CryptoService";
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
                throw "Unable to create credential";
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
                throw "Unable to delete credential";
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
                throw "Unable to update credential";
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
                throw "Unable to check credential right now";
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
                throw "Unable to fetch credentials right now";
            }
        },
    };
    return module;
})();
