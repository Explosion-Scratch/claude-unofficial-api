/**
 * The main Claude API client class.
 * @class
 * @classdesc Creates an instance of the Claude API client.
 */
export class Claude {
    /**
     * A UUID string
     * @typedef UUID
     * @example "222aa20a-bc79-48d2-8f6d-c819a1b5eaed"
     */
    /**
     * Create a new Claude API client instance.
     * @param {Object} options - Options
     * @param {string} options.sessionKey - Claude session key
     * @param {string|function} [options.proxy] - Proxy URL or proxy function
     * @param {function} [options.fetch] - Fetch function
     * @example
     * const claude = new Claude({
     *   sessionKey: 'sk-ant-sid01-*****',
     *   fetch: globalThis.fetch
     * })
     *
     * await claude.init();
     * claude.sendMessage('Hello world').then(console.log)
     */
    constructor({ sessionKey, proxy, fetch }: {
        sessionKey: string;
        proxy?: string | Function;
        fetch?: Function;
    });
    ready: boolean;
    proxy: Function;
    fetch: Function;
    sessionKey: string;
    /**
     * Get available Claude models.
     * @returns {string[]} Array of model names
     */
    models(): string[];
    /**
     * Get total token count for a Claude model.
     * @param {string} [model] - Claude model name
     * @returns {number} Total token count
     */
    totalTokens(model?: string): number;
    /**
     * Get the default Claude model.
     * @returns {string} Default model name
     */
    defaultModel(): string;
    /**
     * A partial or total completion for a message.
     * @typedef MessageStreamChunk
     * @property {String} completion The markdown text completion for this response
     * @property {String | null} stop_reason The reason for the response stop (if any)
     * @property {String} model The model used
     * @property {String} stop The string at which Claude stopped responding at, e.g. "\n\nHuman:"
     * @property {String} log_id A logging ID
     * @property {Object} messageLimit If you're within the message limit
     * @param {String} messageLimit.type The type of message limit ("within_limit")
     */
    /**
     * Send a message to a new or existing conversation.
     * @param {string} message - Initial message
     * @param {SendMessageParams} [params] - Additional parameters
     * @param {string} [params.conversation] - Existing conversation ID
     * @param {boolean} [params.temporary=true] - Delete after getting response
     * @returns {Promise<MessageStreamChunk>} Result message
     */
    sendMessage(message: string, { conversation, temporary, ...params }?: {
        /**
         * Whether to retry the most recent message in the conversation instead of sending a new one
         */
        retry?: boolean;
        /**
         * The timezone
         */
        timezone?: string;
        /**
         * Attachments
         */
        attachments?: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number | null;
        }[];
        /**
         * Callback when done receiving the message response
         */
        done?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string | null;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
        /**
         * Callback on message response progress
         */
        progress?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string | null;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
    }): Promise<{
        /**
         * The markdown text completion for this response
         */
        completion: string;
        /**
         * The reason for the response stop (if any)
         */
        stop_reason: string | null;
        /**
         * The model used
         */
        model: string;
        /**
         * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
         */
        stop: string;
        /**
         * A logging ID
         */
        log_id: string;
        /**
         * If you're within the message limit
         */
        messageLimit: any;
    }>;
    /**
     * Make an API request.
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Response>} Fetch response
     * @example
     * await claude.request('/api/organizations').then(r => r.json())
     */
    request(endpoint: string, options: any): Promise<Response>;
    /**
     * Initialize the client.
     * @async
     * @returns {Promise<void>} Void
     */
    init(): Promise<void>;
    organizationId: string;
    recent_conversations: {
        /**
         * The conversation ID
         */
        conversationId: string;
        /**
         * The conversation name
         */
        name: string;
        /**
         * The conversation summary (usually empty)
         */
        summary: string;
        /**
         * The conversation created at
         */
        created_at: string;
        /**
         * The conversation updated at
         */
        updated_at: string;
    }[];
    /**
     * An organization
     * @typedef Organization
     * @property {String} join_token A token
     * @property {String} name The organization name
     * @property {String} uuid The organization UUID
     * @property {String} created_at The organization creation date
     * @property {String} updated_at The organization update date
     * @property {String[]} capabilities What the organization can do
     * @property {Object} settings The organization's settings
     * @property {Array} active_flags Organization's flags (none that I've found)
     */
    /**
     * Get the organizations list.
     * @async
     * @returns {Promise<Organization[]>} A list of organizations
     * @example
     * await claude.getOrganizations().then(organizations => {
     *  console.log('Users organization name is:', organizations[0].name)
     * })
     */
    getOrganizations(): Promise<{
        /**
         * A token
         */
        join_token: string;
        /**
         * The organization name
         */
        name: string;
        /**
         * The organization UUID
         */
        uuid: string;
        /**
         * The organization creation date
         */
        created_at: string;
        /**
         * The organization update date
         */
        updated_at: string;
        /**
         * What the organization can do
         */
        capabilities: string[];
        /**
         * The organization's settings
         */
        settings: any;
        /**
         * Organization's flags (none that I've found)
         */
        active_flags: any[];
    }[]>;
    /**
     * Delete all conversations
     * @async
     * @returns {Promise<Response[]>} An array of responses for the DELETE requests
     * @example
     * await claude.clearConversations();
     * console.assert(await claude.getConversations().length === 0);
     */
    clearConversations(): Promise<Response[]>;
    /**
     * @callback doneCallback
     * @param {MessageStreamChunk} a The completed response
     */
    /**
     * @callback progressCallback
     * @param {MessageStreamChunk} a The response in progress
     */
    /**
     * @typedef SendMessageParams
     * @property {Boolean} [retry=false] Whether to retry the most recent message in the conversation instead of sending a new one
     * @property {String} [timezone="America/New_York"] The timezone
     * @property {Attachment[]} [attachments=[]] Attachments
     * @property {doneCallback} [done] Callback when done receiving the message response
     * @property {progressCallback} [progress] Callback on message response progress
     */
    /**
     * Start a new conversation
     * @param {String} message The message to send to start the conversation
     * @param {SendMessageParams} [params={}] Message params passed to Conversation.sendMessage
     * @returns {Promise<Conversation>}
     * @async
     * @example
     * const conversation = await claude.startConversation("Hello! How are you?")
     * console.log(await conversation.getInfo());
     */
    startConversation(message: string, params?: {
        /**
         * Whether to retry the most recent message in the conversation instead of sending a new one
         */
        retry?: boolean;
        /**
         * The timezone
         */
        timezone?: string;
        /**
         * Attachments
         */
        attachments?: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number | null;
        }[];
        /**
         * Callback when done receiving the message response
         */
        done?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string | null;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
        /**
         * Callback on message response progress
         */
        progress?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string | null;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
    }): Promise<{
        /**
         * The conversation ID
         */
        conversationId: string;
        /**
         * The conversation name
         */
        name: string;
        /**
         * The conversation summary (usually empty)
         */
        summary: string;
        /**
         * The conversation created at
         */
        created_at: string;
        /**
         * The conversation updated at
         */
        updated_at: string;
    }>;
    /**
     * Get a conversation by its ID
     * @param {UUID} id The uuid of the conversation (Conversation.uuid or Conversation.conversationId)
     * @async
     * @returns {Conversation | null} The conversation
     * @example
     * const conversation = await claude.getConversation("222aa20a-bc79-48d2-8f6d-c819a1b5eaed");
     */
    getConversation(id: any): {
        /**
         * The conversation ID
         */
        conversationId: string;
        /**
         * The conversation name
         */
        name: string;
        /**
         * The conversation summary (usually empty)
         */
        summary: string;
        /**
         * The conversation created at
         */
        created_at: string;
        /**
         * The conversation updated at
         */
        updated_at: string;
    };
    /**
     * Get all conversations
     * @async
     * @returns {Promise<Conversation[]>} A list of conversations
     * @example
     * console.log(`You have ${await claude.getConversations().length} conversations:`);
     */
    getConversations(): Promise<{
        /**
         * The conversation ID
         */
        conversationId: string;
        /**
         * The conversation name
         */
        name: string;
        /**
         * The conversation summary (usually empty)
         */
        summary: string;
        /**
         * The conversation created at
         */
        created_at: string;
        /**
         * The conversation updated at
         */
        updated_at: string;
    }[]>;
    /**
     * The response from uploading a file (an attachment)
     * @typedef Attachment
     * @property {String} file_name The file name
     * @property {String} file_type The file's mime type
     * @property {Number} file_size The file size in bytes
     * @property {String} extracted_content The contents of the file that were extracted
     * @property {Number | null} [totalPages] The total pages of the document
     */
    /**
     * Extract the contents of a file
     * @param {File} file A JS File (like) object to upload.
     * @async
     * @returns {Promise<Attachment>}
     * @example
     * const file = await claude.uploadFile(
     *     new File(["test"], "test.txt", { type: "text/plain" }
     * );
     * console.log(await claude.sendMessage("What's the contents of test.txt?", {
     *  attachments: [file]
     * }))
     */
    uploadFile(file: File): Promise<{
        /**
         * The file name
         */
        file_name: string;
        /**
         * The file's mime type
         */
        file_type: string;
        /**
         * The file size in bytes
         */
        file_size: number;
        /**
         * The contents of the file that were extracted
         */
        extracted_content: string;
        /**
         * The total pages of the document
         */
        totalPages?: number | null;
    }>;
}
/**
 * A Claude conversation instance.
 * @class
 * @classdesc Represents an active Claude conversation.
 */
