import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";

const deleteSecureRecordMutation = gql`
mutation($secureRecordID: String!){
  deleteSecureRecord(secureRecordID: $secureRecordID ){
    _id
  }
}
`;

class SecureRecordController {
  private client!: ApolloClient<NormalizedCacheObject>;
  private token!: string;
  constructor(client: ApolloClient<NormalizedCacheObject>, token: string){
      this.client = client;
      this.token = token;
  }

  public deleteSecureRecord(secureRecordID: string){
    this.client.query({
      query: deleteSecureRecordMutation,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        secureRecordID: secureRecordID
      }
    }).then(result => console.log(result));
  }
}

export default SecureRecordController;
