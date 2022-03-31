export type AuthenticationResponse = {
    masterKey: string;
    jwt: string;
};

const doPOST = (url: string, body: any) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).then((res) => {
        if (!res.ok) throw { status: res.status, errors: res.json() };
        else return res.json();
    });
};

class AccountController {
    async checkExists(email: string) {
        return doPOST('/api/auth/exists', { username: email });
    }

    async signIn(
        email: string,
        password: string
    ): Promise<AuthenticationResponse> {
        return doPOST('/api/auth/signin', {
            username: email,
            password,
        }) as any as AuthenticationResponse;
    }

    async signUp(
        email: string,
        password: string
    ): Promise<AuthenticationResponse> {
        return doPOST('/api/auth/signup', {
            username: email,
            password,
        }) as any as AuthenticationResponse;
    }
}

export default AccountController;
