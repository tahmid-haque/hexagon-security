// sourced from https://github.com/bradyjoslin/webcrypto-example

/**
 * Class for all cryptographic operations
 */
class CryptoService {
    crypto; // the crypto library for all operations
    enc = new TextEncoder();
    dec = new TextDecoder('utf-8');

    /**
     * Create a CryptoService
     * @param {*} crypto the crypto library for all operations
     */
    constructor(crypto) {
        this.crypto = crypto;
    }

    /**
     * Create a string containing the BASE64-encoded representation of a buffer
     * @param {Uint8Array} buff the buffer with raw bytes
     * @returns a string containing the BASE64-encoded representation of a buffer
     */
    buff_to_base64(buff) {
        return btoa(String.fromCharCode.apply(null, Array.from(buff)));
    }

    /**
     * Create a buffer containing the raw byte representation of the string
     * @param {string} b64 a BASE64-encoded string
     * @returns a buffer containing the raw byte representation of the string
     */
    base64_to_buf(b64) {
        return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    }

    /**
     * Generate a CrpytoKey based on the password using the PKDBF2 algorithm
     * @param {string} password
     * @returns a CryptoKey based on the PKDBF2 algorithm
     */
    getPasswordKey(password) {
        return this.crypto.subtle.importKey(
            'raw',
            this.enc.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
    }

    /**
     * Create a CryptoKey derived from the provided parameters
     * @param {CryptoKey} passwordKey the key to derive the new from
     * @param {Uint8Array} salt a 16 byte buffer with random bytes
     * @param {string} keyType type of requested key
     * @param {KeyUsage[]} keyUsage usage of requested key
     * @returns a prromise that resolves to the created CryptoKey
     */
    deriveKey(passwordKey, salt, keyType, keyUsage) {
        return this.crypto.subtle.deriveKey(
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
    }

    /**
     * Create a random 32 byte string
     * @returns the random string encoded in BASE64
     */
    generatePlainSecret() {
        return this.buff_to_base64(
            this.crypto.getRandomValues(new Uint8Array(32))
        );
    }

    /**
     * Encrypt a single item using the provided key using AES-GCM
     * @param {string} plainText data to encrypt
     * @param {CryptoKey} aesKey key to encrypt with, must be an AES-GCM key
     * @returns a promise resolving to the encrypted string
     */
    async encryptSingle(plainText, aesKey) {
        const iv = this.crypto.getRandomValues(new Uint8Array(12));
        const encryptedContent = await this.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            aesKey,
            this.enc.encode(plainText)
        );

        const encryptedContentArr = new Uint8Array(encryptedContent);
        let buff = new Uint8Array(
            iv.byteLength + encryptedContentArr.byteLength
        );
        buff.set(iv, 0);
        buff.set(encryptedContentArr, iv.byteLength);
        return buff;
    }

    /**
     * Encrypt multiple item using the provided key using AES-GCM
     * @param {string[]} plainData data to encrypt
     * @param {CryptoKey} aesKey key to encrypt with, must be an AES-GCM key
     * @returns a promise resolving to the encrypted strings
     */
    async encryptMultiple(plainData, aesKey) {
        return await Promise.all(
            plainData.map(async (plainText) =>
                plainText
                    ? this.buff_to_base64(
                          await this.encryptSingle(plainText, aesKey)
                      )
                    : ''
            )
        );
    }

    /**
     * Decrypt multiple items using the provided key using AES-GCM
     * @param {string[]} cipherBuff data to decrypt
     * @param {CryptoKey} aesKey key to decrypt with, must be an AES-GCM key
     * @returns a promise resolving to the decrypted strings
     */
    async decryptMultiple(encryptedData, aesKey) {
        return await Promise.all(
            encryptedData.map((cipherText) =>
                cipherText
                    ? this.decryptSingle(this.base64_to_buf(cipherText), aesKey)
                    : ''
            )
        );
    }

    /**
     * Decrypt a single item using the provided key using AES-GCM
     * @param {Uint8Array} cipherBuff data to encrypt
     * @param {CryptoKey} aesKey key to decrypt with, must be an AES-GCM key
     * @returns a promise resolving to the decrypted string
     */
    async decryptSingle(cipherBuff, aesKey) {
        const iv = cipherBuff.slice(0, 12);
        const data = cipherBuff.slice(12);
        const decryptedContent = await this.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            aesKey,
            data
        );

        return this.dec.decode(decryptedContent);
    }

    /**
     * Create a wrapper key capable of wrapping/unwrapping other keys using AES-KW
     * @param {string} secret the secret to generate the key from
     * @param {Uint8Array} salt salt for generating key
     * @param {boolean} isWrap if true, get a wrapping key else unwrapping key
     * @returns a Cryptokey capable of wrapping/unwrapping other keys
     */
    getWrapperKey(secret, salt, isWrap) {
        return this.getPasswordKey(secret).then((key) =>
            this.deriveKey(key, salt, 'AES-KW', [
                isWrap ? 'wrapKey' : 'unwrapKey',
            ])
        );
    }

    /**
     * Encrypt multiple items using the provided key using AES-GCM
     * @param {string[]} plainData data to encrypt
     * @param {string} key BASE64 representation of an exported AES-GCM key
     * @returns a promise resolving to the encrypted strings
     */
    async encryptData(plainData, key) {
        const aesKey = await this.crypto.subtle.importKey(
            'raw',
            this.base64_to_buf(key).buffer,
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );
        return await this.encryptMultiple(plainData, aesKey);
    }

