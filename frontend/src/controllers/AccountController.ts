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

/**
 * Performs the http request
 * @param {string} url request url
 * @param {any} body body data
 * @param {boolean} isGet boolean value for get request
 * @param {any} headers headers data
 */
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

    /**
     * Attempts to update the password of the hexagon user,
     * throws an error on failure
     * @param {string} oldPassword current password for the user
     * @param {string} newPassword password to be updated with
     * @param {ApolloClient<NormalizedCacheObject>} client apollo client
     * @param {string} token user's jwt token
     * @returns {any} updated user object
     */
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

    
    /**
     * Checks if a email exists in the database
     * @param {string} email current password for the user
     * @returns {any} boolean value
     */
    async checkExists(email: string) {
        return doRequest(this.hostPrefix + '/api/auth/exists', {
            username: email,
        });
    }

    /**
     * verifies credentials for signing in
     * @param {string} email email to signIn
     * @param {string} password password to signIn
     */
    async signIn(
        email: string,
        password: string
    ): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signin', {
            username: email,
            password,
        }) as any as AuthenticationResponse;
    }

    /**
     * verifies credentials for signing up to website
     * @param {string} email email to signup
     * @param {string} password password to signup
     */
    async signUp(
        email: string,
        password: string
    ): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signup', {
            username: email,
            password,
        }) as any as AuthenticationResponse;
    }

    /**
     * performs signout action using the user's token
     * @param {string} token user's jwt token
     */
    async signOut(token: string): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signout', null, true, {
            jwt: token,
        }) as any;
    }
}

export default AccountController;
