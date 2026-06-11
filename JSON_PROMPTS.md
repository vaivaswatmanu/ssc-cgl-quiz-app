# SSC Quiz App JSON Generation Prompt

Generate a valid JSON test for my local SSC CGL quiz/mock app.

## Output Rules

* Output ONLY valid JSON.
* Do not use markdown.
* Do not add explanation outside JSON.
* Do not add comments inside JSON.
* JSON must be parseable directly in JavaScript using `JSON.parse()`.
* Use double quotes for all keys and strings.
* Do not include faulty questions.
* Do not include questions where no option is valid.
* Every question must have exactly one clearly correct option.

---

## Top-Level Schema Rules

Every test JSON must include:

* `testId`
* `testName`
* `subject`
* `mode`
* `exam`
* `timer`
* `marking`
* `sections`

### Subject Rules

Every test must include a top-level `subject` field.

Allowed subject values:

* `"quant"` for Quantitative Aptitude
* `"reasoning"` for Reasoning
* `"english"` for English Comprehension
* `"ga"` for General Awareness
* `"full-mock"` for full SSC CGL mocks
* `"mixed"` for mixed practice quizzes
* `"general"` only if no subject is clearly applicable

Examples:

```json
"subject": "quant"
```

```json
"subject": "full-mock"
```

Storage depends on this subject field, so choose it carefully.

---

## Mode Rules

* `mode` must be either `"quiz"` or `"mock"`.
* For quiz mode, use exactly one section.
* For mock mode, use multiple sections.
* For full SSC CGL mock, use 4 sections:

  * Reasoning
  * General Awareness
  * Quantitative Aptitude
  * English Comprehension

---

## Question Rules

* Every question must have exactly 4 options: A, B, C, D.
* `correctOptionId` must match one of the option IDs.
* Every question must have a concise SSC-oriented solution.
* Question IDs must be unique across the entire test.
* Use SSC CGL Tier 1 difficulty.
* Prefer PYQ-style wording and patterns.
* Do not repeat the same question pattern too many times.
* Avoid ambiguous wording.
* Avoid “closest option” type questions.
* Avoid questions where the solution says:

  * no option is correct
  * none of the options satisfy
  * choose if forced
  * faulty question
  * closest answer

---

## Timer Rules

* `timer.type` can be `"none"`, `"practice"`, or `"strict"`.
* `timer.mode` can be `"test"` or `"sectional"`.

### Quiz Timer

* For quiz mode, use `"timer.mode": "test"`.
* Quiz timer default = number of questions × 36 seconds.
* Convert quiz timer to minutes.

Examples:

* 10 questions = 6 minutes
* 15 questions = 9 minutes
* 20 questions = 12 minutes
* 25 questions = 15 minutes
* 50 questions = 30 minutes

### Mock Timer

* For mock mode, use `"timer.mode": "sectional"` unless I specifically ask for full-test timer.
* Mock sectional timer default = 15 minutes per section.
* For SSC CGL full mock, use 4 sections with 25 questions each.
* Mini mock can have fewer questions, but keep sectional structure.

---

## Marking

Always use:

```json
"marking": {
  "correct": 2,
  "wrong": -0.5,
  "unattempted": 0
}
```

---

# Quiz JSON Schema

Use this schema for topic-wise quizzes.

```json
{
  "testId": "unique-kebab-case-id",
  "testName": "Readable Quiz Name",
  "subject": "quant",
  "mode": "quiz",
  "exam": "SSC CGL Tier 1",
  "timer": {
    "type": "practice",
    "mode": "test",
    "durationMinutes": 15
  },
  "marking": {
    "correct": 2,
    "wrong": -0.5,
    "unattempted": 0
  },
  "sections": [
    {
      "sectionId": "quant",
      "sectionName": "Quantitative Aptitude",
      "questions": [
        {
          "questionId": "q1",
          "questionText": "Question text here",
          "options": [
            { "id": "A", "text": "Option A" },
            { "id": "B", "text": "Option B" },
            { "id": "C", "text": "Option C" },
            { "id": "D", "text": "Option D" }
          ],
          "correctOptionId": "A",
          "solution": "Short solution here."
        }
      ]
    }
  ]
}
```

---

# Mock JSON Schema

Use this schema for full mocks or multi-section mocks.

```json
{
  "testId": "unique-kebab-case-id",
  "testName": "Readable Mock Name",
  "subject": "full-mock",
  "mode": "mock",
  "exam": "SSC CGL Tier 1",
  "timer": {
    "type": "strict",
    "mode": "sectional",
    "durationMinutes": 15
  },
  "marking": {
    "correct": 2,
    "wrong": -0.5,
    "unattempted": 0
  },
  "sections": [
    {
      "sectionId": "reasoning",
      "sectionName": "Reasoning",
      "questions": []
    },
    {
      "sectionId": "ga",
      "sectionName": "General Awareness",
      "questions": []
    },
    {
      "sectionId": "quant",
      "sectionName": "Quantitative Aptitude",
      "questions": []
    },
    {
      "sectionId": "english",
      "sectionName": "English Comprehension",
      "questions": []
    }
  ]
}
```

