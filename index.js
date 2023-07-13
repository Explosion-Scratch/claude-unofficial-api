/*
USAGE:

setTimeout(async () => {
    const c = new Claude({ sessionKey: SESSION_KEY_HERE });
    console.log(c);
    await c.init();
    await c.startConversation("What're some funny songs to listen to", {
        progress: (a) => {
            console.clear();
            console.log(a)
        }
    }).then((r) => {
        console.log('FINAL', r)
    })
})
*/

class Claude {
    constructor({ sessionKey }) {
        this.sessionKey = sessionKey;
    }

    async init() {
        const organizations = await this.getOrganizations();
        this.organizationId = organizations[0].uuid;
        this.recent_conversations = await this.getConversations();
    }

    async getOrganizations() {
        const response = await fetch("https://claude.ai/api/organizations", {
            headers: {
                "content-type": "application/json",
                "cookie": `sessionKey=${this.sessionKey}`
            }
        });
        return await response.json();
    }
    async startConversation(message, params) {
        const { uuid: convoID, name, summary, created_at, updated_at } = await fetch(`https://claude.ai/api/organizations/${this.organizationId}/chat_conversations`, {
            headers: {
                "content-type": "application/json",
                "cookie": `sessionKey=${this.sessionKey}`
            },
            method: 'POST',
            body: JSON.stringify({
                name: '',
                uuid: crypto.randomUUID(),
            })
        }).then(r => r.json());
        const convo = new Conversation(this, { conversationId: convoID, name, summary, created_at, updated_at });
        await convo.sendMessage(message, params)
        await fetch(`https://claude.ai/api/generate_chat_title`, {
            headers: {
                "content-type": "application/json",
                "cookie": `sessionKey=${this.sessionKey}`
            },
            body: JSON.stringify({
                organization_uuid: this.organizationId,
                conversation_uuid: convoID,
                message_content: message,
                recent_titles: this.recent_conversations.map(i => i.name),
            }),
            method: 'POST'
        }).then(r => r.json()).then(json => {
            console.log('generate title', json);
        });
        return convo;
    }
    async getConversations() {
        const response = await fetch(`https://claude.ai/api/organizations/${this.organizationId}/chat_conversations`, {
            headers: {
                "content-type": "application/json",
                "cookie": `sessionKey=${this.sessionKey}`
            }
        });
        const json = await response.json();
        console.log('get conversations json', json);
        return json.map(convo => new Conversation(this, { conversationId: convo.uuid, ...convo }));
    }
}

class Conversation {
    constructor(claude, { conversationId, name, summary, created_at, updated_at }) {
        this.claude = claude;
        this.conversationId = conversationId;
        Object.assign(this, { name, summary, created_at, updated_at })
    }

    async sendMessage(message, { model = "claude-2", done = () => { }, progress = () => { } } = {}) {
        const body = {
            organization_uuid: this.claude.organizationId,
            conversation_uuid: this.conversationId,
            text: message,
            attachments: [],
            completion: {
                prompt: message,
                timezone: "America/New_York",
                model,
            }
        };
        console.log(body);
        const response = await fetch("https://claude.ai/api/append_message", {
            method: "POST",
            headers: {
                "accept": "text/event-stream,text/event-stream",
                "content-type": "application/json",
                "cookie": `sessionKey=${this.claude.sessionKey}`
            },
            body: JSON.stringify(body)
        });
        let resolve;
        let returnPromise = new Promise(r => (resolve = r));
        readStream(response, (a) => {
            let parsed = JSON.parse(a.toString().split('data:')?.[1]?.trim() || "{}");
            progress(parsed);
            if (parsed.stop_reason === 'stop_sequence') {
                done(parsed);
                progress(parsed);
                resolve(parsed);
            }
        })
        return returnPromise;
    }

    async getInfo() {
        const response = await fetch(`https://claude.ai/api/organizations/${this.claude.organizationId}/chat_conversations/${this.conversationId}`, {
            headers: {
                "content-type": "application/json",
                "cookie": `sessionKey=${this.claude.sessionKey}`
            }
        });
        return await response.json();
    }
}

async function readStream(response, progressCallback) {
    const reader = response.body.getReader();
    let received = 0;
    let chunks = [];
    let loading = true;
    while (loading) {
        const { done, value } = await reader.read();
        if (done) {
            loading = false;
            break;
        }
        chunks.push(value);
        received += value?.length || 0;
        if (value) { progressCallback(new TextDecoder('utf-8').decode(value)); }
    }

    let body = new Uint8Array(received);
    let position = 0;

    for (let chunk of chunks) {
        body.set(chunk, position);
        position += chunk.length;
    }

    return new TextDecoder('utf-8').decode(body);
}
