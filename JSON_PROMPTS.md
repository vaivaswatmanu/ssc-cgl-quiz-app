# SSC Quiz App JSON Generation Prompt

Generate a valid JSON test for my local SSC CGL quiz app.

Requirements:
- Output ONLY valid JSON.
- No markdown.
- No explanation outside JSON.
- Use this exact schema.
- mode must be either "quiz" or "mock".
- For quiz mode, use exactly one section.
- For mock mode, use multiple sections.
- Every question must have exactly 4 options: A, B, C, D.
- correctOptionId must match one of the option ids.
- Solutions should be concise and exam-oriented.
- Difficulty should be SSC CGL Tier 1 level.
- Questions should be PYQ-style where possible.

Schema:

{
  "testId": "unique-kebab-case-id",
  "testName": "Readable Test Name",
  "mode": "quiz",
  "exam": "SSC CGL Tier 1",
  "timer": {
  "type": "practice",
  "mode": "test",
  "durationMinutes": 20
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

Now generate:
Mode: quiz
Topic: Percentage
Number of questions: 25
Timer: practice, 20 minutes
Difficulty: SSC CGL Tier 1
Test name: Percentage Practice Quiz 01
Timer rules:
- timer.type can be "none", "practice", or "strict".
- timer.mode can be "test" or "sectional".
- For quiz mode, use timer.mode = "test".
- For mock mode, prefer timer.mode = "sectional" only when sectional timing is required.
- Quiz default duration = number of questions × 36 seconds, converted to minutes.
- Mock sectional default = 15 minutes per section.