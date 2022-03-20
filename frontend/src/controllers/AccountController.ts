class AccountController {
    async checkExists(email: string) {
        // TODO: Use real API later
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ inUse: false });
            }, 1000);
        });
    }

    async signIn(email: string, password: string) {
        // TODO: Use real API later
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ masterKey: 'c2d2d3f0-a7ce-11ec-b909-0242ac120002' });
            }, 1000);
        });
    }

    async signUp(email: string, password: string) {
        // TODO: Use real API later
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    masterKey: 'c2d2d3f0-a7ce-11ec-b909-0242ac120002',
                    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                });
            }, 1000);
        });
    }
}

export default AccountController;
