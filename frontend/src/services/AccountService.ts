import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import AccountController from '../controllers/AccountController';
import { executeQuery } from '../utils/controller';

const updatePasswordMutation = gql`
    mutation ($oldPassword: String!, $newPassword: String!) {
        updatePassword(oldPassword: $oldPassword, newPassword: $newPassword)
    }
`;
class AccountService {
    private accountController = new AccountController();
    private accountService: AccountService | null = null;

    constructor() {
        if (this.accountService) {
            return this.accountService;
        }
        this.accountService = this;
    }

    checkInUse(email: string) {
        return this.accountController
            .checkExists(email)
            .then((res: any) => ({ inUse: res.exists }));
    }

    authenticateUser(email: string, password: string, isSignUp = false) {
        return isSignUp
            ? this.accountController.signUp(email, password)
            : this.accountController.signIn(email, password);
    }

    async updatePassword(
        oldPassword: string,
        newPassword: string,
        client: ApolloClient<NormalizedCacheObject>,
        token: string
    ) {
        return executeQuery(
            client,
            token,
            updatePasswordMutation,
            { oldPassword, newPassword },
            true
        ).then((data) => data.updatePassword);
    }
}

export default AccountService;
