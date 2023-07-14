# Docs

## Installation

```bash
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

### `Claude` class

The main class for interfacing with the Claude API.

#### Constructor

```js
const claude = new Claude({
  sessionKey: string,
  proxy: string | function 
})
```

- `sessionKey` <string> - Your Claude `sessionKey` cookie
- `proxy` <string | function> 
  - If `proxy` is a string, it will be prepended before the API endpoint, example: `https://claude.ai/`
  - If `proxy` is a function, it will be passed the API route to fetch as well as the fetch options which can then be manipulated before running through fetch.

#### Methods

- `startConversation(prompt, params)` <Promise<Conversation>> - Starts a new conversation with the given prompt message

  - `prompt` <string> - The initial prompt for the conversation
  - `params` <object> - The parameters to pass to the initial `sendMessage` call.

- `getConversations()` <Promise<Conversation[]>> - Gets recent conversations

- `clearConversations()` <Promise<Response[]>> - Clear all conversations 

- `uploadFile(file)` <Promise<Attachment>> - Uploads a file

  - `file` <File> - File object to upload

### `Conversation` class 

Returned by `Claude.startConversation()`.

#### Methods

- `sendMessage(message, options)` <Promise<Message>> - Sends a followup message in the conversation

  - `message` <string> - The message to send
  - `options` <object> 
    - `timezone` <string> - The timezone for completion (default: `"America/New_York"`)
    - `attachments` <File[]> - Array of file attachments
    - `model` <string> - The Claude model to use (default: `"claude-2"`)
    - `done` <function> - Callback when completed
    - `progress` <function> - Progress callback

- `getInfo()` <Promise<Conversation>> - Gets the conversation info (includes messages, name, created_at, updated_at, etc)

- `delete()` <Promise<Response>> - Delete the conversation

#### Callbacks

- `done(response)`

  - `response` <object>
    - `completion` <string> - The text response from Claude

- `progress(response)`

  - `response` <object> 
    - `completion` <string> - The text response from Claude (if available)

### Types
```ts
type Attachment {
    modified_at: string
    created_at: string
    filetype: string
    size: int
}
```

```ts
type Message {
    attachments: Attachment[]
    chat_feedback: ??
    edited_at: string?
    index: int
    sender: 'human' | 'assistant'
    text: string
    created_at: string
    updated_at: string
    uuid: string
}
```

## CLI

The `claude-cli` CLI tool is also available:

```
npm install -g claude-cli
```

```
Usage:
  claude [options]

Options:

  --conversation-id  Conversation ID to continue
  --json             Print response as JSON
  --files            Comma-separated list of files to attach 
  --help             Show help message
  --model            Claude model to use (default: claude-2)
  --markdown         Whether to render markdown in the terminal (default: true)
  --key              Path to a text file containing the sessionKey cookie value

Examples:

  claude --conversation-id fc6d1a1a-8722-476c-8db9-8a871c121ee9
  claude --json
  claude --files file1.txt,file2.txt
  echo "hello world" | claude
```

## Contributing

Contributions welcome! This library was created by @Explosion-Scratch on GitHub. Please submit PRs to help improve it.