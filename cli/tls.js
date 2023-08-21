import tls from 'cycletls';

const CONSTANTS = {
    domain: 'claude.ai',
}

export const CLIENTS = [
    {
        name: 'My Web Browser (lol)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,17513-16-13-18-43-45-11-10-35-0-65281-23-51-5-27-21,29-23-24,0',
        ja3n: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-5-10-11-13-16-18-21-23-27-35-43-45-51-17513-65281,29-23-24,0',
        headers: {
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
        }
    }
]

let initPRes;
const initP = new Promise(r => (initPRes = r));
let cycleTLS;
tls().then(r => {
    cycleTLS = r
    initPRes(r)
})
export default async function fetch(url, options) {
    await initP;
    const client = CLIENTS[0];
    let cookies = [];
    if (options.headers?.cookie) {
        cookies = Object.entries(getCookies(options.headers.cookie)).map(([key, value]) => {
            return {
                name: key,
                value,
                domain: CONSTANTS.domain,
                httpOnly: true,
            }
        });
        delete options.headers.cookie;
    }
    const OPTIONS = {
        headers: {
            ...(options.headers || {}),
            ...client.headers,
            "Referer": `https://${CONSTANTS.domain}/`,
        },
        Cookies: cookies,
        method: options.method || 'get',
        userAgent: client.userAgent,
        ja3: client.ja3,
        body: options.body || undefined,
    }
    let res = await cycleTLS(url, OPTIONS)
    const fakeResponse = {
        status: res.status,
        headers: res.headers,
        text: Promise.resolve(res.body),
        ok: res.status >= 200 && res.status < 300,
        json: () => {
            return new Promise((resolve, reject) => {
                if (typeof res.body === 'object') {
                    resolve(res.body);
                }
                try {
                    resolve(JSON.parse(res.body));
                } catch (e) {
                    console.log({ body: res.body, type: typeof res.body });
                    reject(e);
                }
            })
        },
        blob: Promise.resolve(new Blob([res.body])),
    };
    return {
        ...fakeResponse, clone: () => ({ ...fakeResponse })
    };
}

function getCookies(cookiesString) {
    return cookiesString.split(";")
        .map(function (cookieString) {
            return cookieString.trim().split("=");
        })
        .reduce(function (acc, curr) {
            acc[curr[0]] = curr[1];
            return acc;
        }, {});
}