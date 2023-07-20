# Valid JSON Output Demo (Rec 6x speed)

https://github.com/Explosion-Scratch/claude-unofficial-api/assets/61319150/f6c24b43-231c-47fb-941f-8533bc1b28cf

See the [original recording](https://github.com/Explosion-Scratch/claude-unofficial-api/assets/61319150/979ba3d4-78bc-4560-b5e0-cc4043320102) for 1x speed

# How to run this
```
echo "Explain in great detail the plot, themes and chapters of harry potter book 1" | claude --prompt.schema ./book_schema.d.ts --template json
```

# What it's doing
<details>
<summary>1. Answers the prompt</summary>
It just answers the prompt in plain text. I set `{__silent=true}` in the template so no output is shown
</details>

<details>
<summary>2. Asks Claude to redo it as JSON</summary>
Asks Claude to format its last response as JSON matching the typescript schema given in `{schema}`.
</details> 

<details>
<summary>3. JSON is parsed and formatted using JavaScript</summary>
If the JSON is invalid nothing is logged, if it's valid it's formatted and logged to the console
</details>

> **Note:**
> You could also modify this so that it writes the JSON directly to a file very easily

# Output

<details>
<summary>Title</summary>


```json
{
  "title": "Harry Potter and the Philosopher's Stone",
  "author": {
    "name": "J.K. Rowling",
    "fame": 100
  },
  "themes": [
    "Good vs evil",
    "Friendship",
    "Coming of age",
    "Prejudice"
  ],
  "chapterCount": 19,
  "chapters": [
    {
      "title": "The Boy Who Lived",
      "summary": "Baby Harry survives Voldemort's attack and is left with his aunt and uncle.",
      "importance": 80,
      "characterIds": [
        "Harry Potter",
        "Voldemort",
        "Vernon Dursley",
        "Petunia Dursley"
      ]
    },
    {
      "title": "The Vanishing Glass",
      "summary": "Strange events around Harry hint at his magical abilities.",
      "importance": 50,
      "characterIds": [
        "Harry Potter",
        "Dudley Dursley",
        "Petunia Dursley",
        "Vernon Dursley"
      ]
    },
    {
      "title": "The Letters from No One",
      "summary": "Harry's Hogwarts acceptance letters keep arriving despite the Dursleys' efforts to block them.",
      "importance": 70,
      "characterIds": [
        "Harry Potter",
        "Vernon Dursley",
        "Petunia Dursley",
        "Dudley Dursley"
      ]
    },
    {
      "title": "The Keeper of the Keys",
      "summary": "Hagrid arrives and informs Harry he is a wizard and takes him to Diagon Alley.",
      "importance": 90,
      "characterIds": [
        "Harry Potter",
        "Rubeus Hagrid",
        "Vernon Dursley",
        "Dudley Dursley"
      ]
    },
    {
      "title": "Diagon Alley",
      "summary": "Harry shops for his school supplies and equipment.",
      "importance": 70,
      "characterIds": [
        "Harry Potter",
        "Rubeus Hagrid"
      ]
    },
    {
      "title": "The Journey from Platform Nine and Three-Quarters",
      "summary": "Harry travels to Hogwarts via the Hogwarts Express train and meets Ron.",
      "importance": 80,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley"
      ]
    },
    {
      "title": "The Sorting Hat",
      "summary": "Harry and classmates are sorted into school Houses by the Sorting Hat.",
      "importance": 90,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley",
        "Hermione Granger"
      ]
    },
    {
      "title": "The Potions Master",
      "summary": "Harry attends his first Potions class with the hostile Professor Snape.",
      "importance": 60,
      "characterIds": [
        "Harry Potter",
        "Severus Snape"
      ]
    },
    {
      "title": "The Midnight Duel",
      "summary": "Harry and Ron arrange to duel Draco Malfoy at midnight.",
      "importance": 50,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley",
        "Draco Malfoy"
      ]
    },
    {
      "title": "Halloween",
      "summary": "A troll gets into Hogwarts on Halloween night.",
      "importance": 80,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley",
        "Hermione Granger"
      ]
    },
    {
      "title": "Quidditch",
      "summary": "Events surrounding Harry's first Quidditch match.",
      "importance": 70,
      "characterIds": [
        "Harry Potter",
        "Severus Snape"
      ]
    },
    {
      "title": "The Mirror of Erised",
      "summary": "Harry finds a mirror that shows a person's deepest desires.",
      "importance": 80,
      "characterIds": [
        "Harry Potter",
        "Albus Dumbledore"
      ]
    },
    {
      "title": "Nicolas Flamel",
      "summary": "Nicolas Flamel is revealed as creator of the Philosopher's Stone.",
      "importance": 80,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley",
        "Hermione Granger"
      ]
    },
    {
      "title": "Norbert the Norwegian Ridgeback",
      "summary": "Hagrid hatches a dragon egg and Harry helps smuggle it away.",
      "importance": 60,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley",
        "Rubeus Hagrid"
      ]
    },
    {
      "title": "The Forbidden Forest",
      "summary": "Detention in the Forbidden Forest for Harry, Hermione, Neville and Draco.",
      "importance": 70,
      "characterIds": [
        "Harry Potter",
        "Draco Malfoy",
        "Neville Longbottom"
      ]
    },
    {
      "title": "Through the Trapdoor",
      "summary": "Harry goes through the trapdoor to find the Stone before Snape.",
      "importance": 100,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley",
        "Hermione Granger"
      ]
    },
    {
      "title": "The Man with Two Faces",
      "summary": "Harry confronts Quirrell and Voldemort.",
      "importance": 100,
      "characterIds": [
        "Harry Potter",
        "Voldemort",
        "Professor Quirrell"
      ]
    },
    {
      "title": "The Parting of the Ways",
      "summary": "Harry wakes in hospital and gets the end-of-term House Cup.",
      "importance": 80,
      "characterIds": [
        "Harry Potter",
        "Ron Weasley",
        "Hermione Granger",
        "Albus Dumbledore"
      ]
    }
  ]
}
```

</details>
