import CryptoService from 'hexagon-shared/services/CryptoService';

const cryptoService = new CryptoService(window.crypto);

export const getWrapperKey = cryptoService.getWrapperKey.bind(cryptoService);
export const encryptData = cryptoService.encryptData.bind(cryptoService);
export const decryptData = cryptoService.decryptData.bind(cryptoService);
export const encryptWrappedData =
    cryptoService.encryptWrappedData.bind(cryptoService);
export const decryptWrappedData =
    cryptoService.decryptWrappedData.bind(cryptoService);
