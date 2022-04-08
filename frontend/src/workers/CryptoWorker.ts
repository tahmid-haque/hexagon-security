/**
 * Web worker file to run cryptographic operations. Delegates to a service.
 */

import CryptoService from 'hexagon-shared/services/CryptoService';

const cryptoService = new CryptoService(window.crypto);

export const encryptData = cryptoService.encryptData.bind(cryptoService);
export const encryptWrappedData =
    cryptoService.encryptWrappedData.bind(cryptoService);
export const decryptWrappedData =
    cryptoService.decryptWrappedData.bind(cryptoService);
export const digestMessage = cryptoService.digestMessage.bind(cryptoService);
