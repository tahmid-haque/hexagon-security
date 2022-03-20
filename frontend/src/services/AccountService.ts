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
        return this.accountController.checkExists(email);
    }

    authenticateUser(email: string, password: string, isSignUp = false) {
        return isSignUp
            ? this.accountController.signIn(email, password)
            : this.accountController.signUp(email, password);
    }
}

export default AccountService;
