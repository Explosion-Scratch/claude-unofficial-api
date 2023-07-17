import Claude, { Conversation, Message } from './index.js';
import "dotenv/config";
import { readFileSync } from 'fs';

const UUIDS = {
    org: uuid(),
    conversation: uuid(),
    conversation2: uuid(),
    message: uuid(),
}
const demoFile = {
    "file_name": "test.txt",
    "file_type": "text/plain",
    "file_size": 11,
    "extracted_content": "Hello world",
}
const fetchCalls = [];

const mockResponse = () => ({
    body: {
        getReader: jest.fn().mockReturnValue({
            read: jest.fn().mockResolvedValueOnce({
                done: false,
                value: enc(`data: {"completion":" Hello","stop_reason":null,"model":"claude-2.0","stop":null,"log_id":"xxxxxx","messageLimit":{"type":"within_limit"}}`)
            }).mockResolvedValueOnce({
                done: false,
                value: enc(`data: {"completion":" world","stop_reason":"stop_sequence","model":"claude-2.0","stop":"\\n\\nHuman:","log_id":"xxxxxx","messageLimit":{"type":"within_limit"}}`)
            }).mockResolvedValueOnce({
                done: true,
                value: undefined
            })
        })
    }
})

function enc(str) {
    return new TextEncoder().encode(str);
}

global.fetch = jest.fn(async function fetchMock(url, params) {
    let response = {};
    if (url.endsWith('/api/organizations')) {
        response = [
            {
                "uuid": UUIDS.org,
                "name": "example@gmail.com's Organization",
                "join_token": "TOKEN",
                "created_at": "2023-07-11T15:29:40.405434+00:00",
                "updated_at": "2023-07-11T15:30:11.107886+00:00",
                "capabilities": [
                    "chat",
                    "legacy_non_strict_params"
                ],
                "settings": {
                    "claude_console_privacy": "default_private"
                },
                "active_flags": []
            }
        ]
    }
    if (url.endsWith('/api/append_message')) {
        return Promise.resolve(mockResponse());
    }
    if (url.endsWith('/api/rename_chat')) {
        response = {};
    }
    if (url.endsWith('/api/generate_chat_title')) {
        response = { title: 'Hello world' }
    }
    console.log(url);
    if (url.endsWith(`/api/organizations/${UUIDS.org}/chat_conversations/${UUIDS.conversation}`)) {
        response = {
            "uuid": "f8ed74dc-e586-4407-9a31-b694d53b6ce9",
            "name": "Hello World",
            "summary": "",
            "created_at": "2023-07-17T12:50:44.486672+00:00",
            "updated_at": "2023-07-17T12:51:06.068542+00:00",
            "chat_messages": [
                {
                    "uuid": "ee248d02-976b-4317-8da1-52a9db8a07ef",
                    "text": "hello",
                    "sender": "human",
                    "index": 0,
                    "created_at": "2023-07-17T12:51:05.921141+00:00",
                    "updated_at": "2023-07-17T12:51:05.921141+00:00",
                    "edited_at": null,
                    "chat_feedback": null,
                    "attachments": [demoFile]
                },
                {
                    "uuid": "1c7130af-9be9-4e4f-93d2-0011931f6bf8",
                    "text": "Hi there!",
                    "sender": "assistant",
                    "index": 1,
                    "created_at": "2023-07-17T12:51:06.068542+00:00",
                    "updated_at": "2023-07-17T12:51:06.068542+00:00",
                    "edited_at": null,
                    "chat_feedback": null,
                    "attachments": []
                }
            ]
        }
    }
    if (url.endsWith(`/api/organizations/${UUIDS.org}/chat_conversations`)) {
        response = [
            {
                "uuid": UUIDS.conversation,
                "name": "Hello world",
                "summary": "",
                "created_at": "2023-07-14T21:13:06.311109+00:00",
                "updated_at": "2023-07-14T21:13:07.818718+00:00"
            },
            {
                "uuid": UUIDS.conversation2,
                "name": "",
                "summary": "",
                "created_at": "2023-07-14T21:20:06.421771+00:00",
                "updated_at": "2023-07-14T21:23:09.117339+00:00"
            },
        ]
        if (params.method === 'POST') {
            response = {
                uuid: UUIDS.conversation,
                name: 'Test conversation',
                summary: '',
                "created_at": "2023-07-14T21:20:06.421771+00:00",
                "updated_at": "2023-07-14T21:23:09.117339+00:00"
            }
        }
    }
    if (url.endsWith('/test')) {
        response = {};
    }
    if (url.endsWith('/api/convert_document')) {
        response = {
            "file_name": "doc.docx",
            "file_size": 12242,
            "file_type": "docx",
            "extracted_content": "This is a demo file\n",
            "totalPages": null
        }
    }
    fetchCalls.push([url, response]);
    return {
        json: () => Promise.resolve(response || {}),
        status: 200,
    }
})

