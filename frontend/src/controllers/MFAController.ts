import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";

const countMFAsQuery = gql`
query(){
  countMFAs(){
    _id
  }
}
`;

const findMFAContainsQuery = gql`
query($name: String!, $contains: Boolean!, $getShares: Boolean!){
  findMFAContains(getShares:$getShares, contains: $contains, name: $name){
    _id
    name
    key
    recordID
    MFA{
      _id
      username
      seed
    }
  }
}
`;

const findMFAContainsWithSharesQuery = gql`
query($name: String!, $contains: Boolean!, $getShares: Boolean!){
  findMFAContains(getShares:$getShares, contains: $contains, name: $name){
    _id
    name
    key
    recordID
    MFA{
      _id
      username
      seed
      UIDs {
        UID
      }
    }
  }
}
`;

const findMFAQuery = gql`
query($offset: Int!, $limit: Int!, $sortType: String!, getShares: Boolean!){
  findMFA(getShares:$getShares, offset:$offset, limit: $limit, sortType: $sortType){
    _id
    name
    key
    recordID
    MFA{
      _id
      username
      seed
    }
  }
}
`;

const findMFAWithSharesQuery = gql`
query($offset: Int!, $limit: Int!, $sortType: String!, getShares: Boolean!){
  findMFA(getShares:$getShares, offset:$offset, limit: $limit, sortType: $sortType){
    _id
    name
    key
    recordID
    MFA{
      _id
      username
      seed
      UIDs {
        UID
      }
    }
  }
}
`;

const addSeedMutation = gql`
mutation($name: String!, $username: String!, $seed: String!, $key: String!){
  addSeed(name: $name, username: $username, seed: $seed, key: $key ){
    _id
  }
}
`;

class MFAController {
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

  public findMFA(offset: number, limit: number, sortType: string, getShares: boolean){
    if (getShares){
      return this.client.query(this.buildQuery(findMFAWithSharesQuery,{
        offset: offset,
        limit: limit,
        sortType: sortType,
        getShares: getShares
      }));
    } else {
      return this.client.query(this.buildQuery(findMFAQuery,{
        offset: offset,
        limit: limit,
        sortType: sortType,
        getShares: getShares
      }));
    }
  }

  public findMFAContains(name: string, contains: boolean, getShares: boolean){
    if (getShares){
      return this.client.query(this.buildQuery(findMFAContainsWithSharesQuery,{
        name: name,
        contains: contains,
        getShares: getShares
      }));
    } else {
      return this.client.query(this.buildQuery(findMFAContainsQuery,{
        name: name,
        contains: contains,
        getShares: getShares
      }));
    }
  }
  
  public countMFAs(){
    return this.client.query(this.buildQuery(countMFAsQuery,{}));
  }

  public addSeed(name: string, username: string, seed: string, key: string,){
    return this.client.query(this.buildQuery(addSeedMutation,{
      name: name,
      username: username,
      seed: seed,
      key: key
    }));
  }
}

export default MFAController;
