<h1><div align=center><a href="https://github.com/explosion-scratch/claude-unofficial-api">claude-unofficial-api</a></div></h1>

https://github.com/Explosion-Scratch/claude-unofficial-api/assets/61319150/6c3f706d-bddf-42e6-9745-aa1f7561ca40

This is a lightweight (isomorphic, 0 dependency) JavaScript library for interacting with the [Claude AI](https://www.claude.ai/) chatbot's unofficial internal API. [CLI installation](#cli-installation), [API installation + usage](#usage)
  
## Features
- 💬 Start new conversations
- 📎 Upload files
- 🌎 Isomorphic (supposing you setup a proxy, cors make me sad)
- 🔄 Async/await ready with modern syntax
- 💾 Get and respond to existing conversations
- 🚀 Upcoming
  - CLI: Retrying responses, [Reflexion](https://arxiv.org/abs/2303.11366) implementation, prompt templates, auto conversation saving
  - API: Better error handling, automated unit tests, caching layer, searching, `setActiveModel`, list available models, send message directly to existing conversation, hooks for events
- 💪 Supports all claude models (`claude-2`, `claude-1.3`, `claude-instant-100k` - See `--model` flag)


## Installation

```
npm install claude-ai
```

## CLI installation
```
npm install -g claude-cli
```
> **Note**
> Run `claude --help` or see [CLI_DOCS.md](CLI_DOCS.md) for more info about the CLI

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
const Claude = require('claude-ai');

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

**Constructor:**
```js
const claude_instance = new Claude({
  sessionKey: string,
  proxy: string | ({endpoint, options}) => ({endpoint, options})
})
```

- If proxy is a function it will be passed the API route to fetch as well as the fetch options which can then be manipulated before running through fetch. If you're feeling adventurous you could also just modify the `claude.request` functionnn (see source for more info)
- If `proxy` is a string, it will simply be prepended before the API endpoint, example: `https://claude.ai/` 

**Parameters:**

- `sessionKey` - Your Claude `sessionKey` cookie 

**Methods (on an instance):**

- `startConversation(prompt)` - Starts a new conversation with the given prompt message
- `getConversations()` - Gets recent conversations
- `clearConversations()` - Clear all conversations
- `uploadFile(file)` - Uploads a file 

### `Conversation`

Returned by `Claude.startConversation()`. 

**Methods:**

- `sendMessage(message, options)` - Sends a followup message in the conversation  
- `getInfo()` - Gets the conversation (includes messages, name, created_at, update_at, etc)
- `delete()` - Delete the conversation (returns fetch response)

**SendMessage Options:**

- `timezone` - The timezone for completion 
- `attachments` - Array of file attachments 
- `model` - The Claude model to use (default: `claude-2`, other models that I know of include `claude-1.3`, and `claude-instant-100k`. Seems to also accept `claude-1` but transform it to `claude-1.3`)
- `done` - Callback when completed
- `progress` - Progress callback

## Contributing

Contributions welcome! This library was created by @Explosion-Scratch on GitHub. Please submit PRs to help improve it.
