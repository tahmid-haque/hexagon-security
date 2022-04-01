import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";

const countNotesQuery = gql`
query{
  countNotes{
    _id
  }
}
`;

const findNotesQuery = gql`
query($offset: Int!, $limit: Int!, $sortType: String!, getShares: Boolean!){
  findNotes(getShares:$getShares, offset:$offset, limit: $limit, sortType: $sortType){
    _id
    name
    key
    recordID
    notes{
      _id
      lastModified
      title
      note
    }
  }
}
`;

const findNotesWithSharesQuery = gql`
query($offset: Int!, $limit: Int!, $sortType: String!, getShares: Boolean!){
  findNotes(getShares:$getShares, offset:$offset, limit: $limit, sortType: $sortType){
    _id
    name
    key
    recordID
    notes{
      _id
      lastModified
      title
      note
      UIDs {
        UID
      }
    }
    share{
      reciever
      shareId
    }
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

  public findNotes(offset: number, limit: number, sortType: string, getShares: boolean){
    if (getShares){
      return this.client.query(this.buildQuery(findNotesWithSharesQuery,{
        offset: offset,
        limit: limit,
        sortType: sortType,
        getShares: getShares
      }));
    } else {
      return this.client.query(this.buildQuery(findNotesQuery,{
        offset: offset,
        limit: limit,
        sortType: sortType,
        getShares: getShares
      }));
    }

  }
  
  public countNotes(){
    return this.client.query(this.buildQuery(countNotesQuery,{}));
  }

  public addNote(title: string, note: string, key: string,){
    return this.client.query(this.buildQuery(addNoteMutation,{
      title: title,
      note: note,
      key: key
    }));
  }

  public updateNote(title: string, note: string, secureRecordID: string,){
    return this.client.query(this.buildQuery(updateNoteMutation,{
      title: title,
      note: note,
      secureRecordID: secureRecordID
    }));
  }
}

export default NoteController;
