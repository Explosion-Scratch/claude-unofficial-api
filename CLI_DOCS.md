# CLI Docs

## Usage

```
$ claude [input] [options]
```

| Option | Default | Description |
|--------|---------|-------------|
| `--conversation-id` |  | Conversation ID to continue |
| `--json` | `false` | Print response as JSON |
| `--files` |  | Comma-separated list of files to attach | 
| `--help` |  | Show help message |
| `--model` | `claude-2` | Claude model to use |
| `--markdown` | `true` | Whether to render markdown in the terminal |
| `--key` | `~/.claude_key` | Path to a text file containing the sessionKey cookie value from https://claude.ai |

## Examples

```
$ claude --conversation-id fc6d1a1a-8722-476c-8db9-8a871c121ee9
```

Continue an existing conversation by ID 

```
$ claude --json
```

Print responses in JSON format

```
$ claude --files file1.txt,file2.txt
```

Attach files file1.txt and file2.txt to the conversation

```
$ claude --model claude-1
``` 

Use the claude-1 model

```
$ echo "hello world" | claude
```

Pipe input to claude

## Installation

```
$ npm install claude-cli
```

```
claude --version
```