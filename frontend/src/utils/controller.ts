import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

/**
 * Execute a query given all its configuration
 * @param client GraphQL client used to connect to backend
 * @param token JWT
 * @param query GraphQL query
 * @param variables variables to sub into the query
 * @param isMutation whether the query is a mutation or query
 * @returns the GraphQL response
 */
export async function executeQuery(
    client: ApolloClient<NormalizedCacheObject>,
    token: string,
    query: any,
    variables: any,
    isMutation: boolean
): Promise<any> {
    const execute: (options: any) => Promise<any> = isMutation
        ? client.mutate
        : client.query;
    return execute({
        [isMutation ? 'mutation' : 'query']: query,
        context: {
            headers: {
                jwt: token,
            },
        },
        variables,
    })
        .then((res) => res.data)
        .catch((err) => {
            const error = JSON.parse(err.message);
            error.status = Number(error.status);
            throw error;
        });
}
