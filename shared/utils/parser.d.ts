declare const parser: {
    extractDomain: (url: string) => string;
    isBase32: (text: string) => boolean;
};
export default parser;
