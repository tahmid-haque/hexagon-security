import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';

export type AuthenticationResponse = {
    masterKey: string;
    jwt: string;
};

const updatePasswordMutation = gql`
    mutation ($oldPassword: String!, $newPassword: String!) {
        updatePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
            _id
        }
    }
`;

const doRequest = (
    url: string,
    body: any,
    isGet: boolean = false,
    headers: any = {}
) => {
    return fetch(url, {
        method: isGet ? 'GET' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        },
        ...(!isGet && { body: JSON.stringify(body) }),
    }).then((res) => {
        if (!res.ok) throw { status: res.status, errors: res.json() };
        else return res.json();
    });
};

class AccountController {
    private hostPrefix: string;

    constructor(hostPrefix: string = '') {
        this.hostPrefix = hostPrefix;
    }

    public updatePassword(
        oldPassword: string,
        newPassword: string,
        client: ApolloClient<NormalizedCacheObject>,
        token: string
    ) {
        return client.query({
            query: updatePasswordMutation,
            context: {
                headers: {
                    jwt: token, // this header will reach the server
                },
            },
            variables: {
                oldPassword: oldPassword,
                newPassword: newPassword,
            },
        });
    }

    async checkExists(email: string) {
        return doRequest(this.hostPrefix + '/api/auth/exists', {
            username: email,
        });
    }

    async signIn(
        email: string,
        password: string
    ): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signin', {
            username: email,
            password,
        }) as any as AuthenticationResponse;
    }

    async signUp(
        email: string,
        password: string
    ): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signup', {
            username: email,
            password,
        }) as any as AuthenticationResponse;
    }

    async signOut(token: string): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signout', null, true, {
            jwt: token,
        }) as any;
    }
}

export default AccountController;
