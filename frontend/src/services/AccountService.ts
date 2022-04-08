import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import AccountController from '../controllers/AccountController';

/**
 * Service used to manage all account related functions
 */
class AccountService {
    private accountController!: AccountController;
    private accountService: AccountService | null = null;

    /**
     * Creates an AccountService
     * @param hostPrefix the hostPrefix to attach to all requests, defaults as ''
     */
    constructor(hostPrefix: string = '') {
        if (this.accountService) {
            return this.accountService;
        }
        this.accountService = this;
        this.accountController = new AccountController(hostPrefix);
    }

    /**
     * Check whether an account with the given email exists
     * @param email the email to check for
     * @returns an object that indicates whether the email is in use
     */
    checkInUse(email: string) {
        return this.accountController
            .checkExists(email)
            .then((res: any) => ({ inUse: res.exists }));
    }

    /**
     * Authenticates a user given this information. Can be via sign in or sign up.
     * @param email user email
     * @param password user email
     * @param isSignUp whether to authenticate via sign up
     * @returns the account information associated to the user
     */
    authenticateUser(email: string, password: string, isSignUp = false) {
        return isSignUp
            ? this.accountController.signUp(email, password)
            : this.accountController.signIn(email, password);
    }

    /**
     * Updates the user password.
     * @param oldPassword old password to verify
     * @param newPassword new password to replace with
     * @param client GraphQL client
     * @param token JWT
     * @returns true on success
     */
    updatePassword(
        oldPassword: string,
        newPassword: string,
        client: ApolloClient<NormalizedCacheObject>,
        token: string
    ) {
        return this.accountController.updatePassword(
            oldPassword,
            newPassword,
            client,
            token
        );
    }

    /**
     * Sign out the user using their token
     * @param token JWT
     * @returns true on success
     */
    async signOut(token: string) {
        const { success } = await this.accountController.signOut(token);
        if (success) return true;
        throw new Error('sign out failed!');
    }
}

export default AccountService;