---

# Reusable Quiz Request

Use this when asking ChatGPT to generate a topic quiz.

```txt
Generate a valid JSON quiz for my SSC quiz app.

Mode: quiz
Subject: quant
Topic: Percentage
Number of questions: 25
Timer: practice timer, test mode, 15 minutes
Difficulty: SSC CGL Tier 1
Question style: PYQ-style
Test name: Percentage Practice Quiz 01

Rules:
- Output ONLY valid JSON.
- Do not use markdown.
- Include top-level "subject": "quant".
- Use exactly one section.
- Every question must have exactly 4 options: A, B, C, D.
- Every question must have exactly one clearly correct option.
- correctOptionId must match one option id.
- Include concise SSC-oriented solution for every question.
- Do not include faulty or ambiguous questions.

Return ONLY valid JSON.
```

---

# Reusable Subject Quiz Request Template

```txt
Generate a valid JSON quiz for my SSC quiz app.

Mode: quiz
Subject: [quant/reasoning/english/ga/mixed]
Topic: [topic name]
Number of questions: [number]
Timer: practice timer, test mode, [minutes] minutes
Difficulty: SSC CGL Tier 1
Question style: PYQ-style
Test name: [test name]

Rules:
- Output ONLY valid JSON.
- Do not use markdown.
- Include correct top-level subject field.
- Use exactly one section.
- Every question must have exactly 4 options: A, B, C, D.
- Every question must have exactly one clearly correct option.
- correctOptionId must match one option id.
- Include concise SSC-oriented solution for every question.
- Do not include faulty or ambiguous questions.

Return ONLY valid JSON.
```

---

# Reusable Mock Request

Use this when asking ChatGPT to generate a full SSC CGL mock.

```txt
Generate a valid JSON mock for my SSC quiz app.

Mode: mock
Subject: full-mock

Sections:
1. Reasoning - 25 questions
2. General Awareness - 25 questions
3. Quantitative Aptitude - 25 questions
4. English Comprehension - 25 questions

Timer: strict timer, sectional mode, 15 minutes per section
Difficulty: SSC CGL Tier 1
Question style: PYQ-style
Test name: SSC CGL Full Mock 01

Rules:
- Output ONLY valid JSON.
- Do not use markdown.
- Include top-level "subject": "full-mock".
- Use 4 sections.
- Every question must have exactly 4 options: A, B, C, D.
- Every question must have exactly one clearly correct option.
- correctOptionId must match one option id.
- Include concise SSC-oriented solution for every question.
- Do not include faulty or ambiguous questions.
- Do not include questions where no option is valid.

Return ONLY valid JSON.
```

---

# Reusable Mini Mock Request

Use this when asking for a smaller multi-section mock.

```txt
Generate a valid JSON mini mock for my SSC quiz app.

Mode: mock
Subject: mixed

Sections:
1. Reasoning - 10 questions
2. General Awareness - 10 questions
3. Quantitative Aptitude - 10 questions
4. English Comprehension - 10 questions

Timer: strict timer, sectional mode, 6 minutes per section
Difficulty: SSC CGL Tier 1
Question style: PYQ-style
Test name: SSC CGL Mini Mock 01

Rules:
- Output ONLY valid JSON.
- Do not use markdown.
- Include top-level "subject": "mixed".
- Use 4 sections.
- Every question must have exactly 4 options: A, B, C, D.
- Every question must have exactly one clearly correct option.
- correctOptionId must match one option id.
- Include concise SSC-oriented solution for every question.
- Do not include faulty or ambiguous questions.

Return ONLY valid JSON.
```

---

# Subject Mapping Guide

Use this mapping while generating JSON:

```txt
Percentage, Profit and Loss, Ratio, Average, SI-CI, Time and Work, Speed, Algebra, Geometry, Mensuration, Trigonometry → subject: quant

Analogy, Series, Coding-Decoding, Classification, Blood Relation, Direction, Syllogism, Venn Diagram, Figure Counting, Mirror Image → subject: reasoning

Grammar, Error Detection, Sentence Improvement, Cloze Test, Synonyms, Antonyms, Idioms, One Word Substitution, Spelling, Active Passive, Narration → subject: english

History, Polity, Geography, Economy, Science, Static GK, Current Affairs, Art and Culture, Sports, Awards → subject: ga

Full SSC CGL 4-section mock → subject: full-mock

Mixed topic quiz or mixed mini mock → subject: mixed
```
