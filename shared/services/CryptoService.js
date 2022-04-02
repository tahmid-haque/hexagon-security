// sourced from https://github.com/bradyjoslin/webcrypto-example

export default class CryptoService {
    crypto;
    enc = new TextEncoder();
    dec = new TextDecoder('utf-8');

    constructor(crypto) {
        this.crypto = crypto;
    }

    buff_to_base64(buff) {
        return btoa(String.fromCharCode.apply(null, Array.from(buff)));
    }

    base64_to_buf(b64) {
        return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    }

    getPasswordKey(password) {
        return this.crypto.subtle.importKey(
            'raw',
            this.enc.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
    }

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

    async encryptMultiple(plainData, aesKey) {
        return await Promise.all(
            plainData.map(async (plainText) =>
                this.buff_to_base64(await this.encryptSingle(plainText, aesKey))
            )
        );
    }

    async decryptMultiple(encryptedData, aesKey) {
        return await Promise.all(
            encryptedData.map((cipherText) =>
                this.decryptSingle(this.base64_to_buf(cipherText), aesKey)
            )
        );
    }

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

    getWrapperKey(secret, salt, isWrap) {
        return this.getPasswordKey(secret).then((key) =>
            this.deriveKey(key, salt, 'AES-KW', [
                isWrap ? 'wrapKey' : 'unwrapKey',
            ])
        );
    }

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

    async encryptWrappedData(plainData, secret) {
        const recordAES = await this.crypto.subtle.generateKey(
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
