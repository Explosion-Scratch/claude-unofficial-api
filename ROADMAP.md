# Roadmap
- Implement a really nice prompt template parser which has basic programming template language syntax
  - Call functions via `{#func param}` or `{#func}param{/func}` (Example: `{#claude "...."}`)
- Connect this prompt parser to the CLI to give claude access to tools like ChatGPT can use, these could be toggled on and off and would be stored in the form of templates
  - E.g. a web search helper could look like the following:

```
You now have access to a web search engine, to use this, before responding totally respond with only `search(searchterm)`. The user will then reply back with the relevant search results. After being given the relevant search results continue your conversation

{#on user_message}
   {#js}
      return await doSearching(response.split('search(')[0].split(')')[0]).then(r => r.map(i => `${i.title} - ${i.url}\n\n${i.description}`).join('\n'))
   {/js}
{/on}
```

- Another example could be allowing Claude to reflect on and improve its answers, or allowing it to write to files, do precise calculations, or even output valid JSON (wow)
- It would also be cool to make the CLI more general, e.g. work with any other AI models as well, providing similar functionality + prompt templates. (maybe time for a separate repo at this point for the parser + cli)
