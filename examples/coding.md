# Coding Demo (Rec is 6x speed)

https://github.com/Explosion-Scratch/claude-unofficial-api/assets/61319150/68b11264-d56e-4ade-a2bf-d4625b1397bb

See the [Regular speed](https://github.com/Explosion-Scratch/claude-unofficial-api/assets/61319150/110a85f4-5ce2-45c3-94e6-f2a2a175183a) recording as well.


# How to run this:
```
echo "cli math game with simple multiplication, division and subtraction node.js" | claude --template code
```

# What's it doing
<details>
<summary>1. Creates a design document and uploads it as <code>requirements.txt</code> to the main conversation</summary>

```
{#file requirements.txt}
    {#claude}
        Write out a design document of the following javascript program. Include details about the functions needed, the code structure, variables and outputs from each function. Also include example outputs of the program (in code blocks). Don't implement or output any code.

        {prompt}
    {/claude}
{/file}
```

</details> 

<details>
<summary>2. Reads design document and writes an initial draft of the code (3), then criticisms (4), then a final version (5)</summary>

```
You are an expert software engineer at Google. Be concise! Your job is to implement the code designed and detailed in the uploaded file requirements.txt. This project is {prompt}

Make sure to use the latest syntax (e.g. ESM/ES6 imports and syntax in JavaScript, HTML5, CSS3), don't include debug or comments or empty lines. Include error handling to make sure it works properly. Make sure your code is readable and does not include any placeholders or psuedocode.

DONT INCLUDE ANY TODO COMMENTS. DONT INCLUDE PSUEDOCODE. DONT INCLUDE PLACEHOLDERS. Adhere to the user's request as closely as possible. Your code's output, variables and function should match the example output given in the design document exactly.

First write you initial implementation of the requirements, then write out 4 criticisms of it. Finally write your final code. Begin the final code with "FINAL:"

The requirements and design details of this project are located in the uploaded file requirements.txt

Make sure that the final code matches the example output from the requirements.txt file. Your final code should also not contain any bugs or errors, and must hold up to the Google JS style guide. Make sure all functions you use are defined in the environment.

```

</details> 

<details>
<summary>6. Writes the files to your computer using the <code>writefiles</code> prompt template</summary>

<pre>
From now on you can write to files using the following syntax:

filename.ext
```language
file content
```

You must match this format EXACTLY. Example, to write to hello_world.txt:

hello_world.txt
```
This is the content of hello_world.txt
```

{prompt}

{#every}
    {#js}
        // Parse claude's response and write files if applicable
        const regex = /(?<file>([\w_-]+\.)+\w+)\n?```(\w+\n)?\n?(?<body>[\s\S]+?)\n?```/g
        let match;
        while (match = regex.exec(variables.claude_response.completion)) {
            writeFileSync(match.groups.file, match.groups.body);
            console.log(chalk.bold.green(`Wrote ${match.groups.body.split('\n').length} lines to ${chalk.bold.red(match.groups.file)}`))
        }
    {/js}
{/every}
</pre>

</details> 

# Output:

<details>
<summary>node <code>index.js</code> output:</summary>

```
What is 10 + 9? 19
Correct!
What is 8 - 18? -10
Correct!
What is 10 + 18? 27
Incorrect. The answer is 28
What is 6 - 9? -3
Correct!
What is 19 * 20? 380
Correct!
What is 12 + 18? 111111
Incorrect. The answer is 30
What is 17 * 8? 111
Incorrect. The answer is 136
What is 12 * 17? 1
Incorrect. The answer is 204
What is 4 - 11? 1
Incorrect. The answer is -7
What is 15 + 1? 1
Incorrect. The answer is 16
Final Score: 4/10
```

</details> 

<details>
<summary>index.js</summary>


```js
// Requires
import readline from 'readline';

// Game configuration
const maxQuestions = 10;
const maxNum = 20;

// Game operations
const ops = ['+', '-', '*'];

// Game class
class Game {
  constructor() {
    this.score = 0;
    this.numQuestions = 0; 
  }

  start() {
    // Initialize game
    this.score = 0;
    this.numQuestions = 0;
    
    // Start game loop
    this.askQuestion();
  }

  askQuestion() {
    // Generate random numbers 
    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * maxNum) + 1;

    // Generate random op
    const opIndex = Math.floor(Math.random() * ops.length);
    const op = ops[opIndex];

    // Format question
    const question = `What is ${num1} ${op} ${num2}? `;
    
    // Get user's answer
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, answer => {
      // Validate input
      const numAnswer = parseInt(answer);
      if (Number.isNaN(numAnswer)) {
        console.log('Invalid input. Please enter a number.');
        return this.askQuestion();
      }

      // Check answer
      const expected = eval(`${num1} ${op} ${num2}`);
      if (numAnswer === expected) {
        console.log('Correct!');
        this.score++;
      } else {
        console.log(`Incorrect. The answer is ${expected}`);
      }

      // Update counters and check end condition
      this.numQuestions++;
        if (this.numQuestions < maxQuestions) {
          rl.close();
          this.askQuestion();
      } else {
        this.end();
      }

    });
  }

  end() {
      // Print final score
      console.log(`Final Score: ${this.score}/${this.numQuestions}`);
      process.exit(0);
  }
}

// Create game instance and start
const game = new Game();
game.start();
```

</details> 

<details>
<summary>package.json</summary>

```json
{
  "name": "math-game",
  "type": "module",
  "main": "index.js"
}
```


</details> 
