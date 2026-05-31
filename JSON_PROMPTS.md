# SSC Quiz App JSON Generation Prompt

Generate a valid JSON test for my local SSC CGL quiz/mock app.

Output rules:
- Output ONLY valid JSON.
- Do not use markdown.
- Do not add explanation outside JSON.
- Do not add comments inside JSON.
- JSON must be parseable directly in JavaScript using JSON.parse().
- Use double quotes for all keys and strings.

Schema rules:
- `mode` must be either `"quiz"` or `"mock"`.
- For quiz mode, use exactly one section.
- For mock mode, use multiple sections.
- Every question must have exactly 4 options: A, B, C, D.
- `correctOptionId` must match one of the option ids.
- Every question must have a concise SSC-oriented solution.
- Question IDs must be unique across the entire test.
- Use SSC CGL Tier 1 difficulty.
- Prefer PYQ-style wording and patterns.

Timer rules:
- `timer.type` can be `"none"`, `"practice"`, or `"strict"`.
- `timer.mode` can be `"test"` or `"sectional"`.
- For quiz mode, use `"timer.mode": "test"`.
- For mock mode, use `"timer.mode": "sectional"` unless I specifically ask for full-test timer.
- Quiz timer default = number of questions × 36 seconds.
- Convert quiz timer to minutes.
- Examples:
  - 10 questions = 6 minutes
  - 15 questions = 9 minutes
  - 20 questions = 12 minutes
  - 25 questions = 15 minutes
  - 50 questions = 30 minutes
- Mock sectional timer default = 15 minutes per section.
- For SSC CGL mock, use 4 sections:
  - Reasoning
  - General Awareness
  - Quantitative Aptitude
  - English Comprehension
- Full mock should have 25 questions per section.
- Mini mock can have fewer questions, but keep sectional structure.

Marking:
- correct = 2
- wrong = -0.5
- unattempted = 0

Quiz JSON schema:

{
  "testId": "unique-kebab-case-id",
  "testName": "Readable Quiz Name",
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

Mock JSON schema:

{
  "testId": "unique-kebab-case-id",
  "testName": "Readable Mock Name",
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

Reusable Quiz Request:

Generate a valid JSON quiz for my SSC quiz app.

Mode: quiz
Topic: Percentage
Number of questions: 25
Timer: practice timer, test mode, 15 minutes
Difficulty: SSC CGL Tier 1
Question style: PYQ-style
Test name: Percentage Practice Quiz 01

Return ONLY valid JSON.

Reusable Mock Request:

Generate a valid JSON mock for my SSC quiz app.

Mode: mock
Sections:
1. Reasoning - 25 questions
2. General Awareness - 25 questions
3. Quantitative Aptitude - 25 questions
4. English Comprehension - 25 questions

Timer: strict timer, sectional mode, 15 minutes per section
Difficulty: SSC CGL Tier 1
Question style: PYQ-style
Test name: SSC CGL Full Mock 01

Return ONLY valid JSON.