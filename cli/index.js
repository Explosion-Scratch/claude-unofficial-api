#!/usr/bin/env node

import { Claude } from '../index.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as marked from 'marked';
import TerminalRenderer from 'marked-terminal';
import meow from 'meow';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import "dotenv/config";
import mime from 'mime-types';
import { homedir } from 'os';

marked.setOptions({ headerIds: false, mangle: false })
marked.setOptions({
    renderer: new TerminalRenderer(),
});

const HELP = `${chalk.bold.white("Usage")}:
!exit    Exit the program
!help    Show this message
!clear   Clear the console
!retry   Retry the last message
!files   Show the list of files uploaded to this conversation
!convos  List conversations

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
            { name: 'Clear conversations', value: 'clear' },
            ...(conversations.length ? [new inquirer.Separator()] : []),
            ...conversations.map(c => ({ name: c.name || chalk.dim.italic('No name'), value: c.name })),
        ];

        const { conversation } = await inquirer.prompt({
            name: 'conversation',
            type: 'list',
            message: 'Select a conversation:',
            choices: conversationOptions,
            loop: false,
        });

        if (conversation === 'clear') {
            const { answer } = await inquirer.prompt({
                name: 'answer',
                type: 'confirm',
                message: 'Are you sure you want to clear conversations?',
                default: false,
                choices: [{ name: 'Yes', value: true }, { name: 'No', value: false }],
                loop: false,
            })
            if (!answer) { console.error(chalk.bold.red('Aborting')); process.exit(0); }
            spinner.text = 'Clearing conversations...';
            spinner.start();
            await claude.clearConversations();
            spinner.text = 'Done';
            spinner.stop();
            console.log(chalk.bold.green('Done!'));
            process.exit(0);
        }

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
            if (!question.trim()?.length) {
                continue;
            }
            if (question.startsWith('!')) {
                question = question.replace("!", "")
            }
            const tq = question.trim().toLowerCase();
            if (tq === 'help') {
                console.log(HELP);
                continue;
            }
            if (tq === 'convos') {
                setTimeout(() => (console.clear(),main()));
                return;
            }
            if (tq === 'clear') {
                console.clear();
                console.log(chalk.dim.italic.gray("Cleared console"))
                continue;
            }
            if (tq === 'export') {
                const filename = `conversation-${selectedConversation.conversationId}.json`;
                writeFileSync(filename, JSON.stringify(await selectedConversation.getInfo(), null, 2))
                console.log(chalk.bold.blue('Exported current conversation to ' + chalk.bold.white(filename)))
                continue;
            }
            if (tq === 'exit' || tq === 'quit') {
                process.exit(0);
            }
            if (tq === 'delete') {
                let sp = ora('Deleting conversation...').start();
                await selectedConversation.delete();
                sp.stop();
                setTimeout(() => (console.clear(), main()));
                return;
            }
            if (tq === 'files') {
                if (!selectedConversation) {
                    console.error(chalk.red.bold('No conversation selected'));
                    continue;
                }
                const messages = await selectedConversation.getMessages();
                const attachments = messages.map(i => i.attachments).flat();
                if (!attachments?.length) {
                    console.log(chalk.bold.italic.blue('No files uploaded yet!') + '\n\n' + chalk.gray.dim('Examples of uploading a file:\n\n' + chalk.bold.white('Find some trends in [data.csv]') + '\n\nOr:\n\n' + chalk.bold.white('claude --files file1.txt,file2.txt')));
                    continue;
                }
                const TABLE = '| File Name | Size | Tokens | Created At |\n|-|-|-|-|\n' + attachments.map(i => `| ${chalk.bold.white(i.file_name)} ${chalk.dim.gray.italic(`(${i.file_type})`)} | ${chalk.yellowBright(formatBytes(i.file_size))} | ${chalk.dim.blue("~ " + Math.round(i.extracted_content.length / 4) + " tokens")} | ${i.created_at} | `).join('\n') + `\n| ${chalk.gray.dim.italic('Total: ' + attachments.length + ' file' + (attachments.length > 1 ? 's' : ''))} | ${chalk.yellowBright(formatBytes(attachments.reduce((a, b) => a + b.file_size, 0)))} | ${chalk.dim.blue('~ ' + Math.round(attachments.reduce((a, b) => a + b.extracted_content.length / 4, 0)) + ' tokens')} |  |\n`;
                console.log(md(TABLE));
                continue;
            }
            console.log(chalk.gray.dim.italic('Asking claude'));
            const params = {
                attachments: [],
            }
            if (tq === 'retry') {
                params.retry = true
                question = "";
            }
            const spinner = ora(params.retry ? 'Retrying message' : 'Thinking...').start();
            let text = chalk.dim.gray(`Waiting for Claude (${MODEL})...`);
            const cb = (msg) => {
                if (!msg.completion) { return }
                text = msg.completion;
                spinner.text = chalk.gray.dim(params.retry ? 'Re-generating...' : 'Generating...') + '\n' + md(msg.completion);
                spinner.render();
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
        key = readFileSync(cli.flags.key.replace(`~`, homedir()), 'utf-8').trim()
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
        new File([readFileSync(filename)], filename.split('/').slice(-1)[0], { type: mime.lookup(filename) })
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

// https://stackoverflow.com/a/42408230
function formatBytes(n) {
    const k = n > 0 ? Math.floor((Math.log2(n) / 10)) : 0;
    const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'b';
    const count = Math.floor(n / Math.pow(1024, k));
    return count + rank;
}