export class Conversation {
    /**
     * @typedef Conversation
     * @property {String} conversationId The conversation ID
     * @property {String} name The conversation name
     * @property {String} summary The conversation summary (usually empty)
     * @property {String} created_at The conversation created at
     * @property {String} updated_at The conversation updated at
     */
    /**
     * Create a Conversation instance.
     * @param {Claude} claude - Claude client instance
     * @param {Object} options - Options
     * @param {String} options.conversationId - Conversation ID
     * @param {String} [options.name] - Conversation name
     * @param {String} [options.summary] - Conversation summary
     * @param {String} [options.created_at] - Conversation created at
     * @param {String} [options.updated_at] - Conversation updated at
     * @param {String} [options.model] - Claude model
     */
    constructor(claude: Claude, { model, conversationId, name, summary, created_at, updated_at }: {
        conversationId: string;
        name?: string;
        summary?: string;
        created_at?: string;
        updated_at?: string;
        model?: string;
    });
    claude: Claude;
    conversationId: string;
    request: (endpoint: string, options: any) => Promise<Response>;
    model: string;
    /**
     * Convert the conversation to a JSON object
     * @returns {Conversation} The serializable object
     */
    toJSON(): {
        /**
         * The conversation ID
         */
        conversationId: string;
        /**
         * The conversation name
         */
        name: string;
        /**
         * The conversation summary (usually empty)
         */
        summary: string;
        /**
         * The conversation created at
         */
        created_at: string;
        /**
         * The conversation updated at
         */
        updated_at: string;
    };
    /**
     * Retry the last message in the conversation
     * @param {SendMessageParams} [params={}]
     * @returns {Promise<MessageStreamChunk>}
     */
    retry(params?: {
        /**
         * Whether to retry the most recent message in the conversation instead of sending a new one
         */
        retry?: boolean;
        /**
         * The timezone
         */
        timezone?: string;
        /**
         * Attachments
         */
        attachments?: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number;
        }[];
        /**
         * Callback when done receiving the message response
         */
        done?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
        /**
         * Callback on message response progress
         */
        progress?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
    }): Promise<{
        /**
         * The markdown text completion for this response
         */
        completion: string;
        /**
         * The reason for the response stop (if any)
         */
        stop_reason: string;
        /**
         * The model used
         */
        model: string;
        /**
         * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
         */
        stop: string;
        /**
         * A logging ID
         */
        log_id: string;
        /**
         * If you're within the message limit
         */
        messageLimit: any;
    }>;
    /**
     * Send a message to this conversation
     * @param {String} message
     * @async
     * @param {SendMessageParams} params The parameters to send along with the message
     * @returns {Promise<MessageStreamChunk>}
     */
    sendMessage(message: string, { retry, timezone, attachments, model, done, progress, rawResponse }?: {
        /**
         * Whether to retry the most recent message in the conversation instead of sending a new one
         */
        retry?: boolean;
        /**
         * The timezone
         */
        timezone?: string;
        /**
         * Attachments
         */
        attachments?: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number;
        }[];
        /**
         * Callback when done receiving the message response
         */
        done?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
        /**
         * Callback on message response progress
         */
        progress?: (a: {
            /**
             * The markdown text completion for this response
             */
            completion: string;
            /**
             * The reason for the response stop (if any)
             */
            stop_reason: string;
            /**
             * The model used
             */
            model: string;
            /**
             * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
             */
            stop: string;
            /**
             * A logging ID
             */
            log_id: string;
            /**
             * If you're within the message limit
             */
            messageLimit: any;
        }) => any;
    }): Promise<{
        /**
         * The markdown text completion for this response
         */
        completion: string;
        /**
         * The reason for the response stop (if any)
         */
        stop_reason: string;
        /**
         * The model used
         */
        model: string;
        /**
         * The string at which Claude stopped responding at, e.g. "\n\nHuman:"
         */
        stop: string;
        /**
         * A logging ID
         */
        log_id: string;
        /**
         * If you're within the message limit
         */
        messageLimit: any;
    }>;
    /**
     * Rename the current conversation
     * @async
     * @param {String} title The new title
     * @returns {Promise<Response>} A Response object
     */
    rename(title: string): Promise<Response>;
    /**
     * Delete the conversation
     * @async
     * @returns Promise<Response>
     */
    delete(): Promise<Response>;
    /**
     * @typedef Message
     * @property {UUID} uuid The message UUID
     * @property {String} text The message text
     * @property {String} created_at The message created at
     * @property {String} updated_at The message updated at
     * @property {String | null} edited_at When the message was last edited (no editing support via api/web client)
     * @property {Any | null} chat_feedback Feedback
     * @property {Attachment[]} attachments The attachments
     */
    /**
     * @typedef ConversationInfo
     * @extends Conversation
     * @property {Message[]} chat_messages The messages in this conversation
     */
    /**
     * Get information about this conversation
     * @returns {Promise<ConversationInfo>}
     */
    getInfo(): Promise<any>;
    /**
     * Get all the files from this conversation
     * @async
     * @returns {Promise<Attachment[]>}
     */
    getFiles(): Promise<{
        /**
         * The file name
         */
        file_name: string;
        /**
         * The file's mime type
         */
        file_type: string;
        /**
         * The file size in bytes
         */
        file_size: number;
        /**
         * The contents of the file that were extracted
         */
        extracted_content: string;
        /**
         * The total pages of the document
         */
        totalPages?: number;
    }[]>;
    /**
     * Get all messages in the conversation
     * @async
     * @returns {Promise<Message[]>}
     */
    getMessages(): Promise<{
        /**
         * The message UUID
         */
        uuid: any;
        /**
         * The message text
         */
        text: string;
        /**
         * The message created at
         */
        created_at: string;
        /**
         * The message updated at
         */
        updated_at: string;
        /**
         * When the message was last edited (no editing support via api/web client)
         */
        edited_at: string | null;
        /**
         * Feedback
         */
        chat_feedback: Any | null;
        /**
         * The attachments
         */
        attachments: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number;
        }[];
    }[]>;
    #private;
}
/**
 * Message class
 * @class
 * @classdesc A class representing a message in a Conversation
 */