    /**
     * Decrypt multiple items using the provided key using AES-GCM
     * @param {string[]} encryptedData
     * @param {string} key BASE64 representation of an exported AES-GCM key
     * @returns a promise resolving to the decrypted strings
     */
    async decryptData(encryptedData, key) {
        const aesKey = await this.crypto.subtle.importKey(
            'raw',
            this.base64_to_buf(key).buffer,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );
        return await this.decryptMultiple(encryptedData, aesKey);
    }

    /**
     * Encrypt multiple items using the provided password using AES-GCM
     * @param {string[]} plainSecrets data to encrypt
     * @param {string} password a password used to derive a key
     * @returns a promise resolving to the encrypted strings
     */
    async encryptSecrets(plainSecrets, password) {
        const wrapperSalt = this.crypto.getRandomValues(new Uint8Array(16));
        const passwordAES = await this.getPasswordKey(password).then((key) =>
            this.deriveKey(key, wrapperSalt, 'AES-GCM', ['encrypt'])
        );

        return await Promise.all(
            plainSecrets.map(async (plainSecret) => {
                const encryptedSecretBuff = await this.encryptSingle(
                    plainSecret,
                    passwordAES
                );
                const buff = new Uint8Array(
                    encryptedSecretBuff.length + wrapperSalt.length
                );
                buff.set(wrapperSalt, 0);
                buff.set(encryptedSecretBuff, wrapperSalt.length);

                return this.buff_to_base64(buff);
            })
        );
    }

    /**
     * Decrypt multiple items using the provided password using AES-GCM
     * @param {string[]} encryptedSecrets data to decrypt
     * @param {string} password a password used to derive a key
     * @returns a promise resolving to the decrypted strings
     */
    async decryptSecrets(encryptedSecrets, password) {
        const wrapperSalt = this.base64_to_buf(encryptedSecrets[0]).slice(
            0,
            16
        );
        const passwordAES = await this.getPasswordKey(password).then((key) =>
            this.deriveKey(key, wrapperSalt, 'AES-GCM', ['decrypt'])
        );

        return await Promise.all(
            encryptedSecrets.map(async (encryptedSecret) => {
                return this.decryptSingle(
                    this.base64_to_buf(encryptedSecret).slice(16),
                    passwordAES
                );
            })
        );
    }

    /**
     * Encrypt multiple items by using a recordKey in AES-GCM, generated if not provided, and wrap
     * the recordKey using a AES-KW key derived from the secret
     * @param {string[]} plainData data to encrypt
     * @param {string} secret a password used to derive a wrapping key
     * @param {string} recordKey optionally include the key to be used to encrypt data, same format as encryptData
     * @returns a promise resolving to the encrypted recordKey and encrypted strings in
     * [encryptedRecordKey, ...encryptedData] format
     */
    async encryptWrappedData(plainData, secret, recordKey) {
        const recordAES = recordKey
            ? await this.crypto.subtle.importKey(
                  'raw',
                  this.base64_to_buf(recordKey).buffer,
                  { name: 'AES-GCM' },
                  true,
                  ['encrypt']
              )
            : await this.crypto.subtle.generateKey(
                  { name: 'AES-GCM', length: 256 },
                  true,
                  ['encrypt']
              );
        const wrapperSalt = this.crypto.getRandomValues(new Uint8Array(16));
        const passwordAES = this.getWrapperKey(secret, wrapperSalt, true);

        const encryptedKey = passwordAES.then(async (key) => {
            const encrypted = new Uint8Array(
                await this.crypto.subtle.wrapKey(
                    'raw',
                    recordAES,
                    key,
                    'AES-KW'
                )
            );

            const buff = new Uint8Array(encrypted.length + wrapperSalt.length);
            buff.set(wrapperSalt, 0);
            buff.set(encrypted, wrapperSalt.length);
            return this.buff_to_base64(buff);
        });

        const encryptedRecords = this.encryptMultiple(plainData, recordAES);

        const [encryptedKeyStr, encryptedRecordsStr] = await Promise.all([
            encryptedKey,
            encryptedRecords,
        ]);

        return [encryptedKeyStr, ...encryptedRecordsStr];
    }

    /**
     * Decrypt multiple items by using the encryptedKey in AES-GCM, which is derived by unwrapping
     * it using an AES-KW key. The AES-KW key is derived from the secret.
     * @param {string[]} encryptedData data to encrypt
     * @param {string} encryptedKey the encrypted version of an AES-GCM key, in BASE64 format
     * @param {string} secret a password used to derive the unwrapping key
     * @returns a promise resolving to the decrypted recordKey (in BASE64) and encrypted strings in
     * [decryptedRecordKey, ...decryptedData] format
     */
    async decryptWrappedData(encryptedData, encryptedKey, secret) {
        const encryptedKeyBytes = this.base64_to_buf(encryptedKey);
        const wrapperSalt = encryptedKeyBytes.slice(0, 16);
        const passwordAES = await this.getWrapperKey(
            secret,
            wrapperSalt,
            false
        );
        const recordAES = await this.crypto.subtle.unwrapKey(
            'raw',
            encryptedKeyBytes.slice(16),
            passwordAES,
            'AES-KW',
            'AES-GCM',
            true,
            ['decrypt']
        );
        const decryptedData = this.decryptMultiple(encryptedData, recordAES);
        const recordKey = this.crypto.subtle.exportKey('raw', recordAES);

        return [
            this.buff_to_base64(new Uint8Array(await recordKey)),
            ...(await decryptedData),
        ];
    }

    /**
     * Generate a SHA-1 hash representation of the message
     * @param {string} message string to hash
     * @returns a SHA-1 hash representation of the message
     */
    // credits: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    async digestMessage(message) {
        const msgUint8 = this.enc.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    }
}

module.exports = CryptoService;
