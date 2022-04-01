import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";


export type AuthenticationResponse = {
    masterKey: string;
    jwt: string;
};

const updatePasswordMutation = gql`
mutation($oldPassword: String!, $newPassword: String!){
    updatePassword(oldPassword: $oldPassword, newPassword: $newPassword){
    _id
  }
}
`;

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
    private client!: ApolloClient<NormalizedCacheObject>;
    private token!: string;
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string){
        this.client = client;
        this.token = token;
    }
    private buildQuery(query: any, variables: any){
        return {query,
                context: { 
                    headers: { 
                        "jwt": this.token  // this header will reach the server
                    } 
                },
                variables
              }
    }

    public updatePassword(oldPassword: string, newPassword: string){
        return this.client.query(this.buildQuery(updatePasswordMutation,{
            oldPassword: oldPassword,
            newPassword: newPassword
        }));
    }
      

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
