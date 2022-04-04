import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GridSortDirection } from '@mui/x-data-grid';
import { Note } from '../components/notes/NotesView';
import { Owner, PendingShare } from '../components/shares/ShareManager';
import NoteController, { NoteDto } from '../controllers/NoteController';
import SecureRecordController from '../controllers/SecureRecordController';
import { Account } from '../store/slices/AccountSlice';
import * as CryptoWorker from '../workers/CryptoWorker';

class NoteService {
    private cryptoWorker: typeof CryptoWorker;
    private noteController: NoteController;
    private secureRecordController: SecureRecordController;
    private masterKey: string;
    private masterEmail: string;

    private async createEncryptedNote(title: string, body: string) {
        return this.cryptoWorker.encryptWrappedData(
            [title, body, this.masterEmail],
            this.masterKey
        );
    }

    private async decryptNote(dto: NoteDto): Promise<Note> {
        let title = '';
        let body = '';
        let key = '';
        let shares: Owner[] = [];
        let pendingShares: PendingShare[] = [];
        let lastModified: Date | undefined;

        try {
            lastModified = new Date(Number(dto.note.lastModified));
        } catch (error) {}

        try {
            const [
                decryptedKey,
                decryptedTitle,
                decryptedBody,
                ...decryptedShares
            ] = await this.cryptoWorker.decryptWrappedData(
                [
                    dto.note.title,
                    dto.note.note,
                    ...dto.note.owners,
                    ...dto.pendingShares.map(
                        (pendingShare) => pendingShare.receiver
                    ),
                ],
                dto.key,
                this.masterKey
            );
            key = decryptedKey;
            title = decryptedTitle;
            body = decryptedBody;
            shares = dto.note.owners.map((owner, idx) => ({
                encryptedValue: owner,
                value: decryptedShares[idx],
            }));
            pendingShares = decryptedShares
                .slice(dto.note.owners.length)
                .map((receiver, idx) => ({
                    shareId: dto.pendingShares[idx]._id,
                    receiver,
                }));
        } catch (error) {}

        return {
            id: dto._id,
            lastModified,
            title,
            body,
            key,
            shares,
            pendingShares,
        };
    }

    constructor(
        cryptoWorker: any,
        account: Account,
        client: ApolloClient<NormalizedCacheObject>
    ) {
        this.masterKey = account.masterKey;
        this.masterEmail = account.email;
        this.cryptoWorker = cryptoWorker;
        this.noteController = new NoteController(client, account.jwt);
        this.secureRecordController = new SecureRecordController(
            client,
            account.jwt
        );
    }

    async getNoteCount() {
        return this.noteController.countNotes();
    }

    async getNotes(offset: number, limit: number, sortType: GridSortDirection) {
        const dtos = await this.noteController.getNotes(
            offset,
            limit,
            sortType!
        );
        return Promise.all(dtos.map(this.decryptNote.bind(this)));
    }

    async createNote(title: string, body: string) {
        const [encryptedKey, encryptedTitle, encryptedBody, encryptedEmail] =
            await this.createEncryptedNote(title, body);
        return this.noteController.createNote(
            encryptedTitle,
            encryptedBody,
            encryptedKey,
            encryptedEmail
        );
    }

    async updateNote(id: string, title: string, body: string, key: string) {
        const [encryptedTitle, encryptedBody] =
            await this.cryptoWorker.encryptData([title, body], key);
        return this.noteController.updateNote(
            encryptedTitle,
            encryptedBody,
            id
        );
    }

    async deleteNote(id: string) {
        return this.secureRecordController.deleteSecureRecord(id);
    }
}

export default NoteService;
