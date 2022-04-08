import { ApolloClient, InMemoryCache } from "@apollo/client";
import CryptoService from "hexagon-shared/services/CryptoService";

//properties of an account (needed for MFA and Credential services)
export type Account = {
    email: string;
    masterKey: string;
    jwt: string;
};

//new apollo client
export const client = new ApolloClient({
    uri: "https://hexagon-web.xyz/api/graphql",
    cache: new InMemoryCache(),
    defaultOptions: {
        query: { fetchPolicy: "no-cache" },
        mutate: { fetchPolicy: "no-cache" },
    },
});

//new crypto service (needed for MFA and Credential services)
export const cryptoService = new CryptoService(crypto);
