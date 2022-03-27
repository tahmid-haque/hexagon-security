// sourced from https://github.com/bradyjoslin/webcrypto-example

const buff_to_base64 = (buff: Uint8Array) =>
    btoa(String.fromCharCode.apply(null, Array.from(buff)));

const base64_to_buf = (b64: string) =>
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const enc = new TextEncoder();
const dec = new TextDecoder();

const getPasswordKey = (password: string) =>
    window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

const deriveKey = (
    passwordKey: CryptoKey,
    salt: Uint8Array,
    keyUsage: KeyUsage[]
) =>
    window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 250000,
            hash: 'SHA-256',
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        keyUsage
    );

const encryptSingle = async (plainText: string, aesKey: CryptoKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        aesKey,
        enc.encode(plainText)
    );

    const encryptedContentArr = new Uint8Array(encryptedContent);
    let buff = new Uint8Array(iv.byteLength + encryptedContentArr.byteLength);
    buff.set(iv, 0);
    buff.set(encryptedContentArr, iv.byteLength);
    return buff;
};

const decryptSingle = async (cipherBuff: Uint8Array, aesKey: CryptoKey) => {
    const iv = cipherBuff.slice(0, 12);
    const data = cipherBuff.slice(12);
    const decryptedContent = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        aesKey,
        data
    );

    return dec.decode(decryptedContent);
};

const getAESKey = (secret: string, salt: Uint8Array, isEncrypt: boolean) => {
    return getPasswordKey(secret).then((key) =>
        deriveKey(key, salt, [isEncrypt ? 'encrypt' : 'decrypt'])
    );
};

export async function encryptData(
    plainData: string[],
    secret: string,
    salt: Uint8Array
) {
    const aesKey = await getPasswordKey(secret).then((key) =>
        deriveKey(key, salt, ['encrypt'])
    );

    return await Promise.all(
        plainData.map(async (plainText) =>
            buff_to_base64(await encryptSingle(plainText, aesKey))
        )
    );
}

export async function decryptData(
    encryptedData: string[],
    secret: string,
    salt: Uint8Array
) {
    const aesKey = await getAESKey(secret, salt, false);

    return await Promise.all(
        encryptedData.map((cipherText) =>
            decryptSingle(base64_to_buf(cipherText), aesKey)
        )
    );
}

export async function encryptWrappedData(plainData: string[], secret: string) {
    const recordSecret = window.crypto
        .getRandomValues(new Uint8Array(16))
        .toString();
    const recordSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const wrapperSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const passwordAES = getAESKey(secret, wrapperSalt, true);

    const encryptedKey = passwordAES.then(async (key) => {
        const encrypted = await encryptSingle(recordSecret, key);
        const buff = new Uint8Array(
            encrypted.length + wrapperSalt.length + recordSalt.length
        );
        buff.set(wrapperSalt, 0);
        buff.set(recordSalt, wrapperSalt.length);
        buff.set(encrypted, wrapperSalt.length + recordSalt.length);
        return buff_to_base64(buff);
    });

    const encryptedRecords = encryptData(plainData, recordSecret, recordSalt);

    const [encryptedKeyStr, encryptedRecordsStr] = await Promise.all([
        encryptedKey,
        encryptedRecords,
    ]);

    return [encryptedKeyStr, ...encryptedRecordsStr];
}

export async function decryptWrappedData(
    encryptedData: string[],
    encryptedKey: string,
    secret: string
) {
    const encryptedKeyBytes = base64_to_buf(encryptedKey);
    const wrapperSalt = encryptedKeyBytes.slice(0, 16);
    const recordSalt = encryptedKeyBytes.slice(16, 32);
    const passwordAES = await getAESKey(secret, wrapperSalt, false);
    const recordSecret = await decryptSingle(
        encryptedKeyBytes.slice(32),
        passwordAES
    );
    const recordAES = await getAESKey(recordSecret, recordSalt, false);

    return {
        key: {
            salt: recordSalt,
            secret: recordSecret,
        },
        plainTexts: await Promise.all(
            encryptedData.map((cipherText) =>
                decryptSingle(base64_to_buf(cipherText), recordAES)
            )
        ),
    };
}
