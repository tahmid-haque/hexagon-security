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
    keyType: string,
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
        { name: keyType, length: 256 },
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

const encryptMultiple = async (plainData: string[], aesKey: CryptoKey) => {
    return await Promise.all(
        plainData.map(async (plainText) =>
            buff_to_base64(await encryptSingle(plainText, aesKey))
        )
    );
};

const decryptMultiple = async (encryptedData: string[], aesKey: CryptoKey) => {
    return await Promise.all(
        encryptedData.map((cipherText) =>
            decryptSingle(base64_to_buf(cipherText), aesKey)
        )
    );
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

export const getWrapperKey = (
    secret: string,
    salt: Uint8Array,
    isWrap: boolean
) => {
    return getPasswordKey(secret).then((key) =>
        deriveKey(key, salt, 'AES-KW', [isWrap ? 'wrapKey' : 'unwrapKey'])
    );
};

export async function encryptData(plainData: string[], key: ArrayBuffer) {
    const aesKey = await window.crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );
    return await encryptMultiple(plainData, aesKey);
}

export async function decryptData(encryptedData: string[], key: ArrayBuffer) {
    const aesKey = await window.crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
    return await decryptMultiple(encryptedData, aesKey);
}

export async function encryptWrappedData(plainData: string[], secret: string) {
    const recordAES = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt']
    );
    const wrapperSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const passwordAES = getWrapperKey(secret, wrapperSalt, true);

    const encryptedKey = passwordAES.then(async (key) => {
        const encrypted = new Uint8Array(
            await window.crypto.subtle.wrapKey('raw', recordAES, key, 'AES-KW')
        );

        const buff = new Uint8Array(encrypted.length + wrapperSalt.length);
        buff.set(wrapperSalt, 0);
        buff.set(encrypted, wrapperSalt.length);
        return buff_to_base64(buff);
    });

    const encryptedRecords = encryptMultiple(plainData, recordAES);

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
    const passwordAES = await getWrapperKey(secret, wrapperSalt, false);
    const recordAES = await window.crypto.subtle.unwrapKey(
        'raw',
        encryptedKeyBytes.slice(16),
        passwordAES,
        'AES-KW',
        'AES-GCM',
        true,
        ['decrypt']
    );
    const decryptedData = decryptMultiple(encryptedData, recordAES);
    const recordKey = window.crypto.subtle.exportKey('raw', recordAES);

    return { key: await recordKey, plainTexts: await decryptedData };
}
