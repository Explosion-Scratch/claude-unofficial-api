#!/usr/bin/env node

import { Claude } from 'claude-ai';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as marked from 'marked';
import TerminalRenderer from 'marked-terminal';
import meow from 'meow';
import { existsSync, readFileSync } from 'fs';
import "dotenv/config";
import mime from 'mime-types';

marked.setOptions({ headerIds: false, mangle: false })
marked.setOptions({
    renderer: new TerminalRenderer(),
});

const HELP = `${chalk.bold.white("Usage")}:
!exit    Exit the program
!help    Show this message
!clear   Clear the console

(Also works with single word commands like "exit", "help" or "clear")`

const cli = meow(`
  Usage
    $ claude [options]

  Options
    ${chalk.bold.white("--conversation-id")}  Conversation ID to continue
    ${chalk.bold.white("--json")}             Print response as JSON
    ${chalk.bold.white("--files")}            Comma-separated list of files to attach
    ${chalk.bold.white("--help")}             Show this message
    ${chalk.bold.white("--model")}            Claude model to use
    ${chalk.bold.white("--markdown")}         Whether to render markdown in the terminal (defaults to true)
    ${chalk.bold.white("--key")}              Path to a text file containing the sessionKey cookie value from https://claude.ai
  
  Examples
    $ claude --conversation-id fc6d1a1a-8722-476c-8db9-8a871c121ee9
    $ claude --json
    $ claude --files file1.txt,file2.txt
    $ echo "hello world" | claude
`, {
    importMeta: import.meta,
    flags: {
        markdown: {
            type: 'boolean',
            default: true,
        },
        conversationId: {
            type: 'string'
        },
        json: {
            type: 'boolean',
            default: false,
        },
        files: {
            type: 'string'
        },
        model: {
            type: 'string',
            choices: ['claude-2', 'claude-instant-100k', 'claude-1', 'claude-1.3'],
            default: 'claude-2'
        },
        key: {
            type: 'string',
            default: '~/.claude_key'
        }
    }
});

const WELCOME_MESSAGE = chalk.bold.green('Welcome to the Claude CLI!');

let MODEL = 'claude-2'
const claude = new Claude({
    sessionKey: getKey(),
});

