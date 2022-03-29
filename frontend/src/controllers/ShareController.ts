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
  public addShare(reciever: string, ShareID: string, key: string){
    this.client.query({
      query: addShareMutation,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        reciever: reciever,
        ShareID: ShareID,
        key: key
      }
    }).then(result => console.log(result));
  }

  public deleteShare(ShareID: string){
    this.client.query({
      query: deleteShareMutation,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        ShareID: ShareID
      }
    }).then(result => console.log(result));
  }
}

export default ShareController;
