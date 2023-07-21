import express from 'express';
import { Claude } from '../index.js';
import { readFileSync } from 'fs';
import bodyParser from 'body-parser';

const app = express();
app.set('json spaces', 2)


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const version = JSON.parse(readFileSync('package.json', 'utf-8')).version + ` (Claude v${JSON.parse(readFileSync('../package.json', 'utf-8')).version})`;

// Initialize Claude
const claude = new Claude({
    sessionKey: process.env.CLAUDE_KEY
});

app.use(async (req, res, next) => {
    if (!claude.ready) {
        await claude.init();
    }
    next();
})

app.get('/', (req, res) => {
    res.type('text/plain');
    res.send(`
    Claude REST API v${version}

    Routes:
    - GET /conversations - Get conversations
    - GET /conversations/:id - Get conversation detail
    - POST /conversations/:id - Send message
    - POST /conversations/:id/files - Upload file
    - GET /conversations/:id/files - Get files
    - DELETE /conversations/:id - Delete conversation  
    - PATCH /conversations/:id - Rename conversation
    - POST /ask - Sync ask
  `.split('\n').map(i => i.trim()).map(i => i.startsWith('-') ? '    ' + i : i).join('\n'));
});
app.get('/version', (req, res) => {
    res.type('text/plain')
    res.send(version);
});
app.get('/organizations', async (req, res) => {
    try {
        const organizations = await claude.getOrganizations();
        res.json(organizations);
    } catch (err) {
        res.status(500).send({ error: 'Failed to get organizations' });
    }
})
// Get conversations
app.get('/conversations', async (req, res) => {
    try {
        const conversations = await claude.getConversations();
        res.json(conversations);
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: 'Failed to get conversations' });
    }
});

// Get conversation details
app.get('/conversations/:id', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.id);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }
        res.json(await conversation.getInfo());
    } catch (err) {
        res.status(500).send({ error: 'Failed to get conversation' });
    }
});

// Delete conversation
app.delete('/conversations/:id', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.id);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        await conversation.delete();
        res.sendStatus(204);
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete conversation' });
    }
});

app.delete('/conversations', async (req, res) => {
    try {
        await claude.clearConversations();
        res.sendStatus(204);
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete conversations' });
    }
})

// Rename conversation
app.patch('/conversations/:id', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.id);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        await conversation.rename(req.body.name);
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send({ error: 'Failed to rename conversation' });
    }
});

// Send message
app.post('/conversations/:id', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.id);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        // Stream progress
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const stream = conversation.sendMessage(req.body.message, {
            progress: (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)
        });

        stream.then(data => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            res.end();
        });

    } catch (err) {
        res.status(500).send({ error: 'Failed to send message' });
    }
});

// Get files for conversation
app.get('/conversations/:id/files', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.id);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        const files = await conversation.getFiles();
        res.json(files);

    } catch (err) {
        res.status(500).send({ error: 'Failed to get files' });
    }
});

// Upload file
app.post('/conversations/:id/files', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.id);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        const file = req.files.file;
        const result = await conversation.uploadFile(file);
        res.json(result);

    } catch (err) {
        res.status(500).send({ error: 'Failed to upload file' });
    }
});

// Message feedback
app.post('/conversations/:conversationId/messages/:messageId/feedback', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.conversationId);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        const message = conversation.getMessage(req.params.messageId);
        if (!message) {
            return res.status(404).send({ error: 'Message not found' });
        }

        await message.sendFeedback(req.body.type, req.body.reason);
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send({ error: 'Failed to send feedback' });
    }
});

// Get messages
app.get('/conversations/:conversationId/messages', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.conversationId);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        const messages = await conversation.getMessages();
        res.json(messages);

    } catch (err) {
        res.status(500).send({ error: 'Failed to get messages' });
    }
});

// Retry conversation
app.post('/conversations/:conversationId/retry', async (req, res) => {
    try {
        const conversation = await claude.getConversation(req.params.conversationId);
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        await conversation.retry();
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send({ error: 'Failed to retry conversation' });
    }
});

// Sync ask route
app.post('/ask', async (req, res) => {
    try {
        const conversation = await claude.startConversation(req.body.message);
        const response = await conversation.sendMessage(req.body.message);
        res.json(response);
    } catch (err) {
        res.status(500).send({ error: 'Failed to get response' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Claude REST API v${version} running on port ${PORT}`);
});
