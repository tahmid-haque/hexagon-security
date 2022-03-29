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
    name
  }
}
`;

const findMFAQuery = gql`
query($offset: Int!, $limit: Int!, $sortType: String!, getShares: Boolean!){
  findMFA(getShares:$getShares, offset:$offset, limit: $limit, sortType: $sortType){
    _id
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

  public findMFA(offset: number, limit: number, sortType: string, getShares: boolean){
    this.client.query({
      query: findMFAQuery,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        offset: offset,
        limit: limit,
        sortType: sortType,
        getShares: getShares
      }
    }).then(result => console.log(result));
  }

  public findMFAContains(name: string, contains: boolean, getShares: boolean){
    this.client.query({
      query: findMFAContainsQuery,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        name: name,
        contains: contains,
        getShares: getShares
      }
    }).then(result => console.log(result));
  }
  
  public countMFAs(){
    this.client.query({
      query: countMFAsQuery,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      }
    }).then(result => console.log(result));
  }

  public addSeed(name: string, username: string, seed: string, key: string,){
    this.client.query({
      query: addSeedMutation,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        name: name,
        username: username,
        seed: seed,
        key: key
      }
    }).then(result => console.log(result));
  }
}

export default MFAController;