export class Message {
    /**
     * Create a Message instance.
     * @param {Object} params - Params
     * @param {Conversation} params.conversation - Conversation instance
     * @param {Claude} params.claude - Claude instance
     * @param {Message} message - Message data
     */
    constructor({ conversation, claude }: {
        conversation: {
            /**
             * The conversation ID
             */
            conversationId: string;
            /**
             * The conversation name
             */
            name: string;
            /**
             * The conversation summary (usually empty)
             */
            summary: string;
            /**
             * The conversation created at
             */
            created_at: string;
            /**
             * The conversation updated at
             */
            updated_at: string;
        };
        claude: Claude;
    }, { uuid, text, sender, index, updated_at, edited_at, chat_feedback, attachments }: {
        /**
         * The message UUID
         */
        uuid: any;
        /**
         * The message text
         */
        text: string;
        /**
         * The message created at
         */
        created_at: string;
        /**
         * The message updated at
         */
        updated_at: string;
        /**
         * When the message was last edited (no editing support via api/web client)
         */
        edited_at: string;
        /**
         * Feedback
         */
        chat_feedback: any;
        /**
         * The attachments
         */
        attachments: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number;
        }[];
    });
    request: (endpoint: string, options: any) => Promise<Response>;
    json: {
        uuid: any;
        text: string;
        sender: any;
        index: any;
        updated_at: string;
        edited_at: string;
        chat_feedback: any;
        attachments: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number;
        }[];
    };
    /**
     * Convert this message to a JSON representation
     * Necessary to prevent circular JSON errors
     * @returns {Message}
     */
    toJSON(): {
        /**
         * The message UUID
         */
        uuid: any;
        /**
         * The message text
         */
        text: string;
        /**
         * The message created at
         */
        created_at: string;
        /**
         * The message updated at
         */
        updated_at: string;
        /**
         * When the message was last edited (no editing support via api/web client)
         */
        edited_at: string;
        /**
         * Feedback
         */
        chat_feedback: any;
        /**
         * The attachments
         */
        attachments: {
            /**
             * The file name
             */
            file_name: string;
            /**
             * The file's mime type
             */
            file_type: string;
            /**
             * The file size in bytes
             */
            file_size: number;
            /**
             * The contents of the file that were extracted
             */
            extracted_content: string;
            /**
             * The total pages of the document
             */
            totalPages?: number;
        }[];
    };
    /**
     * Returns the value of the "created_at" property as a Date object.
     *
     * @return {Date} The value of the "created_at" property as a Date object.
     */
    get createdAt(): Date;
    /**
     * Returns the value of the "updated_at" property as a Date object.
     *
     * @return {Date} The value of the "updated_at" property as a Date object.
     */
    get updatedAt(): Date;
    /**
     * Returns the value of the "edited_at" property as a Date object.
     *
     * @return {Date} The value of the "edited_at" property as a Date object.
     */
    get editedAt(): Date;
    /**
     * Get if message is from the assistant.
     * @type {boolean}
     */
    get isBot(): boolean;
    /**
     * @typedef MessageFeedback
     * @property {UUID} uuid - Message UUID
     * @property {"flag/bug" | "flag/harmful" | "flag/other"} type - Feedback type
     * @property {String | null} reason - Feedback reason (details box)
     * @property {String} created_at - Feedback creation date
     * @property {String} updated_at - Feedback update date
     */
    /**
     * Send feedback on the message.
     * @param {string} type - Feedback type
     * @param {string} [reason] - Feedback reason
     * @returns {Promise<MessageFeedback>} Response
     */
    sendFeedback(type: string, reason?: string): Promise<{
        /**
         * - Message UUID
         */
        uuid: any;
        /**
         * - Feedback type
         */
        type: "flag/bug" | "flag/harmful" | "flag/other";
        /**
         * - Feedback reason (details box)
         */
        reason: string | null;
        /**
         * - Feedback creation date
         */
        created_at: string;
        /**
         * - Feedback update date
         */
        updated_at: string;
    }>;
}
export default Claude;
