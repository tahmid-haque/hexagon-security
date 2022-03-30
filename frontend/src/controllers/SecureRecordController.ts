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

  public deleteSecureRecord(secureRecordID: string){
    return this.client.query(this.buildQuery(deleteSecureRecordMutation,{
      secureRecordID: secureRecordID
    }));
  }
}

export default SecureRecordController;
