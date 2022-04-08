import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { executeQuery } from '../utils/controller';

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
 * @param url request url
 * @param body body data
 * @param isGet boolean value for GET request
 * @param headers headers data
 * @returns the JSON response or throws an error
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
        // eslint-disable-next-line no-throw-literal
        if (!res.ok) throw { status: res.status, errors: res.json() };
        else return res.json();
    });
};

/**
 * Controller to communicate with the backend in all account related functions
 */
class AccountController {
    private hostPrefix: string;

    /**
     * Creates an AccountController to communicate with the backend
     * @param hostPrefix the hostPrefix to attach to all requests, defaults as ''
     */
    constructor(hostPrefix: string = '') {
        this.hostPrefix = hostPrefix;
    }

    /**
     * Attempts to update the password of the hexagon user,
     * throws an error on failure
     * @param oldPassword current password for the user
     * @param newPassword password to be updated with
     * @param client apollo client
     * @param token user's jwt token
     * @returns the success status
     */
    updatePassword(
        oldPassword: string,
        newPassword: string,
        client: ApolloClient<NormalizedCacheObject>,
        token: string
    ): Promise<boolean> {
        return executeQuery(
            client,
            token,
            updatePasswordMutation,
            { oldPassword, newPassword },
            true
        ).then((data: any) => data.updatePassword);
    }

    /**
     * Checks if an email exists in the database
     * @param email current password for the user
     * @returns an object indicating whether the account exists
     */
    checkExists(email: string) {
        return doRequest(this.hostPrefix + '/api/auth/exists', {
            username: email,
        });
    }

    /**
     * Verifies credentials for signing in
     * @param email email to signIn
     * @param password password to signIn
     */
    signIn(email: string, password: string): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signin', {
            username: email,
            password,
        }) as any as Promise<AuthenticationResponse>;
    }

    /**
     * Verifies credentials for signing up to website
     * @param email email to signup
     * @param password password to signup
     */
    signUp(email: string, password: string): Promise<AuthenticationResponse> {
        return doRequest(this.hostPrefix + '/api/auth/signup', {
            username: email,
            password,
        }) as any as Promise<AuthenticationResponse>;
    }

    /**
     * Performs signout action using the user's token
     * @param token user's jwt
     * @returns an object containing operation success
     */
    signOut(token: string): Promise<any> {
        return doRequest(this.hostPrefix + '/api/auth/signout', null, true, {
            jwt: token,
        }) as any;
    }
}

export default AccountController;
