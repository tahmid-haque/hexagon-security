import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";

const addShareMutation = gql`
mutation($reciever: String!, $secureRecordID: String!, $key: String!){
  addShare(reciever: $reciever, secureRecordID: $secureRecordID, key: $key ){
    _id
  }
}
`;

const deleteShareMutation = gql`
mutation($ShareID: String!){
  deleteShare(ShareID: $ShareID ){
    _id
  }
}
`;

class ShareController {
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

  public addShare(reciever: string, ShareID: string, key: string){
    return this.client.query(this.buildQuery(addShareMutation,{
      reciever: reciever,
      ShareID: ShareID,
      key: key
    }));
  }

  public deleteShare(ShareID: string){
    return this.client.query(this.buildQuery(deleteShareMutation,{
      ShareID: ShareID
    }));
  }
}

export default ShareController;