describe('Claude', () => {
    let claude;
    beforeEach(async () => {
        claude = new Claude({ sessionKey: 'sk-ant-sid01-*****' });
        if (!claude.ready) { await claude.init(); }
    })
    describe('constructor', () => {
        it('throws if no session key', () => {
            expect(() => new Claude({})).toThrow();
        });
        it('throws if conversation created when no claude', () => {
            expect(() => {
                new Conversation(null, { conversationId: UUIDS.conversation })
            }).toThrow()
        })
        it('works with a proxy', () => {
            const c = new Claude({
                sessionKey: 'sk-ant-sid01-*****',
                proxy: 'https://example.com'
            })
            expect(c.proxy).toBeInstanceOf(Function);
        })
        it('works with proxy functions', () => {
            const c = new Claude({
                sessionKey: 'sk-ant-sid01-*****',
                proxy: ({ endpoint, options }) => ({ endpoint: 'https://example.com' + endpoint, options })
            });
            expect(c.proxy).toBeInstanceOf(Function);
        })
        it('throws for invalid proxy', () => {
            expect(() => new Claude({
                sessionKey: 'sk-ant-sid01-*****',
                proxy: {}
            })).toThrow();
        })
        it('throws if invalid session key', () => {
            expect(() => new Claude({
                sessionKey: 'invalid',
            })).toThrow();
        });
    });

    describe('request', () => {
        it('makes request to default endpoint', async () => {
            let r = await claude.request('/test');
            expect(fetchCalls.pop()).toEqual(['https://claude.ai/test', {}])
        });
        it('works with proxies', async () => {
            claude.proxy = 'https://example.com'
            let r = await claude.request('/test');
            expect(fetchCalls.pop()).toEqual(['https://example.com/test', {}])
        })
    });
    describe('methods', () => {
        it('gets models', () => {
            expect(claude.models()).toBeInstanceOf(Array)
        })
        it('total tokens', () => {
            expect(claude.totalTokens()).toBe(100_000)
        })
        it('ready', async () => {
            expect(claude.ready).toBe(true);
        });
        it('clears conversations', async () => {
            const response = await claude.clearConversations()
            expect(response).toBeInstanceOf(Array);
            expect(response[0].json).toBeDefined()
        })
        it('gets conversation by ID', async () => {
            const convo = await claude.getConversation(UUIDS.conversation);
            expect(convo).toBeDefined();
            expect(convo.conversationId).toBe(UUIDS.conversation);
        })
        it('uploads files', async () => {
            const file = new File(["Hello world"], "test.txt", { type: 'text/plain' });
            const response = await claude.uploadFile(file)
            expect(response).toStrictEqual(demoFile)
        })
        it('gets files', async () => {
            const convo = await claude.getConversation(UUIDS.conversation);
            expect(await convo.getFiles()).toStrictEqual([demoFile])
        })
        it('uploads non-text files', async () => {
            const text = 'This is a demo file\n';
            const attachment = await claude.uploadFile(
                new File([readFileSync('resources/doc.docx')], 'doc.docx', {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                })
            );
            expect(attachment).toStrictEqual({
                "file_name": "doc.docx",
                "file_size": 12242,
                "file_type": "docx",
                "extracted_content": text,
                "totalPages": null
            })
        })
    })
    describe('startConversation', () => {
        it('starts new conversation', async () => {
            expect(claude.ready).toBe(true);
            const conversation = await claude.startConversation('Hi');

            expect(conversation).toBeInstanceOf(Conversation);
            expect(conversation.conversationId).toBeDefined();
        });
    });
})

