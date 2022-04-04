declare const parser: {
    extractDomain: (url: string) => string;
    isBase32: (text: string) => boolean;
    isEmail: (email: string) => boolean;
    isSortValid: (sortType: string) => boolean;
};
export default parser;
