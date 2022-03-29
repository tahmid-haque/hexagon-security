import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";

const countNotesQuery = gql`
query(){
  countNotes(){
    _id
  }
}
`;

const findNotesQuery = gql`
query($offset: Int!, $limit: Int!, $sortType: String!, getShares: Boolean!){
  findNotes(getShares:$getShares, offset:$offset, limit: $limit, sortType: $sortType){
    _id
  }
}
`;

const addNoteMutation = gql`
mutation($title: String!, $note: String!, $key: String!){
  addNote(title: $title, note: $note, key: $key ){
    _id
  }
}
`;

const updateNoteMutation = gql`
mutation($title: String!, $note: String!, $secureRecordID: String!){
  updateNote(title: $title, note: $note, secureRecordID: $secureRecordID ){
    _id
  }
}
`;

class NoteController {
  private client!: ApolloClient<NormalizedCacheObject>;
  private token!: string;
  constructor(client: ApolloClient<NormalizedCacheObject>, token: string){
      this.client = client;
      this.token = token;
  }

  public findNotes(offset: number, limit: number, sortType: string, getShares: boolean){
    this.client.query({
      query: findNotesQuery,
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
  
  public countNotes(){
    this.client.query({
      query: countNotesQuery,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      }
    }).then(result => console.log(result));
  }

  public addNote(title: string, note: string, key: string,){
    this.client.query({
      query: addNoteMutation,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        title: title,
        note: note,
        key: key
      }
    }).then(result => console.log(result));
  }

  public updateNote(title: string, note: string, secureRecordID: string,){
    this.client.query({
      query: updateNoteMutation,
      context: { 
        headers: { 
            "jwt": this.token  // this header will reach the server
        } 
      },
      variables: {
        title: title,
        note: note,
        secureRecordID: secureRecordID
      }
    }).then(result => console.log(result));
  }
}

export default NoteController;
