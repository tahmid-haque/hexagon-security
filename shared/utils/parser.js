import { parse } from 'psl';

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
    };
    return module;
})();

export default parser;