describe('Message', () => {
    let message;
    let conversation;
    let claude;

    beforeEach(() => {
        claude = new Claude({
            sessionKey: 'sk-ant-sid01-*****',
        });
        conversation = new Conversation(claude, {
            conversationId: UUIDS.conversation,
        });
        message = new Message({ claude, conversation }, {
            uuid: UUIDS.message,
            text: 'hello',
            edited_at: '2023-07-11T15:30:11.107886+00:00',
            index: 0,
            attachments: [],
            chat_feedback: null,
            updated_at: '2023-07-11T15:30:11.107886+00:00'
        });
    });

    describe('constructor', () => {
        it('should throw when no claude/conversation', () => {
            expect(() => new Message({})).toThrow();
            expect(() => new Message({ claude: null, conversation })).toThrow();
            expect(() => new Message({ claude, conversation: null })).toThrow();
        })
        it('should work', async () => {
            const msg = new Message({ claude, conversation }, {
                uuid: UUIDS.message, text: 'hello',
                edited_at: '2023-07-11T15:30:11.107886+00:00',
                created_at: '2023-07-11T15:30:11.107886+00:00',
                index: 0,
                attachments: [],
                chat_feedback: null,
                sender: 'human',
                updated_at: '2023-07-11T15:30:11.107886+00:00'
            });
            expect(msg).toBeInstanceOf(Message);
            expect(msg.claude).toBe(claude);
            expect(msg.conversation).toBe(conversation);
        })
    })
    test('initializes with correct properties', () => {
        expect(message.uuid).toBe(UUIDS.message);
        expect(message.text).toBe('hello');
        expect(message.index).toBe(0);
    });

    test('isBot returns false for user message', () => {
        expect(message.isBot).toBe(false);
    });

    test('isBot returns true for assistant message', () => {
        message.sender = 'assistant';
        expect(message.isBot).toBe(true);
    });

    test('createdAt returns date object', () => {
        expect(message.createdAt).toBeInstanceOf(Date);
    });

    test('updatedAt returns date object', () => {
        expect(message.updatedAt).toBeInstanceOf(Date);
    });

    test('editedAt returns date object', () => {
        expect(message.editedAt).toBeInstanceOf(Date);
    });

    test('sendFeedback makes API request', async () => {
        const mockRequest = jest.fn(() => Promise.resolve());
        message.request = mockRequest;

        await message.sendFeedback('flag/bug', 'Typo');

        expect(mockRequest).toHaveBeenCalledWith(
            expect.stringContaining('chat_feedback'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    type: 'flag/bug',
                    reason: 'Typo'
                })
            })
        );
    });
});

describe('Conversation', () => {
    let conversation;
    let claude;

    beforeEach(async () => {
        claude = new Claude({
            sessionKey: 'sk-ant-sid01-*****',
        });
        await claude.init();
        conversation = new Conversation(claude, {
            conversationId: UUIDS.conversation,
        });
    });

    describe('sendMessage', () => {
        it('sends message', async () => {
            const fn = jest.fn();
            await conversation.sendMessage('Hi claude', { progress: fn })
            expect(fn).toHaveBeenCalledWith(expect.objectContaining({ completion: expect.any(String) }))
        });
    });

    describe('rename', () => {
        it('renames conversation', async () => {
            expect(await conversation.rename('New title')).toBeDefined();
        });
    });

    describe('getInfo', () => {
        it('gets conversation info', async () => {
            const res = await conversation.getInfo();
            expect(res).toBeDefined();
            res.chat_messages.forEach(a => expect(a).toBeInstanceOf(Message))
        });
    })
});

function uuid() {
    var h = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    var k = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', '-', 'x', 'x', 'x', 'x', '-', '4', 'x', 'x', 'x', '-', 'y', 'x', 'x', 'x', '-', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'];
    var u = '', i = 0, rb = Math.random() * 0xffffffff | 0;
    while (i++ < 36) {
        var c = k[i - 1], r = rb & 0xf, v = c == 'x' ? r : (r & 0x3 | 0x8);
        u += (c == '-' || c == '4') ? c : h[v]; rb = i % 8 == 0 ? Math.random() * 0xffffffff | 0 : rb >> 4
    }
    return u
}