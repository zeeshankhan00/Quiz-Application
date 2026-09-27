// =====================================================================================
// ALL assumptions about your Spring Boot backend's request/response shapes live here.
// If your backend returns different field names, this is the ONLY file you need to edit.
// =====================================================================================

const BASE_URL = 'http://localhost:8080';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * POST /quiz/create?title=...&category=...
 *
 * CONFIRMED response: a raw integer — the new quiz's id (e.g. 5, 6, 7),
 * or -1 if creation failed.
 */
export async function createQuiz(title, category) {
  const url = `${BASE_URL}/quiz/create?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const bodyText = await res.text();

  if (res.status === 401 || res.status === 403) {
    throw new Error('Session expired. Please sign in again.');
  }

  const id = Number(bodyText);

  if (!res.ok || Number.isNaN(id) || id === -1) {
    throw new Error(`Failed to create quiz: ${bodyText}`);
  }

  return { id };
}

/**
 * GET /quiz/get/{id}
 *
 * CONFIRMED response shape: an array of question objects, e.g.
 *   [
 *     {
 *       "id": 1,
 *       "question": "Which keyword is used to inherit a class in Java?",
 *       "option1": "implements",
 *       "option2": "extends",
 *       "option3": "inherits",
 *       "option4": "super"
 *     },
 *     ...
 *   ]
 */
export async function getQuiz(id) {
  const res = await fetch(`${BASE_URL}/quiz/get/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch quiz (status ${res.status})`);
  }

  const data = await res.json();
  const rawQuestions = Array.isArray(data) ? data : (data.questions || data.questionList || []);

  return rawQuestions.map(normalizeQuestion);
}

function normalizeQuestion(q) {
  const id = q.id ?? q.questionId;
  // Confirmed backend field is `question`; other names kept as fallbacks just in case.
  const text = q.question ?? q.questionTitle ?? q.questionText ?? q.title ?? '';
  const options = Array.isArray(q.options)
      ? q.options
      : [q.option1, q.option2, q.option3, q.option4].filter((o) => o !== undefined && o !== null && o !== '');

  return { id, text, options, raw: q };
}

/**
 * POST /quiz/submit/{id}
 *
 * CONFIRMED request body: an array of { id, userResponse }, same as before.
 *
 * UPDATED response shape (backend now returns full detail, not just a raw integer):
 *   {
 *     "score": 7,
 *     "questionResults": [
 *       {
 *         "id": 1,
 *         "question": "Which keyword is used to inherit a class in Java?",
 *         "option1": "implements",
 *         "option2": "extends",
 *         "option3": "inherits",
 *         "option4": "super",
 *         "userResponse": "extends",
 *         "rightAnswer": "extends",
 *         "correct": true
 *       },
 *       ...
 *     ]
 *   }
 */
export async function submitQuiz(id, answers) {
  const payload = answers.map((a) => ({ id: a.questionId, userResponse: a.response ?? '' }));

  const res = await fetch(`${BASE_URL}/quiz/submit/${id}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const bodyText = await res.text();
    throw new Error(`Failed to submit quiz (status ${res.status}): ${bodyText}`);
  }

  const data = await res.json();

  if (typeof data.score !== 'number') {
    throw new Error('Unexpected /quiz/submit response: missing score');
  }

  return {
    score: data.score,
    total: answers.length,
    questionResults: data.questionResults || [],
  };
}