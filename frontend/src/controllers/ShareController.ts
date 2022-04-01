import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";

const addShareMutation = gql`
mutation($reciever: String!, $secureRecordID: String!, $recordID: String! $key: String!){
  addShare(reciever: $reciever, secureRecordID: $secureRecordID, recordID: $recordID, key: $key ){
    _id
  }
}
`;

const deleteShareMutation = gql`
mutation($secureRecordID: String!, $shareID: String!){
  deleteShare(shareID: $shareID, secureRecordID: $secureRecordID){
    _id
  }
}
`;

const revokeShareMutation = gql`
mutation($secureRecordID: String!, $owner: String!){
  revokeShare(owner: $owner, secureRecordID: $secureRecordID){
    _id
  }
}
`;

const AcceptOrDeclineShareMutation = gql`
mutation($shareKey: String!, $shareID: String!, $isAccepted: Boolean!, $masterKey: String!){
  AcceptOrDeclineShare(shareKey: $shareKey, shareID: $shareID, isAccepted: $isAccepted, masterKey: $masterKey){
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

  public addShare(reciever: string, secureRecordID: string, recordID: string, key: string){
    return this.client.query(this.buildQuery(addShareMutation,{
      reciever: reciever,
      secureRecordID: secureRecordID,
      recordID: recordID,
      key: key
    }));
  }

  public deleteShare(shareID: string, secureRecordID: string){
    return this.client.query(this.buildQuery(deleteShareMutation,{
      secureRecordID: secureRecordID,
      shareID: shareID
    }));
  }

  public revokeShare(owner: string, secureRecordID: string){
    return this.client.query(this.buildQuery(revokeShareMutation,{
      secureRecordID: secureRecordID,
      owner: owner
    }));
  }

  public AcceptOrDeclineShare(shareKey: string, shareID: string, isAccepted: boolean, masterKey: string){
    return this.client.query(this.buildQuery(AcceptOrDeclineShareMutation,{
      shareKey: shareKey,
      shareID: shareID,
      isAccepted: isAccepted,
      masterKey: masterKey
    }));
  }
}

export default ShareController;
