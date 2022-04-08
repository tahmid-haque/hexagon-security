import { ApolloClient, InMemoryCache } from "@apollo/client";
import CryptoService from "hexagon-shared/services/CryptoService";

export type Account = {
    email: string;
    masterKey: string;
    jwt: string;
};

export const client = new ApolloClient({
    uri: "https://hexagon-web.xyz/api/graphql",
    cache: new InMemoryCache(),
    defaultOptions: {
        query: { fetchPolicy: "no-cache" },
        mutate: { fetchPolicy: "no-cache" },
    },
});

export const cryptoService = new CryptoService(crypto);
