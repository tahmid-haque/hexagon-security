export default class CryptoService {
    crypto: Crypto;
    enc: TextEncoder;
    dec: TextDecoder;
    constructor(crypto: Crypto);
    buff_to_base64: (buff: Uint8Array) => string;
    base64_to_buf: (b64: string) => Uint8Array;
    getPasswordKey: (password: string) => Promise<CryptoKey>;
    deriveKey: (
        passwordKey: CryptoKey,
        salt: Uint8Array,
        keyType: string,
        keyUsage: KeyUsage[]
    ) => Promise<CryptoKey>;
    encryptSingle: (
        plainText: string,
        aesKey: CryptoKey
    ) => Promise<Uint8Array>;
    encryptMultiple: (
        plainData: string[],
        aesKey: CryptoKey
    ) => Promise<string[]>;
    decryptMultiple: (
        encryptedData: string[],
        aesKey: CryptoKey
    ) => Promise<string[]>;
    decryptSingle: (
        cipherBuff: Uint8Array,
        aesKey: CryptoKey
    ) => Promise<string>;
    getWrapperKey: (
        secret: string,
        salt: Uint8Array,
        isWrap: boolean
    ) => Promise<CryptoKey>;
    encryptData(plainData: string[], key: ArrayBuffer): Promise<string[]>;
    decryptData(encryptedData: string[], key: ArrayBuffer): Promise<string[]>;
    encryptWrappedData(plainData: string[], secret: string): Promise<string[]>;
    decryptWrappedData(
        encryptedData: string[],
        encryptedKey: string,
        secret: string
    ): Promise<{
        key: ArrayBuffer;
        plainTexts: string[];
    }>;
    digestMessage(message: string): Promise<string>;
}
