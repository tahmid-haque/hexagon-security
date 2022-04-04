const { parse } = require('psl');

const parser = (function () {
    'use strict';
    const module = {
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
        isBase32: (text) => {
            // sourced from https://stackoverflow.com/questions/53600848/how-to-check-if-a-string-is-base32-encoded-in-javascript
            const matcher = /^[A-Z2-7]+=*$/;
            return text.length % 8 === 0 && matcher.test(text);
        },
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
