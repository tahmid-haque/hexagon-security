const { parse } = require('psl');

/**
 * Parser module for general purpose parsing utilities
 */
const parser = (function () {
    'use strict';
    const module = {
        /**
         * Extract the domain from a URL
         * @param {string} url URL to extract from
         * @returns the domain of the URL, throws Error on failure
         */
        extractDomain: (url) => {
            let urlObj;
            if (!url.startsWith('http://') && !url.startsWith('https://'))
                url = 'https://' + url;

            try {
                urlObj = new URL(url);
            } catch (error) {
                throw new Error('url is invalid!');
            }

            const parsed = parse(urlObj.hostname);
            if (parsed.error) throw new Error('url is not parseable!');

            const domain = parsed.domain;
            if (!domain) throw new Error('no domain detected!');
            return domain.toLowerCase();
        },
        /**
         * Determine whether a string is BASE32 encoded
         * @param {string} text string to check
         * @returns true if the string is BASE32 encoded, else false
         */
        isBase32: (text) => {
            // sourced from https://stackoverflow.com/questions/53600848/how-to-check-if-a-string-is-base32-encoded-in-javascript
            const matcher = /^[A-Z2-7]+=*$/;
            return text.length % 8 === 0 && matcher.test(text);
        },
        /**
         * Determine whether a string is an email
         * @param {string} email string to check
         * @returns true if the string is an email, else false
         */
        isEmail: (email) => {
            // taken from https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
            const emailMatcher =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return emailMatcher.test(email);
        },
        isSortValid: (sortType) => sortType === 'asc' || sortType === 'desc',
    };
    return module;
})();

module.exports = parser;
