<h1><div align=center><a href="https://github.com/explosion-scratch/claude-unofficial-api">claude-unofficial-api</a></div></h1>

https://github.com/Explosion-Scratch/claude-unofficial-api/assets/61319150/6c3f706d-bddf-42e6-9745-aa1f7561ca40

This is a lightweight JavaScript library for interacting with the [Claude AI](https://www.claude.ai/) chatbot's unofficial internal API. 
  
## Features
- 💬 Start new conversations
- 📎 Upload files 
- 🔄 Async/await ready with modern syntax
- 💾 Get and respond to existing conversations
- 🚀 Upcoming: Retrying responses, deleting responses, proxy support


## Installation

```
npm install claude-ai
```

## Usage

First, import the library:

```js
const Claude = require('claude-ai'); 
```

Initialize a new Claude instance with your session key:

> **Note**
> Get `sessionKey` from the `sessionKey` cookie via the Claude website.

```js
const claude = new Claude({
  sessionKey: 'YOUR_SESSION_KEY' 
});
```

Start a conversation by calling `startConversation()` with a prompt message (or get existing conversations via `.getConversations()`):

```js
const conversation = await claude.startConversation('Hello Claude!');
```

The `Conversation` instance exposes methods like `sendMessage()` to continue the chat:

```js 
await conversation.sendMessage('How are you today?');
```

The full code would look like:

```js
const Claude = require('claude-ai-js');

const claude = new Claude({
  sessionKey: 'YOUR_SESSION_KEY'
});

const conversation = await claude.startConversation('Hello Claude!');

await conversation.sendMessage('How are you today?');
```

See the [documentation](#documentation) below for the full API reference.

## Documentation

### `Claude`

The main class for interfacing with the Claude API.

**Parameters:**

- `sessionKey` - Your Claude `sessionKey` cookie 

**Methods:**

- `startConversation(prompt)` - Starts a new conversation with the given prompt message
- `getConversations()` - Gets recent conversations
- `uploadFile(file)` - Uploads a file 

### `Conversation`

Returned by `Claude.startConversation()`. 

**Methods:**

- `sendMessage(message, options)` - Sends a followup message in the conversation  
- `getInfo()` - Gets the conversation (includes messages, name, created_at, update_at, etc)

**SendMessage Options:**

- `timezone` - The timezone for completion  
- `attachments` - Array of file attachments 
- `model` - The Claude model to use (default: `claude-2`)
- `done` - Callback when completed
- `progress` - Progress callback

## Contributing

Contributions welcome! This library was created by @Explosion-Scratch on GitHub. Please submit PRs to help improve it.
