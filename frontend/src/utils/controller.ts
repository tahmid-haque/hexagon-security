import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

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
