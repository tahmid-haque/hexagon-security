import AccountController from '../controllers/AccountController';

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
}

export default AccountService;
