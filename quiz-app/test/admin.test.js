import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuestionPayload } from '../src/questionForm.js';
import { getStoredUser, consumeOAuthRedirect } from '../src/auth.js';
import { apiRequest, getAdminQuestions, createAdminQuestion, updateAdminQuestion, deleteAdminQuestion,
  createQuiz, getQuiz, submitQuiz } from '../src/api.js';

function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
}
function setup() { globalThis.localStorage = storage(); globalThis.sessionStorage = storage(); }
function token(claims) { return `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`; }
function response(status, data) { return { status, ok: status >= 200 && status < 300, text: async () => data === undefined ? '' : JSON.stringify(data) }; }
const draft = { category: 'Java', difficulty: 'Easy', question: ' Question ',
  option1: ' A ', option2: 'B', option3: 'C', option4: 'D', correctOption: '0' };

test('question payload trims fields and maps selected option to answer text', () => {
  assert.equal(buildQuestionPayload(draft).rightAnswer, 'A');
  assert.equal(buildQuestionPayload(draft).question, 'Question');
  assert.equal(buildQuestionPayload({ ...draft, option1: 'Changed option' }).rightAnswer, 'Changed option');
});
test('question form rejects duplicates, blank options, invalid selection and unknown topics', () => {
  for (const bad of [{ ...draft, option2: 'A' }, { ...draft, option3: ' ' },
    { ...draft, correctOption: '' }, { ...draft, correctOption: '7' }, { ...draft, category: 'Unknown' }])
    assert.throws(() => buildQuestionPayload(bad));
});
test('JWT display decoding supports base64url and Unicode names', () => {
  setup(); localStorage.setItem('jwt', token({ sub: 'owner@example.com', name: 'Zeeshan محمد', exp: Date.now() / 1000 + 100 }));
  assert.equal(getStoredUser().name, 'Zeeshan محمد');
});
test('expired or malformed stored JWTs are cleared', () => {
  for (const value of [token({ sub: 'user@example.com', exp: 1 }), 'broken', token({ sub: 'user@example.com' })]) {
    setup(); localStorage.setItem('jwt', value); assert.equal(getStoredUser(), null); assert.equal(localStorage.getItem('jwt'), null);
  }
});
test('OAuth redirect consumes fragment once and clears URL before rendering', () => {
  setup(); const value = token({ sub: 'owner@example.com', exp: Date.now() / 1000 + 100 });
  let cleaned = false;
  globalThis.window = { location: { pathname: '/oauth2/redirect', search: '', hash: `#token=${value}` },
    history: { replaceState: () => { cleaned = true; } } };
  assert.equal(consumeOAuthRedirect(), null); assert.equal(localStorage.getItem('jwt'), value); assert.ok(cleaned);
});
test('failed Google sign-in clears prior authentication', () => {
  setup(); localStorage.setItem('jwt', 'old');
  globalThis.window = { location: { pathname: '/oauth2/redirect', search: '?error=unverified_email', hash: '' }, history: { replaceState() {} } };
  assert.match(consumeOAuthRedirect(), /verified Google email/); assert.equal(localStorage.getItem('jwt'), null);
});
test('401 clears token; 403 preserves user session and reports authorization failure', async () => {
  setup(); localStorage.setItem('jwt', 'token'); globalThis.fetch = async () => response(403, {});
  await assert.rejects(apiRequest('/admin/questions'), error => error.status === 403);
  assert.equal(localStorage.getItem('jwt'), 'token');
  globalThis.fetch = async () => response(401, {});
  await assert.rejects(apiRequest('/admin/questions'), error => error.status === 401);
  assert.equal(localStorage.getItem('jwt'), null);
});
test('admin adapter uses documented list/create/update/delete contract and bearer header', async () => {
  setup(); localStorage.setItem('jwt', 'token'); const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, ...options }); return response(options.method === 'GET' ? 200 : 204, options.method === 'GET' ? [] : undefined); };
  await getAdminQuestions('Spring Boot'); await createAdminQuestion(buildQuestionPayload(draft));
  await updateAdminQuestion(12, buildQuestionPayload(draft)); await deleteAdminQuestion(12);
  assert.match(calls[0].url, /category=Spring%20Boot/);
  assert.deepEqual(calls.map(call => call.method), ['GET', 'POST', 'PUT', 'DELETE']);
  assert.ok(calls.every(call => call.headers.Authorization === 'Bearer token'));
  assert.equal(JSON.parse(calls[1].body).rightAnswer, 'A'); assert.match(calls[2].url, /admin\/questions\/12$/);
});
test('empty 204 response is accepted and server validation message is preserved', async () => {
  setup(); globalThis.fetch = async () => response(204);
  assert.equal(await apiRequest('/admin/questions/1', { method: 'DELETE' }), null);
  globalThis.fetch = async () => response(400, { message: 'Correct answer must match an option exactly.' });
  await assert.rejects(apiRequest('/admin/questions'), /Correct answer must match/);
});
test('existing quiz API contract remains compatible', async () => {
  setup(); globalThis.fetch = async () => response(201, 9);
  assert.deepEqual(await createQuiz('JavaQuiz', 'Java'), { id: 9 });
  globalThis.fetch = async () => response(200, [{ id: 1, question: 'Q', option1: 'A', option2: 'B' }]);
  assert.deepEqual((await getQuiz(9))[0].options, ['A', 'B']);
  globalThis.fetch = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), [{ id: 1, userResponse: 'A' }]);
    return response(200, { score: 1, questionResults: [] });
  };
  assert.equal((await submitQuiz(9, [{ questionId: 1, response: 'A' }])).score, 1);
});
