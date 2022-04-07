import CredentialService from "hexagon-frontend/src/services/CredentialService";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import CryptoService from "hexagon-shared/services/CryptoService";
import { Credential } from "../contentScript/contentScript";

export const credentialsAPI = (function () {
    type Account = {
        email: string;
        masterKey: string;
        jwt: string;
    };

    const client = new ApolloClient({
        uri: "http://localhost:3000/api/graphql",
        cache: new InMemoryCache(),
        defaultOptions: {
            query: { fetchPolicy: "no-cache" },
            mutate: { fetchPolicy: "no-cache" },
        },
    });

    const cryptoService = new CryptoService(crypto);

    const newCredential = (id, username, password, url): Credential => {
        return { id: id, username: username, password: password, url: url };
    };

    const module = {
        newCredential: (id, username, password, url): Credential => {
            return { id: id, username: username, password: password, url: url };
        },

        getCount: async (account: Account) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                await credentialService
                    .getCredentialCount()
                    .then((count) => console.log(count));
            } catch (err) {
                console.log(err);
            }
        },

        createCredential: async (account: Account, url, username, password) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                await credentialService
                    .createCredential(url, username, password)
                    .then(() => console.log("credential created"));
            } catch (err) {
                console.log(err);
            }
        },

        deleteCredential: async (account: Account, id) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                await credentialService
                    .deleteCredential(id)
                    .then(() => console.log("credential deleted"));
            } catch (err) {
                console.log(err);
            }
        },

        updateCredential: async (
            account: Account,
            id,
            url,
            username,
            password
        ) => {
            try {
                const credentialService = new CredentialService(
                    cryptoService,
                    account,
                    client
                );
                await credentialService
                    .updateCredential(
                        id,
                        url,
                        username,
                        password,
                        account.masterKey
                    )
                    .then(() => console.log("credential updated"));
            } catch (err) {
                console.log(err);
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
                console.log(err);
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
                    newCredential(cred.id, cred.user, cred.password, cred.name)
                );
            } catch (err) {
                console.log(err);
            }
        },
    };
    return module;
})();
