import test from 'node:test';
import assert from 'node:assert/strict';
import { getQuiz, submitQuiz } from '../src/api.js';

function setup(data) {
  globalThis.localStorage = { getItem: () => 'test-token', removeItem() {} };
  globalThis.fetch = async () => ({ status: 200, ok: true, text: async () => JSON.stringify(data) });
}

const weightedResult = {
  score: 3, maxScore: 6, percentage: 50, accuracy: 33.33,
  totalQuestions: 3, correctCount: 1, incorrectCount: 1, unansweredCount: 1,
  questionResults: [
    { id: 1, difficulty: 'Easy', maxPoints: 1, pointsAwarded: 0, answered: false, correct: false },
    { id: 2, difficulty: 'Medium', maxPoints: 2, pointsAwarded: 0, answered: true, correct: false },
    { id: 3, difficulty: 'Hard', maxPoints: 3, pointsAwarded: 3, answered: true, correct: true },
  ],
};

test('quiz loading preserves the difficulty and points needed for the badge', async () => {
  setup([{ id: 1, question: 'Question', difficulty: 'Hard', points: 3,
    option1: 'A', option2: 'B', option3: 'C', option4: 'D' }]);
  const [question] = await getQuiz(9);
  assert.equal(question.difficulty, 'Hard');
  assert.equal(question.points, 3);
  assert.deepEqual(question.options, ['A', 'B', 'C', 'D']);
});

test('maximum score and question count come from the full backend quiz, even for partial submissions', async () => {
  setup(weightedResult);
  const result = await submitQuiz(9, [{ questionId: 3, response: 'A' }]);
  assert.equal(result.maxScore, 6);
  assert.equal(result.totalQuestions, 3);
  assert.equal(result.percentage, 50);
  assert.equal(result.accuracy, 33.33);
  assert.equal(result.questionResults.length, 3);
});

test('missing, inflated or inconsistent scoring totals fail instead of showing a misleading percentage', async () => {
  for (const bad of [
    { score: 3, questionResults: [] },
    { ...weightedResult, score: 7 },
    { ...weightedResult, percentage: 150 },
    { ...weightedResult, correctCount: 3 },
    { ...weightedResult, maxScore: -1 },
  ]) {
    setup(bad);
    await assert.rejects(submitQuiz(9, []), /Unexpected quiz result/);
  }
});

test('an empty quiz result keeps zero percentages and avoids a division by zero', async () => {
  setup({ score: 0, maxScore: 0, percentage: 0, accuracy: 0, totalQuestions: 0,
    correctCount: 0, incorrectCount: 0, unansweredCount: 0, questionResults: [] });
  assert.equal((await submitQuiz(9, [])).percentage, 0);
});