async function main() {
    const { flags } = cli;
    await claude.init();
    MODEL = cli.flags.model;
    if (cli.input.length) {
        let message = cli.input.join(' ')
        const info = {
            convos: []
        }
        let params = {
            model: MODEL,
            done: (a) => {
                if (!a.completion) {
                    console.error(chalk.red.bold('Error: No response'));
                    process.exit(1);
                }
                console.log(cli.flags.json ? JSON.stringify(a) : cli.flags.markdown ? md(a.completion) : a.completion);
                process.exit(0);
            },
            attachments: [],
        }

        if (flags.files) {
            for (let fileName of flags.files.trim().split(',').map(i => i.trim())) {
                const fileContent = await uploadFile(claude, fileName);
                params.attachments.push(fileContent);
            }
        }
        const r = await getFiles(message, claude);
        params.attachments.push(...r.attachments);
        message = r.question;
        if (flags.conversationId) {
            info.convos = await claude.getConversations();
            info.conversation = info.convos.find(c => c.id === flags.conversationId || c.name === flags.conversationId);
            if (!info.conversation) {
                console.error(chalk.red.bold('Conversation not found:'))
                console.log(chalk.dim.gray(info.convos.map(i => `${i.name} (${i.id})`).join('\n')));
                process.exit(1);
            }
            info.conversation.sendMessage(message, {
                ...params
            })
        } else {
            await claude.startConversation(message, {
                ...params
            })
        }
    } else {
        console.log(WELCOME_MESSAGE);
        let spinner = ora('Loading conversations...').start();
        const conversations = await claude.getConversations().then(c => c.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        spinner.stop();

        const conversationOptions = [
            { name: 'Start new conversation', value: 'start_new' },
            new inquirer.Separator(),
            ...conversations.map(c => ({ name: c.name || chalk.dim.italic('No name'), value: c.name })),
        ];

        const { conversation } = await inquirer.prompt({
            name: 'conversation',
            type: 'list',
            message: 'Select a conversation:',
            choices: conversationOptions,
            loop: false,
        });

        let selectedConversation;

        if (conversation !== 'start_new') {
            selectedConversation = conversations.find(c => c.name === conversation);
        }

        while (true) {

            let { question } = await inquirer.prompt({
                name: 'question',
                type: 'input',
                message: chalk.dim.gray(`(${MODEL})`) + chalk.bold.cyan(' >'),
            });
            if (question.startsWith('!')) {
                question = question.replace("!", "")
            }
            const tq = question.trim().toLowerCase();
            if (tq === 'help') {
                console.log(HELP);
                continue;
            }
            if (tq === 'clear') {
                console.clear();
                console.log(chalk.dim.italic.gray("Cleared console"))
                continue;
            }
            if (tq === 'export') {
                // TODO:
                continue;
            }
            if (tq === 'exit') {
                process.exit(0);
            }
            console.log(chalk.gray.dim.italic('Asking claude'));
            const spinner = ora('Thinking...').start();
            let text = chalk.dim.gray(`Waiting for Claude (${MODEL})...`);
            const cb = (msg) => {
                if (!msg.completion){return}
                text = msg.completion;
                spinner.text = chalk.gray.dim('Generating...') + '\n' + md(msg.completion);
            }
            const params = {
                attachments: [],
            }
            const r = await getFiles(question, claude);
            question = r.question;
            params.attachments = r.attachments;

            if (!selectedConversation) {
                selectedConversation = await claude.startConversation(question, {
                    progress: cb,
                    MODEL,
                    ...params,
                });
            } else {
                await selectedConversation.sendMessage(question, {
                    progress: cb,
                    MODEL,
                    ...params,
                })
            }
            spinner.stop();
            spinner.clear();
            console.log(chalk.gray.dim(`${new Date().toLocaleTimeString()} - (${MODEL})`) + '\n\n' + md(text) + '\n')
        }
    }
}

main();
function md(text) {
    return marked.parse(text?.trim() || '')?.trim();
}

function getKey() {
    const START_SEQ = 'sk-ant-sid01';
    if (cli.flags.key.startsWith(START_SEQ)) {
        return cli.flags.key;
    }
    let key;
    try {
        key = readFileSync(cli.flags.key, 'utf-8').trim()
    } catch (e) { }
    key = process.env.CLAUDE_KEY || key;
    if (!key || !key.startsWith(START_SEQ)) {
        if (!key) {
            console.error(chalk.red.bold('Error: No sessionKey cookie'));
            process.exit(1);
        }
        key = getCookie(key, key);
    }
    if (!key || !key.startsWith(START_SEQ)) {
        console.error(chalk.red.bold('Error: No sessionKey cookie'));
        process.exit(1);
    }
    return key.trim();
}

function getCookie(name, cookie) {
    function escape(s) { return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1'); }
    var match = cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : null;
}

async function uploadFile(claude, filename) {
    if (!existsSync(filename)) {
        console.error(chalk.red.bold(`Error: File not found: ${filename}`));
        process.exit(1);
    }
    console.log(chalk.gray.dim.italic('Uploading file ' + filename));
    const attachment = await claude.uploadFile(
        new File([readFileSync(filename, 'utf-8')], filename.split('/').slice(-1)[0], { type: mime.lookup(filename) })
    );
    console.log(chalk.gray.dim.italic('Uploaded file ' + filename));
    return attachment;
}

async function getFiles(text, claude) {
    let attachments = [];
    let question = text;
    const regex = /\[([^\]]+)]/g;
    let match;
    while (match = regex.exec(question)) {
        const filename = match[1];
        attachments.push(await uploadFile(claude, filename));
        question = question.replace(match[0], `the uploaded file ${filename}`);
    }
    return { attachments, question }
}