import AccountController from '../controllers/AccountController';

class AccountService {
    private accountController = new AccountController();

    checkInUse(email: string) {
        return this.accountController.checkExists(email);
    }
}

export default AccountService;
